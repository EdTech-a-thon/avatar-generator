/**
 * Makes the checked-in Cutout fixtures by using the app the way a Student does.
 *
 * The golden Cutout guards ADR 0010: it was saved by this version, and every
 * future version has to open it and show exactly the same choices. The others
 * are the three things that go wrong — a picture that has been re-saved, a file
 * that isn't a PNG at all, and a Cutout that names a part this version doesn't
 * have.
 *
 * Run with `bun run fixtures`. It starts its own dev server on a port outside
 * the workspace allocator's range.
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import {
  CUTOUT_KEYWORD,
  decodeCutoutData,
  encodeCutoutData,
} from "../src/lib/cutout/codec.ts";
import {
  hiddenText,
  withHiddenText,
  withoutHiddenText,
} from "../src/lib/cutout/png.ts";

const PORT = 4399;
const fixtures = path.join(import.meta.dirname, "..", "tests", "fixtures");

/** The choices the golden Cutout holds. Tests check for exactly these. */
const GOLDEN = {
  name: "José",
  choices: [
    "Skin tone 8",
    "Afro",
    "Blonde hair",
    "Round glasses",
    "Laughing",
    "Green clothes",
  ] as const,
};

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

try {
  await waitForServer();
  await mkdir(fixtures, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/builder`);

  const steps = ["Skin", "Hair", "Hair color", "Glasses", "Face", "Clothes"];
  for (const [index, choice] of GOLDEN.choices.entries()) {
    await page.getByRole("button", { name: steps[index], exact: true }).click();
    await page.getByRole("button", { name: choice, exact: true }).click();
  }
  await page.getByRole("button", { name: "Name", exact: true }).click();
  await page.getByLabel("What's your first name?").fill(GOLDEN.name);

  const saving = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save my picture" }).click();
  const saved = await saving;
  const golden = new Uint8Array(await readFile((await saved.path())!));
  await browser.close();

  const text = hiddenText(golden, CUTOUT_KEYWORD);
  if (!text || !decodeCutoutData(text))
    throw new Error("the saved picture has no Avatar inside");

  await writeFile(path.join(fixtures, "golden-cutout.png"), golden);
  await writeFile(
    path.join(fixtures, "no-avatar-data.png"),
    withoutHiddenText(golden, CUTOUT_KEYWORD),
  );
  await writeFile(
    path.join(fixtures, "out-of-range-cutout.png"),
    withHiddenText(
      golden,
      CUTOUT_KEYWORD,
      encodeCutoutData({
        ...decodeCutoutData(text)!,
        avatar: {
          ...decodeCutoutData(text)!.avatar,
          hairstyle: 999,
          expression: -3,
        },
      }),
    ),
  );
  await writeFile(
    path.join(fixtures, "not-a-cutout.txt"),
    "This is a note, not a picture of anybody.\n",
  );
  console.log("wrote fixtures for", GOLDEN.name, text);
} finally {
  server.kill();
}
