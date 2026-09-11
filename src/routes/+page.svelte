<script lang="ts">
  import { resolve } from "$app/paths";
</script>

<main class="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
  <header class="flex flex-col gap-2">
    <h1 class="text-4xl font-semibold text-slate-900">Avatar Generator</h1>
    <p class="text-lg text-slate-600">
      Make illustrated avatars for your classroom. No accounts, no photos, and
      nothing is stored on a server.
    </p>
  </header>

  <a
    href={resolve("/builder")}
    class="rounded-2xl bg-sky-600 px-6 py-4 text-center text-xl font-semibold text-white shadow-sm hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
  >
    Make an avatar
  </a>
</main>
