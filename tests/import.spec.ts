import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const fixture = (name: string) =>
  path.join(import.meta.dirname, "fixtures", name);

function drop(page: Page, ...files: string[]) {
  return page
    .getByLabel("Add pictures students turned in")
    .setInputFiles(files.map(fixture));
}

test("a whole set of turned-in pictures becomes Students in one go", async ({
  page,
}) => {
  await page.goto("/");
  await drop(page, "cutout-maya.png", "cutout-leo.png", "cutout-ava.png");

  await expect(page.getByRole("listitem")).toHaveCount(3);
  for (const name of ["Maya", "Leo", "Ava"]) {
    await expect(
      page.getByRole("img", { name: `${name}'s avatar` }),
    ).toBeVisible();
  }
  await expect(page.getByText("Added Maya, Leo and Ava.")).toBeVisible();
});

test("the same Cutout dropped twice makes two Students, never a match", async ({
  page,
}) => {
  await page.goto("/");
  await drop(page, "cutout-maya.png");
  await drop(page, "cutout-maya.png");
  await expect(
    page.getByRole("listitem").filter({ hasText: "Maya" }),
  ).toHaveCount(2);
});

test("a picture with no name inside waits for the Teacher to type one", async ({
  page,
}) => {
  await page.goto("/");
  await drop(page, "no-name-cutout.png");

  await expect(page.getByRole("listitem")).toHaveCount(0);
  await page
    .getByLabel("This picture has no name inside. Who is it?")
    .fill("Sam");
  await page.getByRole("button", { name: "Add this student" }).click();

  await expect(
    page.getByRole("listitem").filter({ hasText: "Sam" }),
  ).toHaveCount(1);
  await expect(page.getByRole("img", { name: "Sam's avatar" })).toBeVisible();
});

test("a re-saved picture and a file that is not a picture each say what went wrong", async ({
  page,
}) => {
  await page.goto("/");
  await drop(page, "no-avatar-data.png", "not-a-cutout.txt");

  await expect(
    page.getByText(
      "This picture doesn't have avatar info inside. Ask the student to turn in the saved file, not a screenshot.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("That file isn't a cutout from this app."),
  ).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(0);
});

test("a mixed drop adds what it can and reports the rest together", async ({
  page,
}) => {
  await page.goto("/");
  await drop(
    page,
    "cutout-maya.png",
    "no-avatar-data.png",
    "not-a-cutout.txt",
    "cutout-leo.png",
  );

  await expect(page.getByRole("listitem")).toHaveCount(2);
  await expect(page.getByText("Added Maya and Leo.")).toBeVisible();
  await expect(page.getByText("no-avatar-data.png:")).toBeVisible();
  await expect(page.getByText("not-a-cutout.txt:")).toBeVisible();
});

test("imported Students are still there after a reload", async ({ page }) => {
  await page.goto("/");
  await drop(page, "cutout-ava.png");
  await page.reload();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Ava" }),
  ).toHaveCount(1);
});
