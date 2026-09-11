import { expect, test, type Page } from "@playwright/test";

const STEPS = ["Skin", "Hair", "Hair color", "Glasses", "Face", "Clothes"];

/** A child at the laptop: a couple of taps and their name. */
async function buildIn(tab: Page, name: string, hair = "Afro") {
  await tab.getByRole("button", { name: STEPS[1], exact: true }).click();
  await tab.getByRole("button", { name: hair, exact: true }).click();
  await tab.getByRole("button", { name: "Name", exact: true }).click();
  await tab.getByLabel("What's your first name?").fill(name);
  await tab.getByRole("button", { name: "I'm done" }).click();
}

async function openBuilderTab(page: Page) {
  const opening = page.context().waitForEvent("page");
  await page.getByRole("button", { name: "Add a student" }).click();
  const tab = await opening;
  await expect(
    tab.getByRole("heading", { name: "Pick your skin tone" }),
  ).toBeVisible();
  return tab;
}

test("a Class is waiting on the first visit, with no setup and no account", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "My class" })).toBeVisible();
  await expect(page.getByText("No students yet.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add a student" }),
  ).toBeVisible();
});

test("a child finishing in the Builder tab appears in the Class tab", async ({
  page,
}) => {
  await page.goto("/");
  const tab = await openBuilderTab(page);

  await buildIn(tab, "Maya");

  // The Class tab was never reloaded.
  await expect(
    page.getByRole("listitem").filter({ hasText: "Maya" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: "Maya's avatar" })).toBeVisible();
});

test("the Builder tab starts over for the next child, and never saves a file", async ({
  page,
}) => {
  await page.goto("/");
  const tab = await openBuilderTab(page);

  const downloads: unknown[] = [];
  tab.on("download", (saved) => downloads.push(saved));

  await buildIn(tab, "Maya");
  await expect(
    tab.getByText("Maya is in the class. The next student can start!"),
  ).toBeVisible();
  await expect(
    tab.getByRole("heading", { name: "Pick your skin tone" }),
  ).toBeVisible();
  await tab.getByRole("button", { name: "Name", exact: true }).click();
  await expect(tab.getByLabel("What's your first name?")).toHaveValue("");

  await tab.getByRole("button", { name: "Skin", exact: true }).click();
  await buildIn(tab, "Leo", "Twists");

  await expect(page.getByRole("listitem")).toHaveCount(2);
  await expect(
    page.getByRole("listitem").filter({ hasText: "Leo" }),
  ).toBeVisible();
  expect(downloads).toHaveLength(0);
});

test("the Class is still there after a reload", async ({ page }) => {
  await page.goto("/");
  const tab = await openBuilderTab(page);
  await buildIn(tab, "Ava");
  await expect(
    page.getByRole("listitem").filter({ hasText: "Ava" }),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Ava" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: "Ava's avatar" })).toBeVisible();
});
