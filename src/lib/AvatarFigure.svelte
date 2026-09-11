<script lang="ts">
  /**
   * One Avatar, drawn as real SVG elements rather than a canvas, so a screen
   * reader can name it and the browser can scale it to any size without blur.
   */
  import type { Avatar } from "./avatar";
  import { figure, type Framing } from "./render";

  interface Props {
    avatar: Avatar;
    framing?: Framing;
    pose?: number;
    expression?: number;
    clothingColor?: number;
    /** Given only when the picture means something on its own. */
    title?: string;
    class?: string;
  }

  let {
    avatar,
    framing = "head",
    pose,
    expression,
    clothingColor,
    title,
    class: className = "",
  }: Props = $props();

  const drawn = $derived(
    figure({ avatar, framing, pose, expression, clothingColor }),
  );
</script>

<svg
  viewBox={drawn.viewBox}
  class={className}
  xmlns="http://www.w3.org/2000/svg"
  role={title ? "img" : "presentation"}
  aria-label={title}
  aria-hidden={title ? undefined : "true"}
>
  {#each drawn.groups as group, index (index)}
    <g transform={group.transform}>
      {#each group.paths as path, order (order)}
        <path
          d={path.d}
          transform={path.transform}
          fill={path.fill}
          fill-rule={path.fillRule}
        />
      {/each}
    </g>
  {/each}
</svg>
