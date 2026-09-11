<script lang="ts">
  /**
   * The page a Teacher shows their principal.
   *
   * It is written to be read out loud, and every line of it is something the
   * app actually does rather than something it promises to do carefully: there
   * is no server to store anything on, no account to make, and no request to
   * anyone else (ADR 0008). An end-to-end test fails if any screen asks another
   * origin for anything.
   */
  import { resolve } from "$app/paths";
</script>

<main class="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
  <h1 class="text-3xl font-semibold text-slate-900">Privacy</h1>

  <p class="text-lg text-slate-700">
    This app makes cartoon avatars for classroom charts. It works entirely
    inside your browser.
  </p>

  <ul class="flex flex-col gap-3 text-lg text-slate-700">
    <li>
      <strong>Nothing is stored on any server.</strong> There is no server to store
      it on. Your classes live in this browser, and in the class file you choose to
      download.
    </li>
    <li>
      <strong>There are no accounts.</strong> Nobody signs in, so nobody hands over
      a name, an email address or a password.
    </li>
    <li>
      <strong>There are no ads, no analytics and no tracking.</strong> The app makes
      no requests to any other company. The pictures, the font and everything else
      are served by the app itself.
    </li>
    <li>
      <strong>Student data is never sold, and never shared.</strong> It never leaves
      your device unless you download a file and send it somewhere yourself.
    </li>
    <li>
      <strong>There are no photos.</strong> Avatars are drawings a student picks from
      a list. The app never takes, uploads or looks at a picture of a child.
    </li>
    <li>
      <strong>You can delete anything, any time.</strong> Remove a student, delete
      a whole class, or clear this site's data in your browser, and it is gone for
      good.
    </li>
  </ul>

  <h2 class="text-2xl font-semibold text-slate-900">What is kept, and where</h2>
  <p class="text-lg text-slate-700">
    A student's avatar is a handful of numbers — which hair, which skin tone,
    which face — plus the first name they typed. That is stored in this
    browser's local storage, and inside each picture you download. Clearing your
    browser data, or using a school device that wipes itself, deletes it. That
    is what the class file is for.
  </p>

  <h2 class="text-2xl font-semibold text-slate-900">The drawings</h2>
  <p class="text-lg text-slate-700">
    The artwork is <a
      class="text-sky-700 underline"
      href="https://www.openpeeps.com/">Open Peeps</a
    >
    by Pablo Stanley, released into the public domain.
  </p>

  <a class="text-lg text-sky-700 underline" href={resolve("/")}
    >Back to my class</a
  >
</main>
