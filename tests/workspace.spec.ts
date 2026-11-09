import { expect, test as base, type Page } from "@playwright/test";

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

async function enterDemo(page: Page, route: "/admin" | "/dashboard") {
  await page.goto(route);
  await page.getByRole("button", { name: route === "/admin" ? /Entrer en administrateur démo/ : /Entrer en client démo/ }).click();
  await expect(page.getByRole("main")).toBeVisible();
}

const hasHorizontalOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

for (const width of [375, 768, 1440]) {
  for (const route of ["/admin", "/admin/reservations", "/dashboard", "/dashboard/reservations"] as const) {
    test(`${route} renders the booking table without page overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await enterDemo(page, route.startsWith("/admin") ? "/admin" : "/dashboard");
      await page.goto(route);
      const table = page.getByRole("table");
      await expect(table).toBeVisible();
      await expect(table.getByRole("row").nth(1)).toBeVisible();
      expect(await hasHorizontalOverflow(page), `${route} should not scroll horizontally at ${width}px`).toBe(false);
    });
  }
}

test("booking details open in a dialog and close with Escape, restoring focus", async ({ page }) => {
  await enterDemo(page, "/dashboard");
  await page.goto("/dashboard/reservations");
  const trigger = page.getByRole("button", { name: "Détails de la réservation OCD-DEMO-002" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Boost" })).toBeVisible();
  await expect(dialog).toContainText("25 000 FCFA");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("an admin confirms a pending booking and the status updates in place", async ({ page }) => {
  await enterDemo(page, "/admin");
  await page.goto("/admin/reservations");
  const row = page.locator("#booking-OCD-DEMO-006");
  await expect(row).toContainText("En attente");
  await row.getByRole("button", { name: "Confirmer la réservation OCD-DEMO-006" }).click();
  await expect(row).toContainText("Confirmée");
  await expect(row.getByRole("button", { name: /^Confirmer/ })).toHaveCount(0);
});

test("a client cancels a booking only after confirming, which releases the action", async ({ page }) => {
  await enterDemo(page, "/dashboard");
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
  await enterDemo(page, "/dashboard");
  await page.goto("/dashboard/reservations");
  await expect(page.getByRole("button", { name: /^Confirmer la réservation/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Terminer la réservation/ })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "Client" })).toHaveCount(0);
});
