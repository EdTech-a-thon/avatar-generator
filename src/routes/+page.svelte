<script lang="ts">
  /** Class setup comes first; Students can make their Avatars now or later. */
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import AvatarFigure from "$lib/AvatarFigure.svelte";
  import { defaultAvatar } from "$lib/avatar";
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
  let studentNames = $state("");
  let search = $state("");
  let showNames = $state(false);
  const namesToAdd = $derived(
    studentNames
      .split("\n")
      .map((name) => name.trim())
      .filter(Boolean),
  );
  const visibleStudents = $derived(
    room?.students.filter((student) =>
      student.name
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
    ) ?? [],
  );
  const readyRoom = $derived(
    room
      ? {
          ...room,
          students: room.students.filter((student) => !student.needsAvatar),
        }
      : undefined,
  );
  const ready = $derived(readyRoom?.students.length ?? 0);

  function addNames(event: SubmitEvent) {
    event.preventDefault();
    if (!room || namesToAdd.length === 0) return;
    const count = namesToAdd.length;
    for (const name of namesToAdd)
      addStudent(room.id, { name, avatar: defaultAvatar(), needsAvatar: true });
    added = `Added ${count} student${count === 1 ? "" : "s"}. Choose “Make avatar” when each student is ready.`;
    studentNames = "";
    showNames = false;
    search = "";
  }

  /** Everything half-open belongs to the Class being left, so it goes with it. */
  function switchClass(id: string) {
    selectClass(id);
    search = "";
    renaming = undefined;
    removing = undefined;
    removingClass = false;
    studentNames = "";
    classNameEdit = classes().find((group) => group.id === id)?.name ?? "";
  }

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

  let classSettings = $state(false);
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
  class="teacher-page mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8 {dropping
    ? 'bg-sky-100'
    : ''}"
>
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5"
  >
    <a href={resolve("/")} class="text-xl font-semibold text-slate-900"
      >Avatar Generator<span class="ml-3 text-sm font-normal text-slate-500"
        >For teachers</span
      ></a
    >
    <a
      class="rounded-xl bg-white px-4 py-3 font-semibold text-sky-800 ring-1 ring-sky-200"
      href={resolve("/builder")}>I'm a student → Make an avatar</a
    >
  </div>
  <header class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex flex-col gap-2">
      <p class="text-sm font-semibold uppercase tracking-widest text-sky-700">
        Your classes, your students
      </p>
      <h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">
        {room?.name ?? "My class"}
      </h1>
      <p class="max-w-xl text-slate-600">
        Set up a class, add your students, then let each student make an avatar.
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

  <section
    aria-label="Class setup"
    class="rounded-3xl bg-white p-5 ring-1 ring-slate-200"
  >
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4"
    >
      <label
        class="flex min-w-0 flex-1 flex-col gap-2 font-semibold text-slate-800"
      >
        Current class
        <select
          class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-lg"
          value={room?.id ?? ""}
          onchange={(event) => switchClass(event.currentTarget.value)}
        >
          {#each classes() as group (group.id)}
            <option value={group.id}
              >{group.name} · {group.students.length}
              {group.students.length === 1 ? "student" : "students"}</option
            >
          {/each}
        </select>
      </label>
      <button
        type="button"
        class="rounded-xl bg-sky-50 px-4 py-3 font-semibold text-sky-800 ring-1 ring-sky-200"
        aria-expanded={classSettings}
        onclick={() => {
          classSettings = !classSettings;
          classNameEdit = classSettings ? (room?.name ?? "") : "";
        }}>Manage classes</button
      >
    </div>
    {#if classSettings}
      <div class="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4">
        <form
          class="flex flex-wrap items-end gap-2"
          onsubmit={(event) => {
            event.preventDefault();
            renameClass(room.id, classNameEdit);
            classNameEdit = room.name;
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
            const group = addClass(newClassName);
            switchClass(group.id);
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
    {/if}
  </section>

  <section
    aria-label="Add students"
    class="rounded-3xl bg-sky-100/60 p-5 ring-1 ring-sky-200"
  >
    <h2 class="text-xl font-semibold text-slate-900">
      Bring your class together
    </h2>
    <p class="mt-1 text-slate-600">
      Add names first, take turns on this device, or collect pictures from
      students’ own devices.
    </p>
    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="rounded-2xl bg-sky-700 px-5 py-3 font-semibold text-white hover:bg-sky-800"
        aria-expanded={showNames}
        onclick={() => (showNames = !showNames)}>Add student names</button
      >
      <button
        type="button"
        class="rounded-2xl bg-white px-5 py-3 font-semibold text-sky-800 ring-1 ring-sky-200 hover:bg-sky-50"
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
    <p class="mt-3 text-sm text-slate-600">
      “Add a student” opens a new tab for taking turns. Saved PNG pictures can
      also be dropped onto this page.
    </p>
    {#if showNames}
      <form
        onsubmit={addNames}
        class="mt-5 flex flex-col gap-3 border-t border-sky-200 pt-5"
      >
        <label for="student-names" class="font-semibold text-slate-900"
          >Student first names</label
        >
        <p id="names-help" class="text-sm text-slate-600">
          One per line. Use a last initial if needed. Students choose their own
          appearance later.
        </p>
        <textarea
          id="student-names"
          aria-describedby="names-help"
          rows="5"
          placeholder="Maya\nLeo\nAva R."
          bind:value={studentNames}
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg"
        ></textarea>
        <div class="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={namesToAdd.length === 0}
            class="rounded-xl bg-sky-700 px-5 py-3 font-semibold text-white disabled:opacity-40"
            >Add {namesToAdd.length || ""}
            {namesToAdd.length === 1 ? "name" : "names"} to class</button
          >
          <button
            type="button"
            class="rounded-xl px-4 py-3 font-semibold text-slate-700"
            onclick={() => (showNames = false)}>Cancel</button
          >
        </div>
      </form>
    {/if}
  </section>

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
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-slate-900">
          Students <span class="text-lg font-normal text-slate-500"
            >({room.students.length})</span
          >
        </h2>
        <p class="text-slate-600">
          {ready}
          {ready === 1 ? "avatar" : "avatars"} ready · {room.students.length -
            ready} to make
        </p>
      </div>
      <label class="flex flex-col gap-1 text-sm text-slate-600"
        >Find a student<input
          type="search"
          bind:value={search}
          placeholder="Search by name"
          class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
        /></label
      >
    </div>
    {#if visibleStudents.length === 0}<p class="text-slate-600">
        No students match “{search}”. Try another name.
      </p>{/if}
    <ul
      class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
      aria-label="Students"
    >
      {#each visibleStudents as student (student.id)}
        <li
          class="flex flex-col items-center gap-2 rounded-3xl bg-white p-3 ring-1 ring-slate-200"
        >
          {#if student.needsAvatar}
            <div
              class="flex aspect-square w-full items-center justify-center rounded-2xl bg-sky-50 text-5xl font-semibold text-sky-300"
              aria-hidden="true"
            >
              {student.name.slice(0, 1).toLocaleUpperCase()}
            </div>
          {:else}
            <AvatarFigure
              avatar={student.avatar}
              title="{student.name}'s avatar"
              class="h-auto w-full"
            />
          {/if}
          <span
            class="max-w-full break-words text-center text-lg font-semibold text-slate-800"
            >{student.name}</span
          >
          {#if student.needsAvatar}<span class="text-sm text-slate-500"
              >Ready to make an avatar</span
            >{/if}

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
            <div
              class="student-actions flex w-full flex-wrap justify-center gap-2"
            >
              <button
                type="button"
                class="w-full rounded-xl bg-sky-700 px-3 py-3 font-semibold text-white hover:bg-sky-800"
                onclick={() =>
                  openBuilder(`class=${room.id}&student=${student.id}`)}
              >
                {student.needsAvatar ? "Make avatar" : "Change avatar"}
              </button>
              {#if !student.needsAvatar}
                <button
                  type="button"
                  class="w-full rounded-xl bg-white px-3 py-2 font-semibold text-slate-700 ring-1 ring-slate-300"
                  onclick={() => downloadOne(student)}
                >
                  Download
                </button>
              {/if}
              <button
                type="button"
                class="flex-1 rounded-xl bg-white px-2 py-2 font-semibold text-slate-700 ring-1 ring-slate-300"
                onclick={() => startRenaming(student.id, student.name)}
              >
                Rename
              </button>
              <button
                type="button"
                class="flex-1 rounded-xl bg-white px-2 py-2 font-semibold text-slate-700 ring-1 ring-slate-300"
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
      No students yet. Add their names together, or tap “Add a student” to make
      the first avatar on this device.
    </p>
  {/if}

  {#if readyRoom && readyRoom.students.length > 0}
    <ChartPieces room={readyRoom} />
  {/if}

  <aside
    class="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600"
  >
    <strong class="text-slate-800">Saved on this browser only.</strong> No accounts,
    no photos, nothing on a server. Download a class file below to keep a copy or
    move to another device.
  </aside>
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
