<script lang="ts">
  /**
   * The Builder, in the four places it gets used.
   *
   * On a Student's own device it saves a picture to their downloads, which they
   * turn in like any other assignment. That picture is also their save file: the
   * Avatar is hidden inside it, so dropping it back here brings every choice
   * back.
   *
   * Opened from a Class it belongs to the Teacher's laptop instead. With
   * `?class=` a child builds their own and goes straight into that Class, and
   * the Builder starts over for the next one. With `?student=` the Teacher is
   * changing a Student who got glasses, and with `?me=` they are building their
   * own Avatar. Those last two skip the name question: one already has a name,
   * and the other isn't a Student at all.
   */
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import AvatarFigure from "$lib/AvatarFigure.svelte";
  import Builder from "$lib/Builder.svelte";
  import type { Avatar } from "$lib/avatar";
  import {
    addStudent,
    classById,
    setStudentAvatar,
    setTeacherAvatar,
    studentById,
    teacherAvatar,
  } from "$lib/classroom.svelte";
  import { cutoutProblem, readCutout } from "$lib/cutout/codec";
  import {
    cutoutFileName,
    cutoutPng,
    download,
    STUDENT_CUTOUT_HEIGHT,
  } from "$lib/cutout/save";
  import { lastAvatar, rememberAvatar } from "$lib/device";
  import { onMount } from "svelte";

  interface Made {
    avatar: Avatar;
    name: string;
  }

  const room = $derived(classById(page.url.searchParams.get("class")));
  const editing = $derived(
    room
      ? studentById(room, page.url.searchParams.get("student") ?? undefined)
      : undefined,
  );
  const mode = $derived(
    editing
      ? "student"
      : page.url.searchParams.has("me")
        ? "me"
        : room
          ? "class"
          : "own",
  );
  const asksName = $derived(mode === "class" || mode === "own");

  const FINISH = {
    own: "Save my picture",
    class: "I'm done",
    student: "Save changes",
    me: "Save my avatar",
  };

  let start = $state<{ avatar?: Avatar; name: string }>({ name: "" });
  /** Bumped to start the Builder again from different choices. */
  let attempt = $state(0);
  let finished = $state<Made | null>(null);
  let message = $state("");
  let dropping = $state(false);

  onMount(() => {
    if (mode === "student") {
      start = { avatar: editing!.avatar, name: editing!.name };
      attempt += 1;
      return;
    }
    if (mode === "me") {
      const mine = teacherAvatar();
      if (mine) {
        start = { avatar: mine, name: "" };
        attempt += 1;
      }
      return;
    }
    if (page.url.searchParams.has("class")) {
      // A Class tab that isn't in this browser is worth saying out loud, since
      // the Teacher would otherwise wonder where their Student went.
      if (!room)
        message =
          "That class isn't in this browser, so this avatar won't be added to it.";
      return;
    }
    const remembered = lastAvatar();
    if (!remembered) return;
    start = remembered;
    attempt += 1;
  });

  async function save(made: Made) {
    const picture = await cutoutPng({
      avatar: made.avatar,
      framing: "head",
      height: STUDENT_CUTOUT_HEIGHT,
      data: made,
    });
    download(picture, cutoutFileName(made.name));
  }

  async function finish(made: Made) {
    if (mode === "student") {
      setStudentAvatar(room!.id, editing!.id, made.avatar);
      await goto(resolve("/"));
      return;
    }
    if (mode === "me") {
      setTeacherAvatar(made.avatar);
      await goto(resolve("/"));
      return;
    }
    if (mode === "class") {
      addStudent(room!.id, made);
      message = `${made.name} is in the class. The next student can start!`;
      start = { name: "" };
      attempt += 1;
      return;
    }

    finished = made;
    rememberAvatar(made);
    try {
      await save(made);
    } catch {
      message = "Your browser couldn't save the picture. Try again.";
    }
  }

  async function open(file: File | undefined) {
    if (!file) return;
    const reading = readCutout(new Uint8Array(await file.arrayBuffer()));
    if (reading.kind !== "cutout") {
      message = cutoutProblem(reading) ?? "";
      return;
    }
    message = "";
    finished = null;
    start = { avatar: reading.avatar, name: reading.name };
    attempt += 1;
  }

  function startAgain() {
    finished = null;
    start = { name: "" };
    attempt += 1;
  }
</script>

<svelte:window
  ondragover={(event) => {
    if (mode !== "own") return;
    event.preventDefault();
    dropping = true;
  }}
  ondragleave={() => (dropping = false)}
  ondrop={(event) => {
    if (mode !== "own") return;
    event.preventDefault();
    dropping = false;
    open(event.dataTransfer?.files[0]);
  }}
/>

<main class="min-h-dvh {dropping ? 'bg-sky-100' : ''}">
  <div aria-live="polite" class="mx-auto max-w-3xl px-4 pt-4">
    {#if message}
      <p
        class="rounded-2xl bg-amber-100 px-4 py-3 text-lg text-amber-900 ring-1 ring-amber-300"
      >
        {message}
      </p>
    {/if}
  </div>

  {#if mode === "student" || mode === "me"}
    <p class="mx-auto max-w-5xl px-4 pt-2 text-lg text-slate-600">
      {mode === "me"
        ? "Building your own avatar."
        : `Changing ${editing?.name}'s avatar.`}
    </p>
  {/if}

  {#if finished}
    <div
      class="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-10 text-center"
    >
      <h1 class="text-3xl font-semibold text-slate-900">
        Nice work, {finished.name}!
      </h1>
      <p class="text-lg text-slate-600">
        Your picture is in your downloads. Turn it in the way your teacher
        asked.
      </p>
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
        class="rounded-2xl px-6 py-3 text-lg font-semibold ring-2 ring-slate-300"
        onclick={() => finished && save(finished)}
      >
        Save it again
      </button>
      <button
        type="button"
        class="rounded-2xl bg-sky-600 px-6 py-3 text-lg font-semibold text-white hover:bg-sky-700"
        onclick={startAgain}
      >
        Start again
      </button>
      <a class="text-sky-700 underline" href={resolve("/")}>Back to the start</a
      >
    </div>
  {:else}
    {#key attempt}
      <Builder
        avatar={start.avatar}
        name={start.name}
        askName={asksName}
        finishLabel={FINISH[mode]}
        onfinish={finish}
      />
    {/key}

    {#if mode === "own"}
      <div class="mx-auto max-w-5xl px-4 pb-10">
        <label
          class="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700 ring-2 ring-slate-300 hover:ring-slate-400"
        >
          Open my saved picture
          <input
            type="file"
            accept="image/png"
            class="sr-only"
            onchange={(event) => {
              const input = event.currentTarget;
              open(input.files?.[0]);
              input.value = "";
            }}
          />
        </label>
        <p class="pt-2 text-slate-600">
          Already made one? Drop your saved picture here to keep working on it.
        </p>
      </div>
    {/if}
  {/if}
  <footer class="mx-auto max-w-5xl px-4 pb-8">
    <a class="text-sky-700 underline" href={resolve("/privacy")}>
      Privacy: what this app keeps
    </a>
  </footer>
</main>
