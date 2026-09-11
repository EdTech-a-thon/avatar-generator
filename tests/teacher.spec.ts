import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const fixture = (name: string) =>
  path.join(import.meta.dirname, "fixtures", name);

async function makeMyAvatar(page: Page, hair: string) {
  await page.getByRole("button", { name: /my avatar/ }).click();
  await expect(page.getByText("Building your own avatar.")).toBeVisible();
  await page.getByRole("button", { name: "Hair", exact: true }).click();
  await page.getByRole("button", { name: hair, exact: true }).click();
  await page.getByRole("button", { name: "Save my avatar" }).click();
  await expect(page.getByRole("img", { name: "My avatar" })).toBeVisible();
}

test("a Teacher builds their own Avatar in the same Builder, with no name question", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Make my avatar" }).click();

  await expect(
    page.getByRole("heading", { name: "Pick your skin tone" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Name", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByLabel("What's your first name?")).toHaveCount(0);

  await page.getByRole("button", { name: "Hair", exact: true }).click();
  await page.getByRole("button", { name: "Bun", exact: true }).click();
  await page.getByRole("button", { name: "Save my avatar" }).click();

  await expect(page.getByRole("img", { name: "My avatar" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Change my avatar" }),
  ).toBeVisible();
});

test("the Teacher's Avatar is never a Student, and outlives their Classes", async ({
  page,
}) => {
  await page.goto("/");
  await makeMyAvatar(page, "Bun");
  await page
    .getByLabel("Add pictures students turned in")
    .setInputFiles(fixture("cutout-ava.png"));

  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(
    page.getByRole("listitem").filter({ hasText: "Ava" }),
  ).toHaveCount(1);

  await page.getByText("Classes", { exact: true }).click();
  await page.getByRole("button", { name: "Delete this class" }).click();
  await page.getByRole("button", { name: "Yes, delete this class" }).click();

  await expect(page.getByRole("img", { name: "My avatar" })).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(0);
});

test("a Teacher reopens their own Avatar and changes it", async ({ page }) => {
  await page.goto("/");
  await makeMyAvatar(page, "Bun");

  await page.getByRole("button", { name: "Change my avatar" }).click();
  await page.getByRole("button", { name: "Hair", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Bun", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Hair color", exact: true }).click();
  await page.getByRole("button", { name: "Gray hair", exact: true }).click();
  await page.getByRole("button", { name: "Save my avatar" }).click();

  await expect(
    page
      .getByRole("img", { name: "My avatar" })
      .locator('path[fill="#8a8a8a"]')
      .first(),
  ).toHaveCount(1);

  await page.reload();
  await expect(
    page
      .getByRole("img", { name: "My avatar" })
      .locator('path[fill="#8a8a8a"]')
      .first(),
  ).toHaveCount(1);
});
