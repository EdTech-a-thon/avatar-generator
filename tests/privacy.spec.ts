import { expect, test } from "@playwright/test";
import path from "node:path";

const fixture = (name: string) =>
  path.join(import.meta.dirname, "fixtures", name);

test("a principal can read what the app keeps, from any screen", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Privacy: what this app keeps" })
    .click();

  await expect(
    page.getByRole("heading", { name: "Privacy", exact: true }),
  ).toBeVisible();
  for (const promise of [
    "Nothing is stored on any server.",
    "There are no accounts.",
    "There are no ads, no analytics and no tracking.",
    "Student data is never sold",
    "There are no photos.",
    "You can delete anything, any time.",
  ]) {
    await expect(page.getByText(promise)).toBeVisible();
  }

  await page.goto("/builder");
  await expect(
    page.getByRole("link", { name: "Privacy: what this app keeps" }),
  ).toBeVisible();
});

test("no screen asks any other website for anything", async ({
  page,
  baseURL,
}) => {
  const ours = new URL(baseURL!).origin;
  const outsiders: string[] = [];
  page.on("request", (request) => {
    const asked = new URL(request.url());
    // A picture the app made itself is a blob or data URL, not a request out.
    if (asked.protocol === "blob:" || asked.protocol === "data:") return;
    if (asked.origin !== ours) outsiders.push(request.url());
  });

  // The Class, with Students, chart pieces and the class file.
  await page.goto("/");
  await page
    .getByLabel("Add pictures students turned in")
    .setInputFiles([fixture("cutout-maya.png"), fixture("cutout-leo.png")]);
  await page.getByRole("button", { name: "Head and shoulders" }).click();
  await page.getByLabel("Give everyone the same face").check();
  await page.getByLabel("Give everyone the same clothes color").check();
  const savingSet = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download all cutouts" }).click();
  await savingSet;

  const savingFile = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download class file" }).click();
  await savingFile;

  // The Teacher's own Avatar, which walks through the Builder.
  await page.getByRole("button", { name: "Make my avatar" }).click();
  await page.getByRole("button", { name: "Hair", exact: true }).click();
  await page.getByRole("button", { name: "Bun", exact: true }).click();
  await page.getByRole("button", { name: "Save my avatar" }).click();
  await expect(page.getByRole("img", { name: "My avatar" })).toBeVisible();

  // A Student's own device: the Builder, saving a picture, and the privacy page.
  await page.goto("/builder");
  await page.getByRole("button", { name: "Name", exact: true }).click();
  await page.getByLabel("What's your first name?").fill("Ida");
  const savingCutout = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save my picture" }).click();
  await savingCutout;

  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { name: "Privacy", exact: true }),
  ).toBeVisible();

  expect(outsiders).toEqual([]);
});

test("the app serves its own font, rather than fetching one", async ({
  page,
  baseURL,
}) => {
  await page.goto("/");
  const font = await page.request.get(`${baseURL}/fonts/fredoka.woff2`);
  expect(font.ok()).toBe(true);
  expect(font.headers()["content-type"]).toContain("font");
});
