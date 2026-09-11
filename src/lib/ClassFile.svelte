<script lang="ts">
  /**
   * The Class File: one JSON file holding every Class, every Student and the
   * Teacher's own Avatar.
   *
   * Nothing is stored on a server, so this is the only copy that exists outside
   * this browser (ADR 0008). A Chromebook that wipes its storage, or a new
   * laptop in September, is what it is for. The app never nags about it and
   * never downloads one on its own: the option is simply here.
   */
  import {
    classroomFile,
    describe,
    loadClassroomFile,
    readClassroomFile,
    type ClassroomData,
  } from "./classroom.svelte";
  import { download } from "./cutout/save";

  let waiting = $state<ClassroomData | undefined>(undefined);
  let message = $state("");

  function save() {
    const file = classroomFile();
    download(
      new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }),
      "My classes.json",
    );
  }

  async function choose(file: File | undefined) {
    if (!file) return;
    const read = readClassroomFile(await file.text());
    if (!read) {
      message = "That file isn't a class file from this app.";
      waiting = undefined;
      return;
    }
    message = "";
    waiting = read;
  }

  function replaceEverything() {
    if (!waiting) return;
    loadClassroomFile(waiting);
    waiting = undefined;
    message = "Your classes are back.";
  }
</script>

<section
  aria-label="Your class file"
  class="flex flex-col items-start gap-3 rounded-3xl bg-white p-4 ring-1 ring-slate-200"
>
  <h2 class="text-xl font-semibold text-slate-900">Your class file</h2>
  <p class="text-slate-600">
    One file with every class, every student and your own avatar. Keep it
    somewhere safe: it's the only copy outside this browser.
  </p>

  <div class="flex flex-wrap items-center gap-3">
    <button
      type="button"
      class="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700 ring-2 ring-slate-300 hover:ring-slate-400"
      onclick={save}
    >
      Download class file
    </button>

    <label
      class="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700 ring-2 ring-slate-300 hover:ring-slate-400"
    >
      Load a class file
      <input
        type="file"
        accept="application/json,.json"
        class="sr-only"
        onchange={(event) => {
          const input = event.currentTarget;
          choose(input.files?.[0]);
          input.value = "";
        }}
      />
    </label>
  </div>

  <div aria-live="polite" class="flex w-full flex-col gap-2">
    {#if message}
      <p
        class="rounded-2xl bg-amber-100 px-4 py-3 text-amber-900 ring-1 ring-amber-300"
      >
        {message}
      </p>
    {/if}

    {#if waiting}
      <div
        class="flex flex-col items-start gap-2 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-300"
      >
        <p class="text-amber-900">
          Loading this file replaces everything in this browser. You have {describe(
            classroomFile(),
          )}
          now. The file has {describe(waiting)}.
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700"
            onclick={replaceEverything}
          >
            Yes, replace everything
          </button>
          <button
            type="button"
            class="rounded-xl bg-white px-4 py-2 font-semibold text-slate-700 ring-2 ring-slate-300"
            onclick={() => (waiting = undefined)}
          >
            Cancel
          </button>
        </div>
      </div>
    {/if}
  </div>
</section>
