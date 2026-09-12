import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const fixture = (name: string) =>
  path.join(import.meta.dirname, "fixtures", name);

function importCutout(page: Page, file: string) {
  return page
    .getByLabel("Add pictures students turned in")
    .setInputFiles(fixture(file));
}

function card(page: Page, name: string) {
  return page.getByRole("listitem").filter({ hasText: name });
}

/** Class settings stay folded away until a Teacher asks to manage classes. */
async function openClasses(page: Page) {
  if (await page.getByRole("button", { name: "Add class" }).isVisible()) return;
  await page.getByRole("button", { name: "Manage classes" }).click();
  await expect(page.getByRole("button", { name: "Add class" })).toBeVisible();
}

test("a Teacher sets up the whole class from a list of names, then one student makes their avatar", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add student names" }).click();
  await page.getByLabel("Student first names").fill("Maya\nLeo\n\nAva R.\n");
  await page.getByRole("button", { name: "Add 3 names to class" }).click();

  await expect(page.getByText("0 avatars ready · 3 to make")).toBeVisible();
  await expect(card(page, "Ava R.")).toHaveCount(1);

  // A name with no Avatar yet is not a chart piece: the set waits for it.
  await expect(page.getByRole("button", { name: "Download set" })).toHaveCount(
    0,
  );

  await card(page, "Maya").getByRole("button", { name: "Make avatar" }).click();
  await expect(page.getByText("Changing Maya's avatar.")).toBeVisible();
  await page.getByRole("button", { name: "Hair", exact: true }).click();
  await page.getByRole("button", { name: "Afro", exact: true }).click();
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("img", { name: "Maya's avatar" })).toBeVisible();
  await expect(page.getByText("1 avatar ready · 2 to make")).toBeVisible();

  await page.reload();
  await expect(page.getByText("1 avatar ready · 2 to make")).toBeVisible();
});

test("a Teacher finds one student in a long class list", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add student names" }).click();
  await page.getByLabel("Student first names").fill("Maya\nLeo\nAva R.");
  await page.getByRole("button", { name: "Add 3 names to class" }).click();

  await page.getByLabel("Find a student").fill("av");
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(card(page, "Ava R.")).toBeVisible();

  await page.getByLabel("Find a student").fill("zz");
  await expect(page.getByText("No students match “zz”.")).toBeVisible();
});

test("switching classes in the picker shows that class's students", async ({
  page,
}) => {
  await page.goto("/");
  await importCutout(page, "cutout-maya.png");

  await openClasses(page);
  await page.getByLabel("Name for a new class").fill("Reading group");
  await page.getByRole("button", { name: "Add class" }).click();
  await expect(page.getByRole("img", { name: "Maya's avatar" })).toHaveCount(0);

  await page
    .getByLabel("Current class")
    .selectOption({ label: "My class · 1 student" });
  await expect(page.getByRole("img", { name: "Maya's avatar" })).toBeVisible();
});

test("a Teacher tidies up a Display Name, and it stays tidied", async ({
  page,
}) => {
  await page.goto("/");
  await importCutout(page, "cutout-maya.png");

  await card(page, "Maya").getByRole("button", { name: "Rename" }).click();
  await page.getByLabel("New name for Maya").fill("Maya R.");
  await page.getByRole("button", { name: "Save name" }).click();

  await expect(card(page, "Maya R.")).toHaveCount(1);
  await page.reload();
  await expect(card(page, "Maya R.")).toHaveCount(1);
});

test("a Teacher changes a Student's Avatar and keeps their name", async ({
  page,
}) => {
  await page.goto("/");
  await importCutout(page, "cutout-maya.png");

  await card(page, "Maya")
    .getByRole("button", { name: "Change avatar" })
    .click();
  await expect(page.getByText("Changing Maya's avatar.")).toBeVisible();
  // The Builder opens on what Maya already chose.
  await page.getByRole("button", { name: "Hair", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Long hair", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  // Nobody is asked a name: Maya already has one.
  await expect(
    page.getByRole("button", { name: "Name", exact: true }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Skin", exact: true }).click();
  await page.getByRole("button", { name: "Skin tone 10", exact: true }).click();
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("img", { name: "Maya's avatar" })).toBeVisible();
  await page.reload();
  await expect(
    page
      .getByRole("img", { name: "Maya's avatar" })
      .locator('path[fill="#3d2616"]')
      .first(),
  ).toHaveCount(1);
});

test("removing a Student asks first, and then means it", async ({ page }) => {
  await page.goto("/");
  await importCutout(page, "cutout-leo.png");

  await card(page, "Leo").getByRole("button", { name: "Remove" }).click();
  await expect(
    page.getByText("Remove Leo and their avatar for good?"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("img", { name: "Leo's avatar" })).toBeVisible();

  await card(page, "Leo").getByRole("button", { name: "Remove" }).click();
  await page.getByRole("button", { name: "Yes, remove" }).click();
  await expect(page.getByRole("img", { name: "Leo's avatar" })).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("img", { name: "Leo's avatar" })).toHaveCount(0);
});

test("one Class keeps the class settings folded away", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Add class" })).toBeHidden();

  await openClasses(page);
  await expect(page.getByRole("button", { name: "Add class" })).toBeVisible();
  // The class picker is always on screen, holding the one Class a Teacher has.
  await expect(page.getByLabel("Current class")).toHaveValue(/.+/);
});

test("a specials Teacher makes several Classes, switches and renames them", async ({
  page,
}) => {
  await page.goto("/");
  await importCutout(page, "cutout-maya.png");

  await openClasses(page);
  await page.getByLabel("Name for a new class").fill("Reading group");
  await page.getByRole("button", { name: "Add class" }).click();

  await expect(
    page.getByRole("heading", { name: "Reading group" }),
  ).toBeVisible();
  await expect(page.getByText("No students yet.")).toBeVisible();

  await openClasses(page);
  await page.getByLabel("Rename this class").fill("Tuesday reading");
  await page.getByRole("button", { name: "Save class name" }).click();
  await expect(
    page.getByRole("heading", { name: "Tuesday reading" }),
  ).toBeVisible();

  await page
    .getByLabel("Current class")
    .selectOption({ label: "My class · 1 student" });
  await expect(page.getByRole("img", { name: "Maya's avatar" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "My class" })).toBeVisible();
});

test("deleting a Class asks first and takes its Students with it", async ({
  page,
}) => {
  await page.goto("/");
  await openClasses(page);
  await page.getByLabel("Name for a new class").fill("Reading group");
  await page.getByRole("button", { name: "Add class" }).click();
  await importCutout(page, "cutout-ava.png");

  await openClasses(page);
  await page.getByRole("button", { name: "Delete this class" }).click();
  await expect(
    page.getByText("Delete Reading group and its 1 student for good?"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Yes, delete this class" }).click();

  await expect(page.getByRole("heading", { name: "My class" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Ava's avatar" })).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("img", { name: "Ava's avatar" })).toHaveCount(0);
});

test('"Add a student" adds to the Class it was opened from, whatever this tab shows now', async ({
  page,
}) => {
  await page.goto("/");
  const opening = page.context().waitForEvent("page");
  await page.getByRole("button", { name: "Add a student" }).click();
  const tab = await opening;

  await openClasses(page);
  await page.getByLabel("Name for a new class").fill("Reading group");
  await page.getByRole("button", { name: "Add class" }).click();
  await expect(
    page.getByRole("heading", { name: "Reading group" }),
  ).toBeVisible();

  await tab.getByRole("button", { name: "Name", exact: true }).click();
  await tab.getByLabel("What's your first name?").fill("Ida");
  await tab.getByRole("button", { name: "I'm done" }).click();

  // Ida belongs to the Class the tab was opened from, not the one on screen.
  await expect(page.getByRole("img", { name: "Ida's avatar" })).toHaveCount(0);
  await page
    .getByLabel("Current class")
    .selectOption({ label: "My class · 1 student" });
  await expect(page.getByRole("img", { name: "Ida's avatar" })).toBeVisible();
});
