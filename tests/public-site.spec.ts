import { expect, test as base } from "@playwright/test";
import path from "node:path";

const test = base.extend<{ runtimeErrors: string[] }>({
  runtimeErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await use(errors);
      expect(
        errors,
        "The public pages should not throw browser errors",
      ).toEqual([]);
    },
    { auto: true },
  ],
});

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  for (const route of ["/", "/forfaits"]) {
    test(`${route} fits a ${width}px viewport and loads the supplied logo`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect
        .poll(
          () =>
            page
              .getByRole("heading", { level: 1 })
              .evaluate((element) =>
                parseFloat(getComputedStyle(element).fontSize),
              ),
          {
            message:
              "The page heading should receive its responsive CSS module styles",
          },
        )
        .toBeGreaterThan(32);
      await expect(page.locator("header")).toHaveCSS("position", "sticky");
      const pricingGrid = page
        .getByRole("heading", { name: "Boost", exact: true })
        .locator("..")
        .locator("..");
      await expect(pricingGrid).toHaveCSS("display", "grid");

      const logo = page
        .locator("header")
        .getByRole("img", { name: "OCD Live", exact: true });
      await expect(logo).toBeVisible();
      await expect
        .poll(() =>
          logo.evaluate((image) => {
            const img = image as HTMLImageElement;
            return img.complete && img.naturalWidth > 0;
          }),
        )
        .toBe(true);
      await expect(logo).toHaveAttribute("src", /ocd-logo/);

      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(
        dimensions.document,
        "Document should not overflow horizontally",
      ).toBeLessThanOrEqual(dimensions.viewport + 1);
      expect(
        dimensions.body,
        "Body should not overflow horizontally",
      ).toBeLessThanOrEqual(dimensions.viewport + 1);

      const artifact =
        width === 1440
          ? route === "/"
            ? "desktop-home.png"
            : "desktop-forfaits.png"
          : width === 375 && route === "/"
            ? "mobile-home.png"
            : null;
      if (artifact) {
        await page.screenshot({
          path: path.join("test-results", artifact),
          fullPage: true,
          animations: "disabled",
        });
        if (route === "/") {
          await page.screenshot({
            path: path.join(
              "test-results",
              artifact.replace(".png", "-viewport.png"),
            ),
            animations: "disabled",
          });
        }
      }
    });
  }
}

test("mobile navigation supports Escape, focus restoration, and link navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const toggle = page.getByRole("button", {
    name: "Ouvrir le menu",
    exact: true,
  });
  await toggle.click();
  await expect(
    page.getByRole("navigation", { name: "Navigation mobile" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Fermer le menu", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("navigation", { name: "Navigation mobile" }),
  ).toHaveCount(0);
  await expect(toggle).toBeFocused();

  await toggle.click();
  await page
    .getByRole("navigation", { name: "Navigation mobile" })
    .getByRole("link", { name: "Forfaits", exact: true })
    .click();
  await expect(page).toHaveURL(/\/forfaits$/);
  await expect(
    page.getByRole("navigation", { name: "Navigation mobile" }),
  ).toHaveCount(0);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("participation mode changes the explanation and preserves the selected state", async ({
  page,
}) => {
  await page.goto("/");
  const modes = page.getByRole("group", { name: "Mode de participation" });
  const agency = modes.getByRole("button", { name: /agence/ });
  const remote = modes.getByRole("button", { name: /distance/ });
  await expect(agency).toHaveAttribute("aria-pressed", "true");
  await remote.click();
  await expect(remote).toHaveAttribute("aria-pressed", "true");
  await expect(agency).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#participation-description")).toContainText(
    "Votre boutique devient un plateau.",
  );
  await expect(page.locator("#participation-description")).toContainText(
    "co-host",
  );
  await agency.click();
  await expect(page.locator("#participation-description")).toContainText(
    "Votre énergie. Notre studio.",
  );
});

test("FAQ uses a keyboard-operable native disclosure", async ({ page }) => {
  await page.goto("/");
  const disclosure = page.locator("details").first();
  const summary = disclosure.locator("summary");
  await expect(disclosure).not.toHaveAttribute("open", "");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("open", "");
  await expect(disclosure.locator("p")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(disclosure).not.toHaveAttribute("open", "");
  await expect(disclosure.locator("p")).not.toBeVisible();
});

test("calls to action lead to the real login page", async ({ page }) => {
  await page.goto("/");
  await page.locator("header").getByRole("link", { name: "Connexion", exact: true }).click();
  await expect(page).toHaveURL(/\/connexion$/);
  await page.goto("/");
  await page.locator("header").getByRole("link", { name: "Réserver un live" }).click();
  await expect(page).toHaveURL(/\/connexion\?next=%2Fdashboard%2Freserver$/);
});

test("six offers show the Boost price and lead to booking that offer", async ({
  page,
}) => {
  await page.goto("/forfaits");
  const offers = page.getByRole("region", {
    name: "Les six forfaits de promotion",
  });
  await expect(offers.getByRole("article")).toHaveCount(6);
  for (const name of [
    "Découverte",
    "Boost",
    "Business",
    "Semaine Starter",
    "Semaine Pro",
    "Mensuel Premium",
  ]) {
    await expect(
      offers.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  }
  await offers
    .getByRole("button", { name: "Choisir le forfait Boost", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Le forfait Boost" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(/25\s*000\s*FCFA/);
  await expect(dialog).toContainText("3 heures");
  await dialog.getByRole("link", { name: "Réserver ce forfait" }).click();
  await expect(page).toHaveURL(/\/connexion\?next=%2Fdashboard%2Freserver%3Fforfait%3Dboost$/);
});
