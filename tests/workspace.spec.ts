import { expect, test as base, type Browser, type Page } from "@playwright/test";
import { DEV_ADMIN_EMAIL, DEV_CLIENT_EMAIL, DEV_PASSWORD, DEV_SECOND_CLIENT_EMAIL } from "../scripts/dev-fixtures";

const test = base.extend<{ runtimeErrors: string[] }>({
  runtimeErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await use(errors);
      expect(errors, "The workspace pages should not throw browser errors").toEqual([]);
    },
    { auto: true },
  ],
});

async function submitLogin(page: Page, email: string, password = DEV_PASSWORD) {
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /Me connecter/ }).click();
}

async function login(page: Page, email: string) {
  await page.goto("/connexion", { waitUntil: "networkidle" });
  await submitLogin(page, email);
  await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page).toHaveURL(/\/(dashboard|admin)/);
}

async function loggedInPage(browser: Browser, email: string) {
  const page = await (await browser.newContext()).newPage();
  await login(page, email);
  return page;
}

const hasHorizontalOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

const areas = [
  { name: "admin", email: DEV_ADMIN_EMAIL, routes: ["/admin", "/admin/reservations", "/admin/calendrier", "/admin/clients", "/admin/forfaits", "/admin/notifications"] },
  { name: "client", email: DEV_CLIENT_EMAIL, routes: ["/dashboard", "/dashboard/reservations", "/dashboard/reserver", "/dashboard/forfaits", "/dashboard/profil"] },
];

for (const width of [375, 768, 1440]) {
  for (const area of areas) {
    test(`${area.name} pages fit a ${width}px viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await login(page, area.email);
      for (const route of area.routes) {
        await page.goto(route);
        await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
        expect(await hasHorizontalOverflow(page), `${route} should not scroll horizontally at ${width}px`).toBe(false);
      }
    });
  }
}

test.describe("access control", () => {
  test("anonymous visitors are sent to the login page", async ({ page }) => {
    await page.goto("/admin/clients");
    await expect(page).toHaveURL(/\/connexion$/);
    await page.goto("/dashboard/reservations");
    await expect(page).toHaveURL(/\/connexion\?next=%2Fdashboard%2Freservations$/);
  });

  test("an invented session cookie grants nothing", async ({ page, context }) => {
    await context.addCookies([{ name: "ocd_session", value: "invente", domain: "127.0.0.1", path: "/" }]);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/connexion/);
  });

  test("a client cannot open the administration, and an admin is sent to its own area", async ({ page, browser }) => {
    await login(page, DEV_CLIENT_EMAIL);
    await page.goto("/admin/clients");
    await expect(page).toHaveURL(/\/dashboard$/);
    const admin = await loggedInPage(browser, DEV_ADMIN_EMAIL);
    await admin.goto("/dashboard");
    await expect(admin).toHaveURL(/\/admin$/);
  });

  test("a client's pages carry no other client's data and no password hash", async ({ page }) => {
    await login(page, DEV_CLIENT_EMAIL);
    for (const route of ["/dashboard", "/dashboard/reserver"]) {
      const body = await (await page.request.get(route)).text();
      expect(body).toContain("Atelier Afi");
      for (const secret of ["Saveurs du pays", DEV_SECOND_CLIENT_EMAIL, "OCD-DEMO-005", "scrypt$", "passwordHash"]) expect(body).not.toContain(secret);
    }
  });

  test("the admin payload never contains password hashes", async ({ page }) => {
    await login(page, DEV_ADMIN_EMAIL);
    const body = await (await page.request.get("/admin/clients")).text();
    expect(body).toContain("Saveurs du pays");
    expect(body).not.toContain("scrypt$");
  });

  test("server actions enforce authorization when called directly", async ({ page, browser }) => {
    await login(page, DEV_CLIENT_EMAIL);
    await page.goto("/dashboard/reservations");
    const actionRequest = page.waitForRequest((request) => request.method() === "POST" && Boolean(request.headers()["next-action"]));
    await page.getByRole("button", { name: "Annuler la réservation OCD-DEMO-002" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Confirmer l’annulation" }).click();
    const action = (await actionRequest).headers()["next-action"];
    await expect(page.locator("#booking-OCD-DEMO-002")).toContainText("Annulée");

    const call = (target: Page, payload: unknown) => target.evaluate(async ([id, body]) => {
      const response = await fetch("/dashboard/reservations", { method: "POST", headers: { "Next-Action": id as string, "Content-Type": "text/plain;charset=UTF-8", Accept: "text/x-component" }, body: JSON.stringify(body) });
      return response.text();
    }, [action, [payload]] as const);

    expect(await call(page, { id: "OCD-DEMO-005", status: "cancelled" })).toContain("n’existe plus");
    expect(await call(page, { id: "OCD-DEMO-003", status: "confirmed" })).toContain("uniquement annuler");

    const admin = await loggedInPage(browser, DEV_ADMIN_EMAIL);
    await admin.goto("/admin/reservations");
    await expect(admin.locator("#booking-OCD-DEMO-005")).toContainText("Confirmée");
    await expect(admin.locator("#booking-OCD-DEMO-003")).toContainText("En attente");

    await page.context().clearCookies();
    expect(await call(page, { id: "OCD-DEMO-003", status: "cancelled" })).toContain("session a expiré");
  });
});

test.describe("authentication", () => {
  test("a visitor registers, lands in the client area and cannot reuse the e-mail", async ({ page }) => {
    const email = `nouveau-${Date.now()}@ocd-live.test`;
    const fillForm = async () => {
      await page.goto("/inscription", { waitUntil: "networkidle" });
      const values: Record<string, string> = { Prénom: "Yao", Nom: "Agbeko", "Adresse email": email, Téléphone: "+228 91 11 11 11", "Nom de l’entreprise": "Chez Yao", "Secteur d’activité": "Restauration", Pays: "Togo", Ville: "Kara", "Description de l’activité": "Un restaurant familial à Kara.", "Produits ou services commercialisés": "Plats traditionnels", "Mot de passe": "un-mot-de-passe-solide", "Confirmez le mot de passe": "un-mot-de-passe-solide" };
      for (const [label, value] of Object.entries(values)) await page.getByLabel(label, { exact: true }).fill(value);
      await page.getByRole("button", { name: /Créer mon compte/ }).click();
    };
    await fillForm();
    await expect(page.getByRole("heading", { name: "Bonjour, Yao." })).toBeVisible();
    await page.context().clearCookies();
    await fillForm();
    await expect(page.locator(".notice-error")).toContainText("déjà cette adresse");
  });

  test("a wrong password gives one generic message, the same as an unknown e-mail", async ({ page }) => {
    await page.goto("/connexion", { waitUntil: "networkidle" });
    await submitLogin(page, DEV_CLIENT_EMAIL, "mauvais-mot-de-passe");
    await expect(page.locator(".notice-error")).toHaveText("E-mail ou mot de passe incorrect.");
    await submitLogin(page, "inconnu@ocd-live.test", "mauvais-mot-de-passe");
    await expect(page.locator(".notice-error")).toHaveText("E-mail ou mot de passe incorrect.");
  });

  test("repeated failures on one account are throttled", async ({ page }) => {
    await page.goto("/connexion", { waitUntil: "networkidle" });
    for (let attempt = 0; attempt < 8; attempt++) {
      await submitLogin(page, "sena@ocd-live.test", "mauvais-mot-de-passe");
      await expect(page.getByRole("button", { name: /Me connecter/ })).toBeEnabled();
    }
    await submitLogin(page, "sena@ocd-live.test", DEV_PASSWORD);
    await expect(page.locator(".notice-error")).toContainText("Trop de tentatives");
  });

  test("an external redirect target is ignored", async ({ page }) => {
    await page.goto("/connexion?next=https://exemple.test/piege", { waitUntil: "networkidle" });
    await submitLogin(page, DEV_CLIENT_EMAIL);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("logging out revokes the session on the server", async ({ page, context }) => {
    await login(page, DEV_CLIENT_EMAIL);
    const stolen = (await context.cookies()).filter((cookie) => cookie.name === "ocd_session");
    expect(stolen).toHaveLength(1);
    expect(stolen[0].httpOnly).toBe(true);
    await page.getByRole("button", { name: "Déconnexion" }).click();
    await expect(page).toHaveURL(/\/connexion$/);
    await context.addCookies(stolen);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/connexion/);
  });
});

async function pickFirstSlot(page: Page, offer: RegExp) {
  await page.goto("/dashboard/reserver", { waitUntil: "networkidle" });
  await page.getByRole("radio", { name: offer }).check();
  await page.getByRole("radio", { name: /À l’agence/ }).check();
  await page.locator("button[aria-pressed]:not([disabled])").first().click();
  await page.getByRole("button", { name: /^\d\d h – \d\d h$/ }).first().click();
}

const submitBooking = (page: Page) => page.getByRole("button", { name: /Envoyer ma demande/ }).click();

test.describe("booking", () => {
  test("a booking reaches the manager's dashboard, whose open page updates by itself", async ({ page, browser }) => {
    const admin = await loggedInPage(browser, DEV_ADMIN_EMAIL);
    await admin.goto("/admin/notifications");
    const alert = admin.getByText("Saveurs du pays souhaite réserver le forfait Découverte.");
    await expect(alert).toHaveCount(0);

    await login(page, DEV_SECOND_CLIENT_EMAIL);
    await pickFirstSlot(page, /Découverte/);
    await submitBooking(page);
    await expect(page.getByRole("heading", { name: "Votre demande est enregistrée." })).toBeVisible();
    const reference = (await page.locator("strong", { hasText: /^OCD-/ }).innerText()).trim();

    await expect(alert).toBeVisible({ timeout: 40_000 });
    await admin.locator("li", { has: alert }).getByRole("button", { name: "Marquer comme lu" }).click();
    await expect(admin.locator("li", { has: alert }).getByText("Nouveau")).toHaveCount(0);

    await admin.goto("/admin/reservations");
    await expect(admin.locator(`#booking-${reference}`)).toContainText("Saveurs du pays");
    await page.goto("/dashboard/reservations");
    await expect(page.locator(`#booking-${reference}`)).toContainText("En attente");
  });

  test("a multi-session offer needs all its slots before it can be sent", async ({ page }) => {
    await login(page, DEV_SECOND_CLIENT_EMAIL);
    await pickFirstSlot(page, /Semaine Starter/);
    await expect(page.getByRole("button", { name: /Envoyer ma demande/ })).toBeDisabled();
    await expect(page.getByRole("status").filter({ hasText: "Choisissez encore 2 créneaux" })).toBeVisible();
  });

  test("when two clients want the same slot, only the first gets it", async ({ page, browser }) => {
    await login(page, DEV_CLIENT_EMAIL);
    await pickFirstSlot(page, /Découverte/);
    const rival = await loggedInPage(browser, DEV_SECOND_CLIENT_EMAIL);
    await pickFirstSlot(rival, /Découverte/);
    await submitBooking(rival);
    await expect(rival.getByRole("heading", { name: "Votre demande est enregistrée." })).toBeVisible();
    await submitBooking(page);
    await expect(page.locator(".notice-error")).toContainText(/créneau/i);
    await expect(page.getByRole("heading", { name: "Votre demande est enregistrée." })).toHaveCount(0);
  });
});

test.describe("bookings table", () => {
  test("booking details open in a dialog and close with Escape, restoring focus", async ({ page }) => {
    await login(page, DEV_CLIENT_EMAIL);
    await page.goto("/dashboard/reservations");
    const trigger = page.getByRole("button", { name: "Détails de la réservation OCD-DEMO-001" });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Découverte" })).toBeVisible();
    await expect(dialog).toContainText(/15\s*000\s*FCFA/);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("an admin confirms a pending booking and the status updates in place", async ({ page }) => {
    await login(page, DEV_ADMIN_EMAIL);
    await page.goto("/admin/reservations");
    const row = page.locator("#booking-OCD-DEMO-006");
    await expect(row).toContainText("En attente");
    await row.getByRole("button", { name: "Confirmer la réservation OCD-DEMO-006" }).click();
    await expect(row).toContainText("Confirmée");
    await expect(row.getByRole("button", { name: /^Confirmer/ })).toHaveCount(0);
  });

  test("a client cancels a booking only after confirming, which frees the action", async ({ page }) => {
    await login(page, DEV_CLIENT_EMAIL);
    await page.goto("/dashboard/reservations");
    const row = page.locator("#booking-OCD-DEMO-003");
    await row.getByRole("button", { name: "Annuler la réservation OCD-DEMO-003" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Revenir" }).click();
    await expect(row).toContainText("En attente");
    await row.getByRole("button", { name: "Annuler la réservation OCD-DEMO-003" }).click();
    await dialog.getByRole("button", { name: "Confirmer l’annulation" }).click();
    await expect(dialog).toBeHidden();
    await expect(row).toContainText("Annulée");
    await expect(row.getByRole("button", { name: /^Annuler/ })).toHaveCount(0);
  });

  test("clients never see admin-only actions", async ({ page }) => {
    await login(page, DEV_CLIENT_EMAIL);
    await page.goto("/dashboard/reservations");
    await expect(page.getByRole("button", { name: /^Confirmer la réservation/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Terminer la réservation/ })).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: "Client" })).toHaveCount(0);
  });
});

test.describe("administration", () => {
  test("the client sheet shows the profile and history", async ({ page }) => {
    await login(page, DEV_ADMIN_EMAIL);
    await page.goto("/admin/clients");
    await page.getByRole("button", { name: "Fiche de Maison Sena" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Sena Lawson");
    await expect(dialog).toContainText("OCD-DEMO-007");
  });

  test("a profile edit is saved", async ({ page }) => {
    await login(page, DEV_SECOND_CLIENT_EMAIL);
    await page.goto("/dashboard/profil", { waitUntil: "networkidle" });
    await page.getByLabel("Ville", { exact: true }).fill("Sokodé");
    await page.getByRole("button", { name: /Enregistrer les modifications/ }).click();
    await expect(page.getByRole("status").filter({ hasText: "bien été enregistré" })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Ville", { exact: true })).toHaveValue("Sokodé");
  });

  test("a price edited by the admin reaches the public site", async ({ page }) => {
    await login(page, DEV_ADMIN_EMAIL);
    await page.goto("/admin/forfaits", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Modifier le forfait Découverte" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Tarif (FCFA)").fill("17500");
    await dialog.getByRole("button", { name: "Enregistrer" }).click();
    await expect(dialog).toBeHidden();
    await page.goto("/forfaits");
    await expect(page.getByRole("article").filter({ hasText: "Découverte" })).toContainText(/17\s*500/);
  });
});
