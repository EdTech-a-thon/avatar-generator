<script lang="ts">
  import "../app.css";
  import { startClassroom } from "$lib/classroom.svelte";

  // Runs before any page is created, so a Builder tab opened straight from a
  // link already has the Teacher's Classes loaded. It does nothing on a server.
  startClassroom();

  let { children } = $props();
</script>

<div class="min-h-dvh">
  {@render children()}
</div>
