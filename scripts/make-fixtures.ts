/**
 * Makes the checked-in Cutout fixtures by using the app the way a Student does.
 *
 * The golden Cutout guards ADR 0010: it was saved by this version, and every
 * future version has to open it and show exactly the same choices. The others
 * are the three things that go wrong — a picture that has been re-saved, a file
 * that isn't a PNG at all, and a Cutout that names a part this version doesn't
 * have — plus a small class's worth of Cutouts to import.
 *
 * Run with `bun run fixtures`. It starts its own dev server on a port outside
 * the workspace allocator's range.
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import {
  CUTOUT_KEYWORD,
  decodeCutoutData,
  encodeCutoutData,
  type CutoutData,
} from "../src/lib/cutout/codec.ts";
import {
  hiddenText,
  withHiddenText,
  withoutHiddenText,
} from "../src/lib/cutout/png.ts";

const PORT = 4399;
const fixtures = path.join(import.meta.dirname, "..", "tests", "fixtures");
const STEPS = ["Skin", "Hair", "Hair color", "Glasses", "Face", "Clothes"];

/** The choices the golden Cutout holds. Tests check for exactly these. */
const GOLDEN = [
  "Skin tone 8",
  "Afro",
  "Blonde hair",
  "Round glasses",
  "Laughing",
  "Green clothes",
];

const server = spawn(
  "bunx",
  ["vite", "dev", "--host", "127.0.0.1", "--port", String(PORT)],
  {
    cwd: path.join(import.meta.dirname, ".."),
    stdio: "inherit",
  },
);

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      await fetch(`http://127.0.0.1:${PORT}/`);
      return;
    } catch {
      await new Promise((wait) => setTimeout(wait, 500));
    }
  }
  throw new Error("the dev server never came up");
}

/** Builds one Avatar in the real Builder and returns the picture it saves. */
async function saveCutout(page: Page, name: string, choices: string[]) {
  await page.goto(`http://127.0.0.1:${PORT}/builder`);
  for (const [index, choice] of choices.entries()) {
    await page.getByRole("button", { name: STEPS[index], exact: true }).click();
    await page.getByRole("button", { name: choice, exact: true }).click();
  }
  await page.getByRole("button", { name: "Name", exact: true }).click();
  await page.getByLabel("What's your first name?").fill(name);

  const saving = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save my picture" }).click();
  const bytes = new Uint8Array(await readFile((await (await saving).path())!));
  if (!decodeCutoutData(hiddenText(bytes, CUTOUT_KEYWORD) ?? "")) {
    throw new Error(`the picture saved for ${name} has no Avatar inside`);
  }
  return bytes;
}

function retold(golden: Uint8Array, change: (held: CutoutData) => CutoutData) {
  const held = decodeCutoutData(hiddenText(golden, CUTOUT_KEYWORD)!)!;
  return withHiddenText(golden, CUTOUT_KEYWORD, encodeCutoutData(change(held)));
}

try {
  await waitForServer();
  await mkdir(fixtures, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const golden = await saveCutout(page, "José", GOLDEN);
  const classroom = {
    "cutout-maya.png": await saveCutout(page, "Maya", [
      "Skin tone 3",
      "Long hair",
      "Brown hair",
      "No glasses",
      "Big smile",
      "Purple clothes",
    ]),
    "cutout-leo.png": await saveCutout(page, "Leo", [
      "Skin tone 6",
      "Short curly hair",
      "Black hair",
      "Round glasses",
      "Cheeky",
      "Blue clothes",
    ]),
    "cutout-ava.png": await saveCutout(page, "Ava", [
      "Skin tone 1",
      "Two buns",
      "Auburn hair",
      "No glasses",
      "Cute",
      "Yellow clothes",
    ]),
  };

  await writeFile(path.join(fixtures, "golden-cutout.png"), golden);
  for (const [name, bytes] of Object.entries(classroom)) {
    await writeFile(path.join(fixtures, name), bytes);
  }

  await writeFile(
    path.join(fixtures, "no-avatar-data.png"),
    withoutHiddenText(golden, CUTOUT_KEYWORD),
  );
  await writeFile(
    path.join(fixtures, "out-of-range-cutout.png"),
    retold(golden, (held) => ({
      ...held,
      avatar: { ...held.avatar, hairstyle: 999, expression: -3 },
    })),
  );
  await writeFile(
    path.join(fixtures, "no-name-cutout.png"),
    retold(golden, (held) => ({ ...held, name: "" })),
  );
  await writeFile(
    path.join(fixtures, "not-a-cutout.txt"),
    "This is a note, not a picture of anybody.\n",
  );

  // A Class File saved by this version: two Students and the Teacher's own
  // Avatar. Later versions have to keep loading it exactly as it is (ADR 0010).
  await page.goto(`http://127.0.0.1:${PORT}/`);
  await page
    .getByLabel("Add pictures students turned in")
    .setInputFiles([
      path.join(fixtures, "cutout-maya.png"),
      path.join(fixtures, "cutout-leo.png"),
    ]);
  await page.getByRole("button", { name: "Make my avatar" }).click();
  await page.getByRole("button", { name: "Hair", exact: true }).click();
  await page.getByRole("button", { name: "Bun", exact: true }).click();
  await page.getByRole("button", { name: "Save my avatar" }).click();

  const savingFile = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download class file" }).click();
  const classFile = await readFile((await (await savingFile).path())!, "utf8");
  await browser.close();

  await writeFile(path.join(fixtures, "golden-class-file.json"), classFile);

  const held = JSON.parse(classFile);
  held.classes[0].students[0].avatar.hairstyle = 999;
  held.classes[0].students[0].avatar.expression = -3;
  await writeFile(
    path.join(fixtures, "class-file-out-of-range.json"),
    JSON.stringify(held, null, 2),
  );

  console.log("wrote the fixtures");
} finally {
  server.kill();
}
