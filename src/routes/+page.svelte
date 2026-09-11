<script lang="ts">
  /**
   * The Teacher's Class.
   *
   * There is no sign-in and no setup: a Class is already here on the first
   * visit, because nearly every Teacher has exactly one. Students arrive two
   * ways and both land here — "Add a student" hands the laptop to a child for a
   * minute, and dropping in the pictures a class turned in brings in a whole
   * set at once.
   *
   * Tidying up lives on each Student's own card, and the Classes panel stays
   * folded away, because a Teacher with one Class should never have to think
   * about Classes at all.
   */
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import AvatarFigure from "$lib/AvatarFigure.svelte";
  import {
    addClass,
    addStudent,
    classes,
    currentClass,
    keepDuplicate,
    removeClass,
    removeStudent,
    renameClass,
    renameStudent,
    replaceWithDuplicate,
    selectClass,
    studentById,
    teacherAvatar,
  } from "$lib/classroom.svelte";
  import {
    nameList,
    readCutoutFiles,
    type ImportProblem,
    type ReadFromFile,
  } from "$lib/cutout/import";
  import type { Student } from "$lib/classroom.svelte";
  import ChartPieces from "$lib/ChartPieces.svelte";
  import {
    chart,
    chartClothingColor,
    chartExpression,
  } from "$lib/chart.svelte";
  import ClassFile from "$lib/ClassFile.svelte";
  import {
    cutoutFileName,
    cutoutPng,
    download,
    SET_CUTOUT_HEIGHT,
  } from "$lib/cutout/save";

  const room = $derived(currentClass());
  const mine = $derived(teacherAvatar());

  let added = $state("");
  let problems = $state<ImportProblem[]>([]);
  /** Cutouts with no name inside: the Teacher types one before they are added. */
  let waiting = $state<ReadFromFile[]>([]);
  let typedName = $state("");
  let dropping = $state(false);

  /** Which Student's card is open for renaming, and which is asking to go. */
  let renaming = $state<string | undefined>(undefined);
  let newName = $state("");
  let removing = $state<string | undefined>(undefined);

  let newClassName = $state("");
  let classNameEdit = $state("");
  let removingClass = $state(false);

  function builderTab(query: string) {
    window.open(`${resolve("/builder")}?${query}`, "_blank");
  }

  /**
   * Which Avatar the Builder is for rides in the query string. `resolve` still
   * gives us the app's base path; the lint rule just can't see it through the
   * template, which is why it is waved off here and nowhere else.
   */
  function openBuilder(query: string) {
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    goto(`${resolve("/builder")}?${query}`);
  }

  async function importFiles(files: FileList | null | undefined) {
    if (!files || files.length === 0) return;
    let reading;
    try {
      reading = await readCutoutFiles([...files]);
    } catch {
      problems = [{ fileName: "Those files", message: "couldn't be read." }];
      return;
    }

    for (const found of reading.named) addStudent(room.id, found);
    added =
      reading.named.length > 0
        ? `Added ${nameList(reading.named.map((one) => one.name))}.`
        : "";
    problems = reading.problems;
    // Anyone still waiting for a name keeps waiting: a second drop must never
    // quietly throw away the children the Teacher hasn't named yet.
    waiting = [...waiting, ...reading.unnamed];
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

  function startRenaming(studentId: string, name: string) {
    renaming = studentId;
    removing = undefined;
    newName = name;
  }

  function saveName(event: SubmitEvent) {
    event.preventDefault();
    if (!renaming) return;
    renameStudent(room.id, renaming, newName);
    renaming = undefined;
  }

  /**
   * One lost chart piece, made the same way the whole set is: same framing,
   * same Pose, same overrides, same names. A replacement that didn't match the
   * rest of the chart would be no replacement at all.
   */
  async function downloadOne(student: Student) {
    try {
      const picture = await cutoutPng({
        avatar: student.avatar,
        framing: chart.framing,
        pose: chart.pose,
        expression: chartExpression(),
        clothingColor: chartClothingColor(),
        height: SET_CUTOUT_HEIGHT,
        ...(chart.withNames ? { label: student.name } : {}),
        data: { avatar: student.avatar, name: student.name },
      });
      download(picture, cutoutFileName(student.name));
    } catch {
      problems = [
        { fileName: student.name, message: "couldn't be made. Try again." },
      ];
    }
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
  <header class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-semibold text-slate-900">
        {room?.name ?? "My class"}
      </h1>
      <p class="text-slate-600">
        Everything here stays in this browser. No accounts, no photos, nothing
        on a server.
      </p>
    </div>

    <section aria-label="My avatar" class="flex items-center gap-3">
      {#if mine}
        <div class="w-20 rounded-3xl bg-white p-2 ring-1 ring-slate-200">
          <AvatarFigure avatar={mine} title="My avatar" class="h-auto w-full" />
        </div>
      {/if}
      <button
        type="button"
        class="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700 ring-2 ring-slate-300 hover:ring-slate-400"
        onclick={() => openBuilder("me=1")}
      >
        {mine ? "Change my avatar" : "Make my avatar"}
      </button>
    </section>
  </header>

  <div class="flex flex-wrap items-center gap-3">
    <button
      type="button"
      class="rounded-2xl bg-sky-600 px-6 py-3 text-lg font-semibold text-white hover:bg-sky-700"
      onclick={() => builderTab(`class=${room.id}`)}
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
    <!-- Keyed by position: two dropped files really can share a name. -->
    {#each problems as problem, index (index)}
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
        <label for="waiting-name"
          >This picture has no name inside. Who is it?</label
        >
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

          {#if renaming === student.id}
            <form class="flex w-full flex-col gap-2" onsubmit={saveName}>
              <input
                type="text"
                aria-label="New name for {student.name}"
                autocomplete="off"
                bind:value={newName}
                class="w-full rounded-xl border-2 border-slate-300 px-2 py-1 text-lg focus:border-sky-600 focus:outline-none"
              />
              <button
                type="submit"
                class="rounded-xl bg-sky-600 px-3 py-2 font-semibold text-white hover:bg-sky-700"
              >
                Save name
              </button>
            </form>
          {:else if removing === student.id}
            <div
              class="flex w-full flex-col gap-2 rounded-2xl bg-amber-50 p-2 text-center"
            >
              <p class="text-amber-900">
                Remove {student.name} and their avatar for good?
              </p>
              <button
                type="button"
                class="rounded-xl bg-rose-600 px-3 py-2 font-semibold text-white hover:bg-rose-700"
                onclick={() => {
                  removeStudent(room.id, student.id);
                  removing = undefined;
                }}
              >
                Yes, remove
              </button>
              <button
                type="button"
                class="rounded-xl bg-white px-3 py-2 font-semibold text-slate-700 ring-2 ring-slate-300"
                onclick={() => (removing = undefined)}
              >
                Cancel
              </button>
            </div>
          {:else}
            <div class="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                class="rounded-xl bg-white px-3 py-1 font-semibold text-slate-700 ring-2 ring-slate-300"
                onclick={() => downloadOne(student)}
              >
                Download
              </button>
              <button
                type="button"
                class="rounded-xl bg-white px-3 py-1 font-semibold text-slate-700 ring-2 ring-slate-300"
                onclick={() => startRenaming(student.id, student.name)}
              >
                Rename
              </button>
              <button
                type="button"
                class="rounded-xl bg-white px-3 py-1 font-semibold text-slate-700 ring-2 ring-slate-300"
                onclick={() =>
                  openBuilder(`class=${room.id}&student=${student.id}`)}
              >
                Change avatar
              </button>
              <button
                type="button"
                class="rounded-xl bg-white px-3 py-1 font-semibold text-slate-700 ring-2 ring-slate-300"
                onclick={() => {
                  removing = student.id;
                  renaming = undefined;
                }}
              >
                Remove
              </button>
            </div>
          {/if}

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

  {#if room && room.students.length > 0}
    <ChartPieces {room} />
  {/if}

  <details class="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
    <summary class="cursor-pointer text-lg font-semibold text-slate-800"
      >Classes</summary
    >

    <div class="flex flex-col gap-4 pt-4">
      {#if classes().length > 1}
        <ul class="flex flex-wrap gap-2" aria-label="My classes">
          {#each classes() as group (group.id)}
            <li>
              <button
                type="button"
                aria-pressed={group.id === room.id}
                class="rounded-full px-4 py-2 font-semibold ring-2 {group.id ===
                room.id
                  ? 'bg-slate-900 text-white ring-slate-900'
                  : 'bg-white text-slate-700 ring-slate-300'}"
                onclick={() => selectClass(group.id)}
              >
                {group.name}
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      <form
        class="flex flex-wrap items-end gap-2"
        onsubmit={(event) => {
          event.preventDefault();
          renameClass(room.id, classNameEdit);
          classNameEdit = "";
        }}
      >
        <label class="flex flex-col gap-1 text-slate-700">
          Rename this class
          <input
            type="text"
            autocomplete="off"
            bind:value={classNameEdit}
            class="rounded-xl border-2 border-slate-300 px-3 py-2 text-lg focus:border-sky-600 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          class="rounded-xl bg-white px-4 py-2 font-semibold text-slate-700 ring-2 ring-slate-300"
        >
          Save class name
        </button>
      </form>

      <form
        class="flex flex-wrap items-end gap-2"
        onsubmit={(event) => {
          event.preventDefault();
          if (!newClassName.trim()) return;
          addClass(newClassName);
          newClassName = "";
        }}
      >
        <label class="flex flex-col gap-1 text-slate-700">
          Name for a new class
          <input
            type="text"
            autocomplete="off"
            bind:value={newClassName}
            class="rounded-xl border-2 border-slate-300 px-3 py-2 text-lg focus:border-sky-600 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          class="rounded-xl bg-white px-4 py-2 font-semibold text-slate-700 ring-2 ring-slate-300"
        >
          Add class
        </button>
      </form>

      {#if removingClass}
        <div
          class="flex flex-col items-start gap-2 rounded-2xl bg-amber-50 p-3"
        >
          <p class="text-amber-900">
            Delete {room.name} and its {room.students.length} student{room
              .students.length === 1
              ? ""
              : "s"} for good?
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700"
              onclick={() => {
                removeClass(room.id);
                removingClass = false;
              }}
            >
              Yes, delete this class
            </button>
            <button
              type="button"
              class="rounded-xl bg-white px-4 py-2 font-semibold text-slate-700 ring-2 ring-slate-300"
              onclick={() => (removingClass = false)}
            >
              Cancel
            </button>
          </div>
        </div>
      {:else}
        <button
          type="button"
          class="self-start rounded-xl bg-white px-4 py-2 font-semibold text-slate-700 ring-2 ring-slate-300"
          onclick={() => (removingClass = true)}
        >
          Delete this class
        </button>
      {/if}
    </div>
  </details>

  <ClassFile />

  <footer class="flex flex-wrap items-center gap-4 text-slate-600">
    <a class="text-sky-700 underline" href={resolve("/privacy")}>
      Privacy: what this app keeps
    </a>
    <span>
      Making an avatar on your own device?
      <a class="text-sky-700 underline" href={resolve("/builder")}
        >Open the builder</a
      >.
    </span>
  </footer>
</main>
