<script lang="ts">
  /**
   * The Builder: one question at a time, every answer a picture.
   *
   * A K–2 Student who can't read yet has to be able to finish this alone, so
   * nothing here is a menu, a slider or a word they have to read. The only
   * typing is their first name, at the end. Every option is a real button, so
   * it works by keyboard and a screen reader announces it by name.
   */
  import { untrack } from "svelte";
  import AvatarFigure from "./AvatarFigure.svelte";
  import { defaultAvatar, type Avatar } from "./avatar";
  import {
    choices,
    clothingColors,
    expressions,
    eyewear,
    hairColors,
    hairstyles,
    skinTones,
    type ColorEntry,
    type PartEntry,
    type PartList,
  } from "./catalog";

  interface Props {
    /** The choices to start from, for a Student who is changing their Avatar. */
    avatar?: Avatar;
    name?: string;
    /** The Teacher's own Avatar skips the name question (ticket 07). */
    askName?: boolean;
    finishLabel?: string;
    onfinish?: (finished: { avatar: Avatar; name: string }) => void;
  }

  let {
    avatar: startingAvatar,
    name: startingName = "",
    askName = true,
    finishLabel = "I'm done",
    onfinish,
  }: Props = $props();

  type Step = {
    part: keyof Avatar;
    /** The word on the step button. */
    title: string;
    question: string;
    list: PartList<PartEntry | ColorEntry>;
    /** A color the Avatar never shows on a head-only picture gets a swatch. */
    swatch?: boolean;
  };

  const steps: Step[] = [
    {
      part: "skinTone",
      title: "Skin",
      question: "Pick your skin tone",
      list: skinTones,
    },
    {
      part: "hairstyle",
      title: "Hair",
      question: "Pick your hair",
      list: hairstyles,
    },
    {
      part: "hairColor",
      title: "Hair color",
      question: "Pick your hair color",
      list: hairColors,
    },
    {
      part: "eyewear",
      title: "Glasses",
      question: "Do you wear glasses?",
      list: eyewear,
    },
    {
      part: "expression",
      title: "Face",
      question: "Pick your favorite face",
      list: expressions,
    },
    {
      part: "clothingColor",
      title: "Clothes",
      question: "Pick your clothes color",
      list: clothingColors,
      swatch: true,
    },
  ];

  // The Builder starts from whatever it was given and owns its choices after
  // that, so it deliberately reads these props only once.
  let avatar = $state<Avatar>(
    untrack(() => ({ ...(startingAvatar ?? defaultAvatar()) })),
  );
  let name = $state(untrack(() => startingName));
  let stepNumber = $state(0);

  const lastStep = $derived(askName ? steps.length : steps.length - 1);
  const step = $derived(
    stepNumber < steps.length ? steps[stepNumber] : undefined,
  );
  const onNameStep = $derived(stepNumber === steps.length);
  const canFinish = $derived(!askName || name.trim().length > 0);

  function pick(part: keyof Avatar, position: number) {
    avatar = { ...avatar, [part]: position };
  }

  /** What the option's picture shows: this Avatar with just that part changed. */
  function sample(part: keyof Avatar, position: number): Avatar {
    return { ...avatar, [part]: position };
  }

  function label(entry: PartEntry | ColorEntry): string {
    return entry.label;
  }

  function swatchColor(entry: PartEntry | ColorEntry): string {
    return "hex" in entry ? entry.hex : "transparent";
  }

  function finish() {
    if (!canFinish) return;
    onfinish?.({ avatar: { ...avatar }, name: name.trim() });
  }
</script>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
  <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
    <div class="mx-auto w-40 shrink-0 sm:sticky sm:top-6 sm:mx-0 sm:w-56">
      <div class="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
        <AvatarFigure {avatar} title="Your avatar" class="h-auto w-full" />
      </div>
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-4">
      <nav aria-label="Steps" class="flex flex-wrap gap-2">
        {#each steps as navStep, index (navStep.part)}
          <button
            type="button"
            aria-current={stepNumber === index ? "step" : undefined}
            class="rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-slate-300 {stepNumber ===
            index
              ? 'bg-slate-900 text-white ring-slate-900'
              : 'bg-white text-slate-700 hover:bg-slate-100'}"
            onclick={() => (stepNumber = index)}
          >
            {navStep.title}
          </button>
        {/each}
        {#if askName}
          <button
            type="button"
            aria-current={onNameStep ? "step" : undefined}
            class="rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-slate-300 {onNameStep
              ? 'bg-slate-900 text-white ring-slate-900'
              : 'bg-white text-slate-700 hover:bg-slate-100'}"
            onclick={() => (stepNumber = steps.length)}
          >
            Name
          </button>
        {/if}
      </nav>

      {#if step}
        <h2 class="text-2xl font-semibold text-slate-900">{step.question}</h2>
        <ul
          class="grid grid-cols-3 gap-3 sm:grid-cols-5"
          aria-label={step.question}
        >
          {#each choices(step.list) as choice (choice.position)}
            {@const chosen = avatar[step.part] === choice.position}
            <li>
              <button
                type="button"
                aria-pressed={chosen}
                class="flex w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-1 ring-2 {chosen
                  ? 'ring-sky-600'
                  : 'ring-slate-200 hover:ring-slate-400'}"
                onclick={() => pick(step.part, choice.position)}
              >
                {#if step.swatch}
                  <span
                    class="block aspect-square w-full rounded-xl ring-1 ring-slate-200"
                    style="background-color: {swatchColor(choice.entry)}"
                  ></span>
                {:else}
                  <AvatarFigure
                    avatar={sample(step.part, choice.position)}
                    class="h-auto w-full"
                  />
                {/if}
                <span class="sr-only">{label(choice.entry)}</span>
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <h2 class="text-2xl font-semibold text-slate-900">
          <label for="first-name">What's your first name?</label>
        </h2>
        <input
          id="first-name"
          type="text"
          autocomplete="off"
          bind:value={name}
          class="w-full max-w-sm rounded-2xl border-2 border-slate-300 px-4 py-3 text-2xl focus:border-sky-600 focus:outline-none"
        />
      {/if}

      <div class="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          class="rounded-2xl px-5 py-3 text-lg font-semibold ring-2 ring-slate-300 disabled:opacity-40"
          disabled={stepNumber === 0}
          onclick={() => (stepNumber = Math.max(0, stepNumber - 1))}
        >
          Back
        </button>
        {#if stepNumber < lastStep}
          <button
            type="button"
            class="rounded-2xl bg-sky-600 px-6 py-3 text-lg font-semibold text-white hover:bg-sky-700"
            onclick={() => (stepNumber = Math.min(lastStep, stepNumber + 1))}
          >
            Next
          </button>
        {/if}
        <!-- A child works through to the name question, which is what finishes
             their Avatar. A Teacher changing one glasses choice shouldn't have
             to click to the end, so with no name to ask, saving is always here. -->
        {#if !askName || stepNumber === lastStep}
          <button
            type="button"
            class="rounded-2xl bg-emerald-600 px-6 py-3 text-lg font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
            disabled={!canFinish}
            onclick={finish}
          >
            {finishLabel}
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>
