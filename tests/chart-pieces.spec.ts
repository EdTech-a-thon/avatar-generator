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
  return {
    fileName: saved.suggestedFilename(),
    entries: unzipSync(new Uint8Array(await readFile((await saved.path())!))),
  };
}

function pictureShape(bytes: Uint8Array) {
  const header = readChunks(bytes).find((chunk) => chunk.type === "IHDR")!;
  const view = new DataView(
    header.data.buffer,
    header.data.byteOffset,
    header.data.byteLength,
  );
  return { width: view.getUint32(0), height: view.getUint32(4) };
}

const pixels = (bytes: Uint8Array) =>
  readChunks(bytes)
    .filter((chunk) => chunk.type === "IDAT")
    .map((chunk) => Buffer.from(chunk.data).toString("base64"))
    .join("");

async function chooseBust(page: Page, pose: string) {
  await page.getByRole("button", { name: "Head and shoulders" }).click();
  await page
    .getByRole("list", { name: "Pick a pose for everyone" })
    .getByRole("button", { name: pose, exact: true })
    .click();
}

async function makeMyAvatar(page: Page) {
  await page.getByRole("button", { name: "Make my avatar" }).click();
  await page.getByRole("button", { name: "Save my avatar" }).click();
  await expect(page.getByRole("img", { name: "My avatar" })).toBeVisible();
}

test("a Teacher picks head and shoulders in one Pose for the whole Class", async ({
  page,
}) => {
  await page.goto("/");
  await importCutouts(page, "cutout-maya.png", "cutout-leo.png");
  const justFaces = await downloadSet(page);
  expect(justFaces.fileName).toBe("My class cutouts.zip");

  await chooseBust(page, "Hoodie");
  const { fileName, entries } = await downloadSet(page);
  expect(fileName).toBe("My class Hoodie.zip");
  expect(Object.keys(entries).sort()).toEqual(["Leo.png", "Maya.png"]);

  const bust = pictureShape(entries["Maya.png"]);
  expect(bust.height).toBe(1500);
  // Head and shoulders is a wider piece than a face at the same height.
  expect(bust.width).toBeGreaterThan(
    pictureShape(justFaces.entries["Maya.png"]).width,
  );
});

test("one face for everyone changes the pictures but not what is inside them", async ({
  page,
}) => {
  await page.goto("/");
  await importCutouts(page, "cutout-maya.png");
  const theirOwn = await downloadSet(page);

  await page.getByLabel("Give everyone the same face").check();
  await page
    .getByRole("list", { name: "One face for everyone" })
    .getByRole("button", { name: "Eyes closed", exact: true })
    .click();
  const matching = await downloadSet(page);

  expect(pixels(matching.entries["Maya.png"])).not.toBe(
    pixels(theirOwn.entries["Maya.png"]),
  );
  // Maya's own favorite Expression is still what the picture carries.
  const held = decodeCutoutData(
    hiddenText(matching.entries["Maya.png"], CUTOUT_KEYWORD)!,
  );
  expect(held?.avatar.expression).toBe(1);
});

test("school colors for spirit week leave each Avatar alone", async ({
  page,
}) => {
  await page.goto("/");
  await importCutouts(page, "cutout-maya.png");
  await chooseBust(page, "Hoodie");
  const theirOwn = await downloadSet(page);

  await page.getByLabel("Give everyone the same clothes color").check();
  await page
    .getByRole("list", { name: "One clothes color for everyone" })
    .getByRole("button", { name: "Red clothes", exact: true })
    .click();
  const matching = await downloadSet(page);

  expect(pixels(matching.entries["Maya.png"])).not.toBe(
    pixels(theirOwn.entries["Maya.png"]),
  );
  const held = decodeCutoutData(
    hiddenText(matching.entries["Maya.png"], CUTOUT_KEYWORD)!,
  );
  expect(held?.avatar.clothingColor).toBe(6);
});

test('"include me" is off, needs an Avatar, and adds exactly one piece', async ({
  page,
}) => {
  await page.goto("/");
  await importCutouts(page, "cutout-maya.png", "cutout-leo.png");

  await expect(page.getByLabel("Include me")).not.toBeChecked();
  await expect(page.getByLabel("Include me")).toBeDisabled();
  expect(Object.keys((await downloadSet(page)).entries)).toHaveLength(2);

  await makeMyAvatar(page);
  await page.getByLabel("Include me").check();

  const withMe = await downloadSet(page);
  expect(Object.keys(withMe.entries).sort()).toEqual([
    "Leo.png",
    "Maya.png",
    "Teacher.png",
  ]);

  await page.getByLabel("Include me").uncheck();
  expect(Object.keys((await downloadSet(page)).entries)).toHaveLength(2);
});

test("the preview shows what the set will look like before downloading", async ({
  page,
}) => {
  await page.goto("/");
  await importCutouts(page, "cutout-maya.png");

  const preview = page.getByRole("group", { name: "What you'll get" });
  await expect(
    preview.getByRole("img", { name: "Maya's chart piece" }),
  ).toBeVisible();
  await expect(preview.getByText("Maya")).toBeVisible();

  await page.getByLabel("Put names under the pictures").uncheck();
  await expect(preview.getByText("Maya")).toHaveCount(0);
});
