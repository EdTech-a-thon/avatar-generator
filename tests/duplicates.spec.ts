import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const fixture = (name: string) =>
  path.join(import.meta.dirname, "fixtures", name);

/** The skin tone the imported Maya was built with, so we can tell the two apart. */
const IMPORTED_MAYA_SKIN = "#f0bb95";

function importCutout(page: Page, file: string) {
  return page
    .getByLabel("Add pictures students turned in")
    .setInputFiles(fixture(file));
}

function marker(page: Page) {
  return page
    .getByRole("listitem")
    .filter({ hasText: "There's already a Maya" });
}

/** A child at the Teacher's laptop, in the tab "Add a student" opens. */
async function addInTab(page: Page, name: string, hair: string) {
  const opening = page.context().waitForEvent("page");
  await page.getByRole("button", { name: "Add a student" }).click();
  const tab = await opening;
  await tab.getByRole("button", { name: "Hair", exact: true }).click();
  await tab.getByRole("button", { name: hair, exact: true }).click();
  await tab.getByRole("button", { name: "Name", exact: true }).click();
  await tab.getByLabel("What's your first name?").fill(name);
  await tab.getByRole("button", { name: "I'm done" }).click();
  return tab;
}

test("a second Maya arriving by import is marked in the Class view", async ({
  page,
}) => {
  await page.goto("/");
  await importCutout(page, "cutout-maya.png");
  await importCutout(page, "cutout-maya.png");

  await expect(page.getByRole("listitem")).toHaveCount(2);
  await expect(marker(page)).toHaveCount(1);
  await expect(page.getByText("Replace their avatar instead?")).toBeVisible();
});

test('a second Maya from an "Add a student" tab is marked, and the child never sees it', async ({
  page,
}) => {
  await page.goto("/");
  await importCutout(page, "cutout-maya.png");
  const tab = await addInTab(page, "Maya", "Twists");

  await expect(marker(page)).toHaveCount(1);
  await expect(tab.getByText("There's already a Maya")).toHaveCount(0);
  await expect(tab.getByText("Maya is in the class.")).toBeVisible();
});

test("Replace leaves one Maya, wearing the Avatar that just arrived", async ({
  page,
}) => {
  await page.goto("/");
  await addInTab(page, "Maya", "Twists");
  await importCutout(page, "cutout-maya.png");

  await marker(page).getByRole("button", { name: "Replace" }).click();

  const maya = page.getByRole("img", { name: "Maya's avatar" });
  await expect(maya).toHaveCount(1);
  await expect(
    maya.locator(`path[fill="${IMPORTED_MAYA_SKIN}"]`).first(),
  ).toHaveCount(1);
  await expect(marker(page)).toHaveCount(0);
});

test("Keep both leaves two Mayas and puts the marker away", async ({
  page,
}) => {
  await page.goto("/");
  await importCutout(page, "cutout-maya.png");
  await importCutout(page, "cutout-maya.png");

  await marker(page).getByRole("button", { name: "Keep both" }).click();

  await expect(page.getByRole("img", { name: "Maya's avatar" })).toHaveCount(2);
  await expect(marker(page)).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("img", { name: "Maya's avatar" })).toHaveCount(2);
  await expect(marker(page)).toHaveCount(0);
});

test("an unanswered marker is still there after a reload", async ({ page }) => {
  await page.goto("/");
  await importCutout(page, "cutout-maya.png");
  await importCutout(page, "cutout-maya.png");

  await page.reload();
  await expect(marker(page)).toHaveCount(1);
});

test("a name that differs in capitalization is a different child", async ({
  page,
}) => {
  await page.goto("/");
  await importCutout(page, "cutout-maya.png");
  await addInTab(page, "maya", "Twists");

  await expect(page.getByRole("listitem")).toHaveCount(2);
  await expect(page.getByText("There's already a")).toHaveCount(0);
});
