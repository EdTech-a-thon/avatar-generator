<script lang="ts">
  /**
   * The Teacher's Class.
   *
   * There is no sign-in and no setup: a Class is already here on the first
   * visit, because nearly every Teacher has exactly one. Students arrive two
   * ways and both land here — "Add a student" hands the laptop to a child for a
   * minute, and dropping in the pictures a class turned in brings in a whole
   * set at once.
   */
  import { resolve } from "$app/paths";
  import AvatarFigure from "$lib/AvatarFigure.svelte";
  import {
    addStudent,
    currentClass,
    keepDuplicate,
    replaceWithDuplicate,
    studentById,
  } from "$lib/classroom.svelte";
  import {
    nameList,
    readCutoutFiles,
    type ImportProblem,
    type ReadFromFile,
  } from "$lib/cutout/import";

  const room = $derived(currentClass());

  let added = $state("");
  let problems = $state<ImportProblem[]>([]);
  /** Cutouts with no name inside: the Teacher types one before they are added. */
  let waiting = $state<ReadFromFile[]>([]);
  let typedName = $state("");
  let dropping = $state(false);

  function openBuilderTab() {
    window.open(`${resolve("/builder")}?class=${room.id}`, "_blank");
  }

  async function importFiles(files: FileList | null | undefined) {
    if (!files || files.length === 0) return;
    const reading = await readCutoutFiles([...files]);

    for (const found of reading.named) addStudent(room.id, found);
    added =
      reading.named.length > 0
        ? `Added ${nameList(reading.named.map((one) => one.name))}.`
        : "";
    problems = reading.problems;
    waiting = reading.unnamed;
    typedName = "";
  }

  function nameTheWaitingOne(event: SubmitEvent) {
    event.preventDefault();
    const name = typedName.trim();
    if (!name || waiting.length === 0) return;
    addStudent(room.id, { name, avatar: waiting[0].avatar });
    added = `Added ${name}.`;
    waiting = waiting.slice(1);
    typedName = "";
  }
</script>

<svelte:window
  ondragover={(event) => {
    event.preventDefault();
    dropping = true;
  }}
  ondragleave={() => (dropping = false)}
  ondrop={(event) => {
    event.preventDefault();
    dropping = false;
    importFiles(event.dataTransfer?.files);
  }}
/>

<main
  class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 {dropping
    ? 'bg-sky-100'
    : ''}"
>
  <header class="flex flex-col gap-2">
    <h1 class="text-3xl font-semibold text-slate-900">
      {room?.name ?? "My class"}
    </h1>
    <p class="text-slate-600">
      Everything here stays in this browser. No accounts, no photos, nothing on
      a server.
    </p>
  </header>

  <div class="flex flex-wrap items-center gap-3">
    <button
      type="button"
      class="rounded-2xl bg-sky-600 px-6 py-3 text-lg font-semibold text-white hover:bg-sky-700"
      onclick={openBuilderTab}
    >
      Add a student
    </button>

    <label
      class="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-6 py-3 text-lg font-semibold text-slate-700 ring-2 ring-slate-300 hover:ring-slate-400"
    >
      Add pictures students turned in
      <input
        type="file"
        accept="image/png"
        multiple
        class="sr-only"
        onchange={(event) => {
          const input = event.currentTarget;
          importFiles(input.files);
          input.value = "";
        }}
      />
    </label>
  </div>
  <p class="-mt-3 text-slate-600">
    You can also drop the pictures anywhere on this page.
  </p>

  <div aria-live="polite" class="flex flex-col gap-2">
    {#if added}
      <p
        class="rounded-2xl bg-emerald-100 px-4 py-3 text-lg text-emerald-900 ring-1 ring-emerald-300"
      >
        {added}
      </p>
    {/if}
    {#each problems as problem (problem.fileName)}
      <p
        class="rounded-2xl bg-amber-100 px-4 py-3 text-lg text-amber-900 ring-1 ring-amber-300"
      >
        {problem.fileName}: {problem.message}
      </p>
    {/each}
  </div>

  {#if waiting.length > 0}
    <form
      class="flex flex-col items-start gap-3 rounded-3xl bg-white p-4 ring-1 ring-slate-200"
      onsubmit={nameTheWaitingOne}
    >
      <h2 class="text-xl font-semibold text-slate-900">
        <label for="waiting-name">
          This picture has no name inside. Who is it?
        </label>
      </h2>
      <div class="flex flex-wrap items-center gap-4">
        <div class="w-28">
          <AvatarFigure
            avatar={waiting[0].avatar}
            title="The avatar with no name"
            class="h-auto w-full"
          />
        </div>
        <input
          id="waiting-name"
          type="text"
          autocomplete="off"
          bind:value={typedName}
          class="rounded-2xl border-2 border-slate-300 px-4 py-3 text-xl focus:border-sky-600 focus:outline-none"
        />
        <button
          type="submit"
          class="rounded-2xl bg-sky-600 px-5 py-3 text-lg font-semibold text-white hover:bg-sky-700"
        >
          Add this student
        </button>
      </div>
      {#if waiting.length > 1}
        <p class="text-slate-600">
          {waiting.length - 1} more to name after this one.
        </p>
      {/if}
    </form>
  {/if}

  {#if room && room.students.length > 0}
    <ul class="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-label="Students">
      {#each room.students as student (student.id)}
        <li
          class="flex flex-col items-center gap-2 rounded-3xl bg-white p-3 ring-1 ring-slate-200"
        >
          <AvatarFigure
            avatar={student.avatar}
            title="{student.name}'s avatar"
            class="h-auto w-full"
          />
          <span class="text-lg font-semibold text-slate-800"
            >{student.name}</span
          >

          {#if student.duplicateOf}
            {@const first = studentById(room, student.duplicateOf)}
            <div
              class="flex flex-col items-center gap-2 rounded-2xl bg-amber-50 p-3 text-center ring-1 ring-amber-300"
            >
              <p class="text-amber-900">
                There's already a {first?.name ?? student.name}. Replace their
                avatar instead?
              </p>
              <div class="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  class="rounded-xl bg-sky-600 px-3 py-2 font-semibold text-white hover:bg-sky-700"
                  onclick={() => replaceWithDuplicate(room.id, student.id)}
                >
                  Replace
                </button>
                <button
                  type="button"
                  class="rounded-xl bg-white px-3 py-2 font-semibold text-slate-700 ring-2 ring-slate-300"
                  onclick={() => keepDuplicate(room.id, student.id)}
                >
                  Keep both
                </button>
              </div>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {:else}
    <p
      class="rounded-3xl bg-white px-4 py-8 text-center text-lg text-slate-600 ring-1 ring-slate-200"
    >
      No students yet. Tap “Add a student” and hand over the laptop.
    </p>
  {/if}

  <footer class="pt-4 text-slate-600">
    Making an avatar on your own device?
    <a class="text-sky-700 underline" href={resolve("/builder")}
      >Open the builder</a
    >.
  </footer>
</main>
