<script lang="ts">
  import AvatarFigure from "$lib/AvatarFigure.svelte";
  import Builder from "$lib/Builder.svelte";
  import type { Avatar } from "$lib/avatar";
  import { resolve } from "$app/paths";

  let finished = $state<{ avatar: Avatar; name: string } | null>(null);
</script>

<main class="min-h-dvh">
  {#if finished}
    <div
      class="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-10 text-center"
    >
      <h1 class="text-3xl font-semibold text-slate-900">
        Nice work, {finished.name}!
      </h1>
      <div
        class="w-48 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200"
      >
        <AvatarFigure
          avatar={finished.avatar}
          title="{finished.name}'s avatar"
          class="h-auto w-full"
        />
      </div>
      <button
        type="button"
        class="rounded-2xl bg-sky-600 px-6 py-3 text-lg font-semibold text-white hover:bg-sky-700"
        onclick={() => (finished = null)}
      >
        Start again
      </button>
      <a class="text-sky-700 underline" href={resolve("/")}>Back to the start</a
      >
    </div>
  {:else}
    <Builder onfinish={(result) => (finished = result)} />
  {/if}
</main>
