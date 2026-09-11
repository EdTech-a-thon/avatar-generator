<script lang="ts">
  /**
   * Making the behavior chart: a whole Class of Cutouts, the way the Teacher
   * wants them this time.
   *
   * Each Student's own favorite Expression and clothing color are what the set
   * uses, because that is what makes a chart look like a class rather than a
   * uniform. The two overrides are there for the times a Teacher wants the
   * opposite: one face for everybody, or school colors for spirit week. What
   * goes in the picture never changes what is hidden inside it — the Avatar
   * data is always the Student's own.
   */
  import AvatarFigure from "./AvatarFigure.svelte";
  import { defaultAvatar } from "./avatar";
  import {
    choices,
    clothingColors,
    entryAt,
    expressions,
    poses,
  } from "./catalog";
  import { chart, chartClothingColor, chartExpression } from "./chart.svelte";
  import {
    teacherAvatar,
    type Classroom,
    type Student,
  } from "./classroom.svelte";
  import { download } from "./cutout/save";
  import { cutoutSetFileName, cutoutSetZip } from "./cutout/set";
  import type { Framing } from "./render";

  let { room }: { room: Classroom } = $props();

  let busy = $state(false);
  let trouble = $state("");

  const mine = $derived(teacherAvatar());
  /** Someone to show the Pose pictures on: a Student if there is one. */
  const sample = $derived(room.students[0]?.avatar ?? mine ?? defaultAvatar());

  const everyone = $derived<Student[]>([
    ...room.students,
    ...(chart.includeMe && mine
      ? [{ id: "me", name: "Teacher", avatar: mine }]
      : []),
  ]);

  const expression = $derived(chartExpression());
  const clothingColor = $derived(chartClothingColor());
  const poseLabel = $derived(
    chart.framing === "bust" ? entryAt(poses, chart.pose).label : undefined,
  );

  async function downloadSet() {
    busy = true;
    trouble = "";
    try {
      const zip = await cutoutSetZip({
        className: room.name,
        students: everyone,
        framing: chart.framing,
        pose: chart.pose,
        expression,
        clothingColor,
        label: chart.withNames,
      });
      download(zip, cutoutSetFileName(room.name, poseLabel));
    } catch {
      trouble =
        "Your browser couldn't make the pictures. Try again, or try a smaller class.";
    } finally {
      busy = false;
    }
  }
</script>

<section
  aria-label="Chart pieces"
  class="flex flex-col gap-4 rounded-3xl bg-white p-4 ring-1 ring-slate-200"
>
  <div class="flex flex-col gap-1">
    <h2 class="text-xl font-semibold text-slate-900">Chart pieces</h2>
    <p class="text-slate-600">
      One picture per student, on a see-through background, big enough to print
      and laminate. Every picture carries its avatar, so this set is also a way
      to get your class back.
    </p>
  </div>

  <fieldset class="flex flex-wrap items-center gap-2">
    <legend class="pb-1 font-semibold text-slate-800">How much of them</legend>
    {#each [{ value: "head", label: "Just faces" }, { value: "bust", label: "Head and shoulders" }] as option (option.value)}
      <button
        type="button"
        aria-pressed={chart.framing === option.value}
        class="rounded-full px-4 py-2 font-semibold ring-2 {chart.framing ===
        option.value
          ? 'bg-slate-900 text-white ring-slate-900'
          : 'bg-white text-slate-700 ring-slate-300'}"
        onclick={() => (chart.framing = option.value as Framing)}
      >
        {option.label}
      </button>
    {/each}
  </fieldset>

  {#if chart.framing === "bust"}
    <div class="flex flex-col gap-2">
      <h3 class="font-semibold text-slate-800">Pick a pose for everyone</h3>
      <ul
        class="grid grid-cols-3 gap-2 sm:grid-cols-6"
        aria-label="Pick a pose for everyone"
      >
        {#each choices(poses) as choice (choice.position)}
          <li>
            <button
              type="button"
              aria-pressed={chart.pose === choice.position}
              class="w-full rounded-2xl bg-white p-1 ring-2 {chart.pose ===
              choice.position
                ? 'ring-sky-600'
                : 'ring-slate-200 hover:ring-slate-400'}"
              onclick={() => (chart.pose = choice.position)}
            >
              <AvatarFigure
                avatar={sample}
                framing="bust"
                pose={choice.position}
                class="h-auto w-full"
              />
              <span class="sr-only">{choice.entry.label}</span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="flex flex-col gap-3">
    <label class="flex items-center gap-2 text-lg text-slate-700">
      <input
        type="checkbox"
        bind:checked={chart.sameFace}
        class="h-5 w-5 accent-sky-600"
      />
      Give everyone the same face
    </label>
    {#if chart.sameFace}
      <ul
        class="grid grid-cols-4 gap-2 sm:grid-cols-8"
        aria-label="One face for everyone"
      >
        {#each choices(expressions) as choice (choice.position)}
          <li>
            <button
              type="button"
              aria-pressed={chart.face === choice.position}
              class="w-full rounded-2xl bg-white p-1 ring-2 {chart.face ===
              choice.position
                ? 'ring-sky-600'
                : 'ring-slate-200 hover:ring-slate-400'}"
              onclick={() => (chart.face = choice.position)}
            >
              <AvatarFigure
                avatar={sample}
                expression={choice.position}
                class="h-auto w-full"
              />
              <span class="sr-only">{choice.entry.label}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    <label class="flex items-center gap-2 text-lg text-slate-700">
      <input
        type="checkbox"
        bind:checked={chart.sameClothes}
        class="h-5 w-5 accent-sky-600"
      />
      Give everyone the same clothes color
    </label>
    {#if chart.sameClothes}
      <ul
        class="grid grid-cols-5 gap-2 sm:grid-cols-10"
        aria-label="One clothes color for everyone"
      >
        {#each choices(clothingColors) as choice (choice.position)}
          <li>
            <button
              type="button"
              aria-pressed={chart.clothes === choice.position}
              class="w-full rounded-2xl bg-white p-1 ring-2 {chart.clothes ===
              choice.position
                ? 'ring-sky-600'
                : 'ring-slate-200 hover:ring-slate-400'}"
              onclick={() => (chart.clothes = choice.position)}
            >
              <span
                class="block aspect-square w-full rounded-xl ring-1 ring-slate-200"
                style="background-color: {choice.entry.hex}"
              ></span>
              <span class="sr-only">{choice.entry.label}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    <label class="flex items-center gap-2 text-lg text-slate-700">
      <input
        type="checkbox"
        bind:checked={chart.withNames}
        class="h-5 w-5 accent-sky-600"
      />
      Put names under the pictures
    </label>

    <label class="flex items-center gap-2 text-lg text-slate-700">
      <input
        type="checkbox"
        bind:checked={chart.includeMe}
        disabled={!mine}
        class="h-5 w-5 accent-sky-600 disabled:opacity-40"
      />
      Include me
      {#if !mine}
        <span class="text-slate-500">(make your own avatar first)</span>
      {/if}
    </label>
  </div>

  <div class="flex flex-col gap-2">
    <h3 class="font-semibold text-slate-800">What you'll get</h3>
    <!-- Not a list: the Class list above is the list of Students, and two of
         them would make "the students" ambiguous to a screen reader. -->
    <div role="group" aria-label="What you'll get" class="flex flex-wrap gap-3">
      {#each everyone.slice(0, 6) as student (student.id)}
        <div class="flex w-24 flex-col items-center rounded-2xl bg-sky-50 p-2">
          <AvatarFigure
            avatar={student.avatar}
            framing={chart.framing}
            pose={chart.pose}
            {expression}
            {clothingColor}
            title="{student.name}'s chart piece"
            class="h-auto w-full"
          />
          {#if chart.withNames}
            <span class="font-semibold text-slate-800">{student.name}</span>
          {/if}
        </div>
      {/each}
      {#if everyone.length > 6}
        <p class="self-center text-slate-600">and {everyone.length - 6} more</p>
      {/if}
    </div>
  </div>

  <div aria-live="polite">
    {#if trouble}
      <p
        class="rounded-2xl bg-amber-100 px-4 py-3 text-amber-900 ring-1 ring-amber-300"
      >
        {trouble}
      </p>
    {/if}
  </div>

  <button
    type="button"
    disabled={busy}
    class="self-start rounded-2xl bg-sky-600 px-6 py-3 text-lg font-semibold text-white hover:bg-sky-700 disabled:opacity-40"
    onclick={downloadSet}
  >
    Download all cutouts
  </button>
</section>
