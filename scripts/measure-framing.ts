/**
 * Works out how tightly a Cutout can crop around the drawings.
 *
 * Every head-only Cutout has to use one box, or Students' faces would come out
 * at different sizes on the same chart. So we put every hairstyle, every
 * Expression and every piece of eyewear into one SVG, ask the browser for the
 * outline around all of it, and add a small margin. The bust box does the same
 * with every Pose. The numbers are written into
 * `src/lib/art/generated/framing.ts` and committed.
 *
 * Every age goes into the same box (ADR 0011). A young Avatar has a bigger head
 * than a grown-up, so measuring only grown-ups would crop children. One box for
 * all of them also keeps a Cutout Set printable: every piece comes out the same
 * size on the page, whichever ages are in the Class.
 *
 * Run with `bun run framing` after adding parts to the catalog.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import {
  ages,
  clothingColors,
  expressions,
  eyewear,
  hairColors,
  hairstyles,
  poses,
  skinTones,
} from "../src/lib/catalog.ts";
import { defaultAvatar } from "../src/lib/avatar.ts";
import { figureGroups, type FigureGroup } from "../src/lib/render.ts";

const MARGIN = 24;

function markup(groups: FigureGroup[]): string {
  return groups
    .map(
      (group) =>
        `<g${group.transform ? ` transform="${group.transform}"` : ""}>` +
        group.paths
          .map(
            (drawn) =>
              `<path d="${drawn.d}"${drawn.transform ? ` transform="${drawn.transform}"` : ""} fill="${drawn.fill}"${drawn.fillRule ? ` fill-rule="${drawn.fillRule}"` : ""} stroke="none"/>`,
          )
          .join("") +
        "</g>",
    )
    .join("");
}

/** Every combination that could stick out of the box, all drawn at once. */
function everything(framing: "head" | "bust", age: number): string {
  const drawings: string[] = [];
  const each = (count: number, build: (index: number) => void) => {
    for (let index = 0; index < count; index += 1) build(index);
  };

  const avatar = { ...defaultAvatar(), age };

  each(hairstyles.stored.length, (hairstyle) =>
    drawings.push(
      markup(
        figureGroups({ avatar: { ...avatar, hairstyle }, framing, pose: 0 }),
      ),
    ),
  );
  each(expressions.stored.length, (expression) =>
    drawings.push(
      markup(
        figureGroups({ avatar: { ...avatar, expression }, framing, pose: 0 }),
      ),
    ),
  );
  each(eyewear.stored.length, (piece) =>
    drawings.push(
      markup(
        figureGroups({
          avatar: { ...avatar, eyewear: piece },
          framing,
          pose: 0,
        }),
      ),
    ),
  );
  if (framing === "bust") {
    each(poses.stored.length, (pose) =>
      drawings.push(markup(figureGroups({ avatar, framing, pose }))),
    );
  }
  return drawings.join("");
}

interface Edges {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * One age at a time, one page each. Every age of every part in a single page is
 * megabytes of path data, and the browser spends minutes on it; each age on its
 * own is the same work the grown-up box has always been.
 */
async function measure(framing: "head" | "bust"): Promise<Edges> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    let found: Edges | undefined;
    for (let age = 0; age < ages.stored.length; age += 1) {
      await page.setContent(
        // Drawn small on purpose: `getBBox` is geometry, not pixels.
        `<svg id="all" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000" width="200" height="200">${everything(framing, age)}</svg>`,
      );
      const box = await page.evaluate(() => {
        const svg = document.getElementById(
          "all",
        ) as unknown as SVGGraphicsElement;
        const { x, y, width, height } = svg.getBBox();
        return { x, y, width, height };
      });
      const edges: Edges = {
        left: box.x,
        top: box.y,
        right: box.x + box.width,
        bottom: box.y + box.height,
      };
      console.log(`  ${framing}, ${ages.stored[age].label}:`, edges);
      found = found
        ? {
            left: Math.min(found.left, edges.left),
            top: Math.min(found.top, edges.top),
            right: Math.max(found.right, edges.right),
            bottom: Math.max(found.bottom, edges.bottom),
          }
        : edges;
    }
    return found!;
  } finally {
    await browser.close();
  }
}

function boxed(edges: Edges) {
  const x = Math.floor(edges.left) - MARGIN;
  const y = Math.floor(edges.top) - MARGIN;
  return {
    x,
    y,
    width: Math.ceil(edges.right) + MARGIN - x,
    height: Math.ceil(edges.bottom) + MARGIN - y,
  };
}

// Checks nothing was silently dropped from a list while we were in here.
const counts = {
  ages: ages.stored.length,
  "skin tones": skinTones.stored.length,
  hairstyles: hairstyles.stored.length,
  "hair colors": hairColors.stored.length,
  eyewear: eyewear.stored.length,
  expressions: expressions.stored.length,
  "clothing colors": clothingColors.stored.length,
  poses: poses.stored.length,
};
console.log(counts);

const head = boxed(await measure("head"));
const bust = boxed(await measure("bust"));
console.log({ head, bust });

await writeFile(
  path.join(
    import.meta.dirname,
    "..",
    "src",
    "lib",
    "art",
    "generated",
    "framing.ts",
  ),
  `// Generated by scripts/measure-framing.ts. Do not edit by hand.
export interface FramingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const framing: Record<'head' | 'bust', FramingBox> = {
  head: ${JSON.stringify(head)},
  bust: ${JSON.stringify(bust)},
};
`,
);
