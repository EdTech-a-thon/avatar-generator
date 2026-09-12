<script lang="ts">
  /**
   * The Builder: one question at a time, every answer a picture.
   *
   * A K–2 Student who can't read yet has to be able to finish this alone, so
   * nothing here is a menu, a slider or a word they have to read. The only
   * typing is their first name, at the end. Every option is a real button, so
   * it works by keyboard and a screen reader announces it by name.
   */
  import { tick, untrack } from "svelte";
  import AvatarFigure from "./AvatarFigure.svelte";
  import { defaultAvatar, type Avatar } from "./avatar";
  import {
    ages,
    choices,
    clothingColors,
    expressions,
    eyewear,
    hairColors,
    hairstyles,
    skinTones,
    type AgeEntry,
    type ColorEntry,
    type PartEntry,
    type PartList,
  } from "./catalog";
  import type { Framing } from "./render";

  /** Every list a step can show. All three kinds of entry carry a label. */
  type AnyEntry = PartEntry | ColorEntry | AgeEntry;

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
    list: PartList<AnyEntry>;
    /** A color the Avatar never shows on a head-only picture gets a swatch. */
    swatch?: boolean;
    /** Head and shoulders, for a choice that a head on its own can't show. */
    framing?: Framing;
  };

  const steps: Step[] = [
    {
      // First, because it changes the shape of every picture after it.
      part: "age",
      title: "Age",
      question: "How old are you?",
      list: ages,
      framing: "bust",
    },
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
      framing: "bust",
    },
  ];

  // The Builder starts from whatever it was given and owns its choices after
  // that, so it deliberately reads these props only once.
  let avatar = $state<Avatar>(
    untrack(() => ({ ...(startingAvatar ?? defaultAvatar()) })),
  );
  let name = $state(untrack(() => startingName));
  let stepNumber = $state(0);
  let optionsPane = $state<HTMLUListElement | undefined>();
  let question = $state<HTMLHeadingElement | undefined>();

  async function changeStep(next: number) {
    stepNumber = next;
    await tick();
    if (optionsPane) optionsPane.scrollTop = 0;
    question?.focus({ preventScroll: true });
  }

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

  function label(entry: AnyEntry): string {
    return entry.label;
  }

  function swatchColor(entry: AnyEntry): string {
    return "hex" in entry ? entry.hex : "transparent";
  }

  function finish() {
    if (!canFinish) return;
    onfinish?.({ avatar: { ...avatar }, name: name.trim() });
  }
</script>

<div class="builder-shell">
  <div class="builder-workspace">
    <div class="builder-preview">
      <div
        class="h-full rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-200 sm:p-4"
      >
        <AvatarFigure
          {avatar}
          framing={onNameStep ? "bust" : (step?.framing ?? "head")}
          title="Your avatar"
          class="h-full w-full"
        />
      </div>
      <p class="mt-4 hidden text-center text-lg text-slate-600 sm:block">
        Looking good!<br />Make it feel like you.
      </p>
    </div>

    <div class="builder-editor">
      <nav aria-label="Steps" class="builder-steps flex flex-wrap gap-2">
        {#each steps as navStep, index (navStep.part)}
          <button
            type="button"
            aria-current={stepNumber === index ? "step" : undefined}
            class="rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-slate-300 {stepNumber ===
            index
              ? 'bg-slate-900 text-white ring-slate-900'
              : 'bg-white text-slate-700 hover:bg-slate-100'}"
            onclick={() => changeStep(index)}
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
            onclick={() => changeStep(steps.length)}
          >
            Name
          </button>
        {/if}
      </nav>

      {#if step}
        <h2
          bind:this={question}
          tabindex="-1"
          class="builder-question text-xl font-semibold text-slate-900 sm:text-2xl"
        >
          <span class="mb-1 block text-sm font-normal text-sky-700"
            >Step {stepNumber + 1} of {lastStep + 1}</span
          >{step.question}
        </h2>
        <ul
          bind:this={optionsPane}
          class="builder-options grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5"
          aria-label={step.question}
        >
          {#each choices(step.list) as choice (choice.position)}
            {@const chosen = avatar[step.part] === choice.position}
            <li>
              <button
                type="button"
                aria-pressed={chosen}
                class="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-1 ring-2 {chosen
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
                    framing={step.framing ?? "head"}
                    class="h-auto w-full"
                  />
                {/if}
                {#if chosen}<span
                    aria-hidden="true"
                    class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-700 text-sm text-white"
                    >✓</span
                  >{/if}
                <span class="sr-only">{label(choice.entry)}</span>
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <h2
          bind:this={question}
          tabindex="-1"
          class="builder-question text-xl font-semibold text-slate-900 sm:text-2xl"
        >
          <span class="mb-1 block text-sm font-normal text-sky-700"
            >Last step!</span
          >
          <label for="first-name">What's your first name?</label>
        </h2>
        <div class="builder-name">
          <input
            id="first-name"
            type="text"
            autocomplete="off"
            bind:value={name}
            class="w-full max-w-sm rounded-2xl border-2 border-slate-300 px-4 py-3 text-2xl focus:border-sky-600 focus:outline-none"
          />
          <p class="mt-3 text-slate-600">Just your first name is enough.</p>
        </div>
      {/if}

      <div class="builder-actions flex items-center justify-between gap-3">
        <button
          type="button"
          class="rounded-2xl px-5 py-3 text-lg font-semibold ring-2 ring-slate-300 disabled:opacity-40"
          disabled={stepNumber === 0}
          onclick={() => changeStep(Math.max(0, stepNumber - 1))}
        >
          Back
        </button>
        {#if stepNumber < lastStep}
          <button
            type="button"
            class="rounded-2xl bg-sky-600 px-6 py-3 text-lg font-semibold text-white hover:bg-sky-700"
            onclick={() => changeStep(Math.min(lastStep, stepNumber + 1))}
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

<style>
  .builder-shell {
    display: grid;
    grid-template-columns: 6rem minmax(0, 1fr);
    grid-template-rows: 6rem auto minmax(0, 1fr) auto;
    grid-template-areas: "preview question" "steps steps" "choices choices" "actions actions";
    gap: 1rem;
    width: 100%;
    max-width: 72rem;
    height: calc(100svh - 6.5rem);
    min-height: 30rem;
    margin-inline: auto;
    padding: 0.75rem 1rem;
  }
  .builder-workspace,
  .builder-editor {
    display: contents;
  }
  .builder-preview {
    grid-area: preview;
    min-height: 0;
  }
  .builder-steps {
    grid-area: steps;
  }
  .builder-steps button {
    min-height: 2.75rem;
  }
  .builder-question {
    grid-area: question;
    align-self: center;
  }
  .builder-options {
    grid-area: choices;
    min-height: 0;
    overflow-y: auto;
    align-content: start;
    padding: 0.25rem;
    scrollbar-gutter: stable;
    border-radius: 0.75rem;
    background: #eaf2f8;
  }
  .builder-name {
    grid-area: choices;
    overflow-y: auto;
  }
  .builder-actions {
    grid-area: actions;
    padding-bottom: env(safe-area-inset-bottom);
  }
  .builder-actions button {
    min-width: 0;
  }
  @media (min-width: 640px) {
    .builder-shell {
      grid-template-columns: minmax(10rem, 15rem) minmax(0, 1fr);
      grid-template-rows: auto auto minmax(0, 1fr) auto;
      grid-template-areas: "preview steps" "preview question" "preview choices" ". actions";
      gap: 1.5rem;
      padding: 1rem 2rem;
      max-height: 56rem;
    }
    .builder-preview {
      align-self: start;
      height: 19rem;
    }
  }
</style>
