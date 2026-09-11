import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts"],
    languageOptions: { parserOptions: { parser: ts.parser } },
  },
  {
    ignores: [
      "dist/",
      ".svelte-kit/",
      "node_modules/",
      "test-results/",
      "playwright-report/",
      // Written by scripts/generate-art.ts from the Open Peeps drawings.
      "src/lib/art/generated/",
    ],
  },
);
