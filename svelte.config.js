import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// The Avatar Generator has no backend of any kind (ADR 0008), so the build is a
// plain folder of files any static host can serve.
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ pages: "dist", assets: "dist", fallback: "index.html" }),
  },
};
