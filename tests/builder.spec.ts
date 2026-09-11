import { expect, test, type Page } from "@playwright/test";

/** The Builder's steps are named on the buttons a Student taps to revisit one. */
function step(page: Page, name: string) {
  return page.getByRole("button", { name, exact: true });
}

function option(page: Page, name: string) {
  return page.getByRole("button", { name, exact: true });
}

function preview(page: Page) {
  return page.getByRole("img", { name: "Your avatar" });
}

/** A color a Student chose has to actually reach the picture they can see. */
async function expectPreviewUses(page: Page, color: string) {
  await expect(
    preview(page).locator(`path[fill="${color}"]`).first(),
  ).toHaveCount(1);
}

test("a Student builds an Avatar by picking pictures, and the preview keeps up", async ({
  page,
}) => {
  await page.goto("/builder");

  await expect(
    page.getByRole("heading", { name: "Pick your skin tone" }),
  ).toBeVisible();
  await option(page, "Skin tone 8").click();
  await expect(option(page, "Skin tone 8")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expectPreviewUses(page, "#6f4529");

  await step(page, "Hair").click();
  await option(page, "Afro").click();

  await step(page, "Hair color").click();
  await option(page, "Blonde hair").click();
  await expectPreviewUses(page, "#c9a227");

  await step(page, "Glasses").click();
  await option(page, "Round glasses").click();

  await step(page, "Face").click();
  await option(page, "Laughing").click();

  await step(page, "Clothes").click();
  await option(page, "Green clothes").click();

  await step(page, "Name").click();
  await expect(page.getByLabel("What's your first name?")).toBeVisible();
  await page.getByLabel("What's your first name?").fill("Maya");
  await expect(page.getByRole("button", { name: "I'm done" })).toBeEnabled();
});

test("the steps run in order from the first screen to the name question", async ({
  page,
}) => {
  await page.goto("/builder");
  const questions = [
    "Pick your skin tone",
    "Pick your hair",
    "Pick your hair color",
    "Do you wear glasses?",
    "Pick your favorite face",
    "Pick your clothes color",
    "What's your first name?",
  ];
  for (const [index, question] of questions.entries()) {
    await expect(page.getByRole("heading", { name: question })).toBeVisible();
    if (index < questions.length - 1)
      await page.getByRole("button", { name: "Next" }).click();
  }
});

test("going back to an earlier step keeps the later choices", async ({
  page,
}) => {
  await page.goto("/builder");
  await step(page, "Face").click();
  await option(page, "Cheeky").click();
  await step(page, "Name").click();
  await page.getByLabel("What's your first name?").fill("Leo");

  await step(page, "Skin").click();
  await option(page, "Skin tone 2").click();

  await step(page, "Face").click();
  await expect(option(page, "Cheeky")).toHaveAttribute("aria-pressed", "true");
  await step(page, "Name").click();
  await expect(page.getByLabel("What's your first name?")).toHaveValue("Leo");
});

test("the Builder offers the whole v1 catalog", async ({ page }) => {
  await page.goto("/builder");
  const counts: [string, number][] = [
    ["Pick your skin tone", 10],
    ["Pick your hair", 48],
    ["Pick your hair color", 6],
    ["Do you wear glasses?", 10],
    ["Pick your favorite face", 19],
    ["Pick your clothes color", 10],
  ];
  for (const [question, expected] of counts) {
    await expect(page.getByRole("heading", { name: question })).toBeVisible();
    await expect(
      page.getByRole("list", { name: question }).getByRole("button"),
    ).toHaveCount(expected);
    await page.getByRole("button", { name: "Next" }).click();
  }
});

test("a Student can finish with the keyboard alone", async ({ page }) => {
  await page.goto("/builder");
  await option(page, "Skin tone 3").focus();
  await page.keyboard.press("Enter");
  await expect(option(page, "Skin tone 3")).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await step(page, "Name").focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("What's your first name?").focus();
  await page.keyboard.type("Ava");
  await page.getByRole("button", { name: "I'm done" }).focus();
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("heading", { name: "Nice work, Ava!" }),
  ).toBeVisible();
});
