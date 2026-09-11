import { expect, test, type Page } from "@playwright/test";
import { unzipSync } from "fflate";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CUTOUT_KEYWORD, decodeCutoutData } from "../src/lib/cutout/codec";
import { hiddenText, readChunks } from "../src/lib/cutout/png";

const fixture = (name: string) =>
  path.join(import.meta.dirname, "fixtures", name);

function importCutouts(page: Page, ...files: string[]) {
  return page
    .getByLabel("Add pictures students turned in")
    .setInputFiles(files.map(fixture));
}

async function downloadSet(page: Page) {
  const saving = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download all cutouts" }).click();
  const saved = await saving;
  const bytes = new Uint8Array(await readFile((await saved.path())!));
  return { fileName: saved.suggestedFilename(), entries: unzipSync(bytes) };
}

function pictureShape(bytes: Uint8Array) {
  const header = readChunks(bytes).find((chunk) => chunk.type === "IHDR")!;
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

/**
 * Counts the pixels that were actually painted in a band across the picture,
 * given as fractions of its height. Everything else is see-through.
 */
async function inkInBand(
  page: Page,
  bytes: Uint8Array,
  from: number,
  to: number,
) {
  return page.evaluate(
    async ([numbers, top, bottom]) => {
      const picture = await createImageBitmap(
        new Blob([new Uint8Array(numbers as number[])]),
      );
      const canvas = document.createElement("canvas");
      canvas.width = picture.width;
      canvas.height = picture.height;
      const surface = canvas.getContext("2d")!;
      surface.drawImage(picture, 0, 0);
      const start = Math.round(picture.height * (top as number));
      const end = Math.round(picture.height * (bottom as number));
      const { data } = surface.getImageData(
        0,
        start,
        picture.width,
        end - start,
      );
      let painted = 0;
      for (let at = 3; at < data.length; at += 4)
        if (data[at] > 0) painted += 1;
      return painted;
    },
    [Array.from(bytes), from, to] as [number[], number, number],
  );
}

test("a Teacher downloads the whole Class as chart pieces", async ({
  page,
}) => {
  await page.goto("/");
  await importCutouts(
    page,
    "cutout-maya.png",
    "cutout-leo.png",
    "cutout-ava.png",
  );

  const { fileName, entries } = await downloadSet(page);

  expect(fileName).toBe("My class cutouts.zip");
  expect(Object.keys(entries).sort()).toEqual([
    "Ava.png",
    "Leo.png",
    "Maya.png",
  ]);

  for (const [entry, bytes] of Object.entries(entries)) {
    const shape = pictureShape(bytes);
    expect(shape.height).toBe(1500);
    expect(shape.colorType).toBe(6);
    const held = decodeCutoutData(hiddenText(bytes, CUTOUT_KEYWORD)!);
    expect(`${held?.name}.png`).toBe(entry);
  }

  // The background is see-through, not white.
  expect(await inkInBand(page, entries["Maya.png"], 0, 0.02)).toBe(0);
});

test("two Students with one name still get a file each", async ({ page }) => {
  await page.goto("/");
  await importCutouts(page, "cutout-maya.png", "cutout-maya.png");

  const { entries } = await downloadSet(page);
  expect(Object.keys(entries).sort()).toEqual(["Maya 2.png", "Maya.png"]);
});

test("names are written under the pictures until the Teacher turns them off", async ({
  page,
}) => {
  await page.goto("/");
  await importCutouts(page, "cutout-maya.png");

  const labelled = await downloadSet(page);
  const labelledShape = pictureShape(labelled.entries["Maya.png"]);
  // The bottom of a labelled piece is below the figure: only the name is there.
  expect(
    await inkInBand(page, labelled.entries["Maya.png"], 0.85, 0.97),
  ).toBeGreaterThan(0);

  await page.getByLabel("Put names under the pictures").uncheck();
  const plain = await downloadSet(page);
  const plainShape = pictureShape(plain.entries["Maya.png"]);

  // The same height either way, so dropping the name makes the figure bigger.
  expect(plainShape.height).toBe(labelledShape.height);
  expect(plainShape.width).toBeGreaterThan(labelledShape.width);

  // The Avatar rides inside either way.
  expect(
    decodeCutoutData(hiddenText(plain.entries["Maya.png"], CUTOUT_KEYWORD)!)
      ?.name,
  ).toBe("Maya");
});

test("a Teacher replaces one lost chart piece on its own", async ({ page }) => {
  await page.goto("/");
  await importCutouts(page, "cutout-maya.png", "cutout-leo.png");

  const saving = page.waitForEvent("download");
  await page
    .getByRole("listitem")
    .filter({ hasText: "Leo" })
    .getByRole("button", { name: "Download" })
    .click();
  const saved = await saving;

  expect(saved.suggestedFilename()).toBe("Leo.png");
  const bytes = new Uint8Array(await readFile((await saved.path())!));
  expect(pictureShape(bytes).height).toBe(1500);
  expect(decodeCutoutData(hiddenText(bytes, CUTOUT_KEYWORD)!)?.name).toBe(
    "Leo",
  );
});

test("a Cutout out of a downloaded set imports like any other", async ({
  page,
}) => {
  await page.goto("/");
  await importCutouts(page, "cutout-ava.png");
  const { entries } = await downloadSet(page);

  await page.getByLabel("Add pictures students turned in").setInputFiles({
    name: "Ava.png",
    mimeType: "image/png",
    buffer: Buffer.from(entries["Ava.png"]),
  });

  await expect(
    page.getByRole("listitem").filter({ hasText: "Ava" }),
  ).toHaveCount(2);
});
