import { expect, test, type Browser, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const fixture = (name: string) =>
  path.join(import.meta.dirname, "fixtures", name);

function importCutouts(page: Page, ...files: string[]) {
  return page
    .getByLabel("Add pictures students turned in")
    .setInputFiles(files.map(fixture));
}

function loadFile(page: Page, file: string) {
  return page.getByLabel("Load a class file").setInputFiles(file);
}

async function downloadClassFile(page: Page) {
  const saving = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download class file" }).click();
  const saved = await saving;
  return { fileName: saved.suggestedFilename(), where: (await saved.path())! };
}

/** A second browser, as if the Teacher sat down at a different laptop. */
async function freshBrowser(browser: Browser, page: Page) {
  const context = await browser.newContext({
    baseURL: new URL(page.url()).origin,
  });
  const fresh = await context.newPage();
  await fresh.goto("/");
  return fresh;
}

async function makeMyAvatar(page: Page) {
  await page.getByRole("button", { name: "Make my avatar" }).click();
  await page.getByRole("button", { name: "Save my avatar" }).click();
  await expect(page.getByRole("img", { name: "My avatar" })).toBeVisible();
}

test("a Teacher downloads one file holding every Class and their own Avatar", async ({
  page,
}) => {
  await page.goto("/");
  await importCutouts(page, "cutout-maya.png", "cutout-leo.png");
  await makeMyAvatar(page);

  const { fileName, where } = await downloadClassFile(page);
  expect(fileName).toBe("My classes.json");

  const held = JSON.parse(await readFile(where, "utf8"));
  expect(held.version).toBe(1);
  expect(held.classes).toHaveLength(1);
  expect(
    held.classes[0].students.map((student: { name: string }) => student.name),
  ).toEqual(["Maya", "Leo"]);
  expect(held.teacherAvatar).toBeDefined();
});

test("a Class File brings everything back on another laptop, after asking", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await importCutouts(page, "cutout-maya.png", "cutout-leo.png");
  await makeMyAvatar(page);
  const { where } = await downloadClassFile(page);

  const fresh = await freshBrowser(browser, page);
  await expect(fresh.getByText("No students yet.")).toBeVisible();

  await loadFile(fresh, where);
  await expect(
    fresh.getByText("Loading this file replaces everything in this browser."),
  ).toBeVisible();
  await expect(
    fresh.getByText("The file has 1 class, 2 students, and your own avatar."),
  ).toBeVisible();
  await fresh.getByRole("button", { name: "Yes, replace everything" }).click();

  await expect(fresh.getByRole("img", { name: "Maya's avatar" })).toBeVisible();
  await expect(fresh.getByRole("img", { name: "Leo's avatar" })).toBeVisible();
  await expect(fresh.getByRole("img", { name: "My avatar" })).toBeVisible();

  await fresh.reload();
  await expect(fresh.getByRole("img", { name: "Maya's avatar" })).toBeVisible();
});

test("cancelling the load leaves this browser alone", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await importCutouts(page, "cutout-maya.png");
  const { where } = await downloadClassFile(page);

  const fresh = await freshBrowser(browser, page);
  await importCutouts(fresh, "cutout-ava.png");
  await loadFile(fresh, where);
  await fresh.getByRole("button", { name: "Cancel" }).click();

  await expect(fresh.getByRole("img", { name: "Ava's avatar" })).toBeVisible();
  await expect(fresh.getByRole("img", { name: "Maya's avatar" })).toHaveCount(
    0,
  );
});

test("a file that is not a Class File says so and changes nothing", async ({
  page,
}) => {
  await page.goto("/");
  await importCutouts(page, "cutout-ava.png");

  await loadFile(page, fixture("not-a-cutout.txt"));
  await expect(
    page.getByText("That file isn't a class file from this app."),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: "Ava's avatar" })).toBeVisible();
});

test("the Class File saved by v1 still loads with the same choices", async ({
  page,
}) => {
  await page.goto("/");
  await loadFile(page, fixture("golden-class-file.json"));
  await page.getByRole("button", { name: "Yes, replace everything" }).click();

  await expect(page.getByRole("img", { name: "Maya's avatar" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Leo's avatar" })).toBeVisible();
  await expect(page.getByRole("img", { name: "My avatar" })).toBeVisible();

  await page
    .getByRole("list", { name: "Students" })
    .getByRole("listitem")
    .filter({ hasText: "Maya" })
    .getByRole("button", { name: "Change avatar" })
    .click();
  for (const [step, choice] of [
    ["Skin", "Skin tone 3"],
    ["Hair", "Long hair"],
    ["Hair color", "Brown hair"],
    ["Face", "Big smile"],
    ["Clothes", "Purple clothes"],
  ]) {
    await page.getByRole("button", { name: step, exact: true }).click();
    await expect(
      page.getByRole("button", { name: choice, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
});

test("a Class File naming a part this version does not have falls back", async ({
  page,
}) => {
  await page.goto("/");
  await loadFile(page, fixture("class-file-out-of-range.json"));
  await page.getByRole("button", { name: "Yes, replace everything" }).click();

  await page
    .getByRole("list", { name: "Students" })
    .getByRole("listitem")
    .filter({ hasText: "Maya" })
    .getByRole("button", { name: "Change avatar" })
    .click();
  await page.getByRole("button", { name: "Hair", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Afro", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Face", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Smiling", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("the app never downloads a Class File on its own", async ({ page }) => {
  const downloads: unknown[] = [];
  await page.goto("/");
  page.on("download", (saved) => downloads.push(saved));

  await importCutouts(page, "cutout-maya.png");
  await page.reload();
  await expect(page.getByRole("img", { name: "Maya's avatar" })).toBeVisible();
  expect(downloads).toHaveLength(0);
});
