import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CUTOUT_KEYWORD, decodeCutoutData } from "../src/lib/cutout/codec";
import { hiddenText, readChunks } from "../src/lib/cutout/png";

const fixture = (name: string) =>
  path.join(import.meta.dirname, "fixtures", name);

const STEPS = ["Skin", "Hair", "Hair color", "Glasses", "Face", "Clothes"];
const CHOICES = [
  "Skin tone 8",
  "Afro",
  "Blonde hair",
  "Round glasses",
  "Laughing",
  "Green clothes",
];

async function build(page: Page, name: string, choices = CHOICES) {
  await page.goto("/builder");
  for (const [index, choice] of choices.entries()) {
    await page.getByRole("button", { name: STEPS[index], exact: true }).click();
    await page.getByRole("button", { name: choice, exact: true }).click();
  }
  await page.getByRole("button", { name: "Name", exact: true }).click();
  await page.getByLabel("What's your first name?").fill(name);
}

async function save(page: Page) {
  const saving = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save my picture" }).click();
  const saved = await saving;
  return {
    file: saved,
    bytes: new Uint8Array(await readFile((await saved.path())!)),
  };
}

/** The width, height and color type a PNG declares in its first chunk. */
function pictureShape(bytes: Uint8Array) {
  const header = readChunks(bytes).find((chunk) => chunk.type === "IHDR");
  if (!header) throw new Error("no IHDR");
  const view = new DataView(
    header.data.buffer,
    header.data.byteOffset,
    header.data.byteLength,
  );
  return {
    width: view.getUint32(0),
    height: view.getUint32(4),
    colorType: header.data[9],
  };
}

/** Asks the browser to read the picture back and report a corner pixel. */
async function cornerAlpha(page: Page, bytes: Uint8Array) {
  return page.evaluate(async (numbers) => {
    const picture = await createImageBitmap(
      new Blob([new Uint8Array(numbers)]),
    );
    const canvas = document.createElement("canvas");
    canvas.width = picture.width;
    canvas.height = picture.height;
    const surface = canvas.getContext("2d")!;
    surface.drawImage(picture, 0, 0);
    return surface.getImageData(0, 0, 1, 1).data[3];
  }, Array.from(bytes));
}

async function expectChoices(page: Page, choices = CHOICES) {
  for (const [index, choice] of choices.entries()) {
    await page.getByRole("button", { name: STEPS[index], exact: true }).click();
    await expect(
      page.getByRole("button", { name: choice, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
}

test("finishing saves a head-only picture with the Avatar hidden inside it", async ({
  page,
}) => {
  await build(page, "José");
  const { file, bytes } = await save(page);

  expect(file.suggestedFilename()).toBe("José.png");

  const shape = pictureShape(bytes);
  expect(shape.height).toBe(1400);
  expect(Math.max(shape.width, shape.height)).toBeLessThan(2000);
  // Color type 6 is the one with an alpha channel.
  expect(shape.colorType).toBe(6);
  expect(await cornerAlpha(page, bytes)).toBe(0);

  const held = decodeCutoutData(hiddenText(bytes, CUTOUT_KEYWORD)!);
  expect(held?.name).toBe("José");
  expect(held?.avatar).toEqual({
    skinTone: 7,
    hairstyle: 0,
    hairColor: 4,
    eyewear: 1,
    expression: 2,
    clothingColor: 3,
  });
});

test("the device remembers the last Avatar for tomorrow", async ({ page }) => {
  await build(page, "Ava");
  await save(page);

  await page.goto("/builder");
  await expectChoices(page);
  await page.getByRole("button", { name: "Name", exact: true }).click();
  await expect(page.getByLabel("What's your first name?")).toHaveValue("Ava");
});

test("a saved Cutout opens again with the same choices", async ({ page }) => {
  await page.goto("/builder");
  await page
    .getByLabel("Open my saved picture")
    .setInputFiles(fixture("golden-cutout.png"));

  await expectChoices(page);
  await page.getByRole("button", { name: "Name", exact: true }).click();
  await expect(page.getByLabel("What's your first name?")).toHaveValue("José");
});

test("a re-saved picture asks for the saved file instead", async ({ page }) => {
  await page.goto("/builder");
  await page
    .getByLabel("Open my saved picture")
    .setInputFiles(fixture("no-avatar-data.png"));
  await expect(
    page.getByText(
      "This picture doesn't have avatar info inside. Ask the student to turn in the saved file, not a screenshot.",
    ),
  ).toBeVisible();
});

test("a file that is not a picture says so", async ({ page }) => {
  await page.goto("/builder");
  await page
    .getByLabel("Open my saved picture")
    .setInputFiles(fixture("not-a-cutout.txt"));
  await expect(
    page.getByText("That file isn't a cutout from this app."),
  ).toBeVisible();
});

test("a Cutout naming a part this version does not have falls back to the default", async ({
  page,
}) => {
  await page.goto("/builder");
  await page
    .getByLabel("Open my saved picture")
    .setInputFiles(fixture("out-of-range-cutout.png"));

  // Hairstyle 999 and expression -3 are not slots, so both take their defaults.
  await expectChoices(page, [
    "Skin tone 8",
    "Afro",
    "Blonde hair",
    "Round glasses",
    "Smiling",
    "Green clothes",
  ]);
});

test("the hidden data changes nothing about the picture itself", async () => {
  const withData = new Uint8Array(await readFile(fixture("golden-cutout.png")));
  const withoutData = new Uint8Array(
    await readFile(fixture("no-avatar-data.png")),
  );
  const pixels = (bytes: Uint8Array) =>
    readChunks(bytes)
      .filter((chunk) => chunk.type === "IDAT")
      .map((chunk) => Buffer.from(chunk.data).toString("base64"));

  expect(pixels(withData)).toEqual(pixels(withoutData));
  expect(pixels(withData).length).toBeGreaterThan(0);
  expect(hiddenText(withoutData, CUTOUT_KEYWORD)).toBeUndefined();
});
