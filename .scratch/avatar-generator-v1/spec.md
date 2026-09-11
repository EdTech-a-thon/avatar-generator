# Avatar Generator v1

**Status:** ready-for-agent

A free, account-free web app where K–5 Teachers and their Students make illustrated Avatars and download them as Cutouts for behavior charts and classroom decor. Everything stays in the Teacher's browser, and every Cutout carries its Avatar hidden inside the PNG.

Domain language: `CONTEXT.md`. Decisions: ADR 0001, 0002, 0005–0010. ADR 0003 and ADR 0004 are superseded.

## Problem Statement

A K–5 Teacher wants avatars of themselves and their Students in many poses for behavior charts and classroom decor, like "teacher Bitmoji." Bitmoji requires an account and is 13+, so Students can't use it. The free alternatives make one avatar at a time, require sign-ups that bring student data into the picture, or sit behind paywalls. Making 25 avatars by hand is an hour of tedium, and anything that stores photos or student information on someone else's server creates a privacy problem a school has to approve. The Teacher also wants to come back to their avatars later without starting over.

## Solution

A static web app with no accounts and no server-side data. The Teacher creates a Class (usually just one) in their browser, and it saves automatically to local storage. Students build their own Avatars in a picture-only Builder, answering one question at the end: their first name.

- **On the Teacher's device:** "Add a student" opens the Builder in a new tab. Each finished Avatar goes straight into the Class as a new Student, and the tab resets for the next child.
- **On a Student's own device:** the Builder saves a head-only Cutout (a PNG). The Student turns it in through Google Classroom or Seesaw. The Teacher drops the Cutouts into the Class, and each one becomes a new Student, named from the name hidden inside the file.

The Teacher downloads a Cutout Set: every Student in one bust Pose (or head-only), as PNGs in a zip, ready to print or place in Slides. The Teacher can download a Class File at any time and load it back into any browser. Every PNG the app makes also carries its Avatar and name, so any Cutout can be loaded back into the app.

The art is Open Peeps (CC0), used unmodified. Avatars are colored by rule: skin tone on the head, clothing color on the body, and hair color on the hair lines.

## User Stories

### Setting up

1. As a Teacher, I want to start using the app without creating an account, so that I don't hand anyone my or my Students' information.
2. As a Teacher, I want a Class to be ready as soon as I open the app, so that I can start without setup when I only have one Class.
3. As a Teacher, I want to name my Class, so that my downloads are labeled with it.
4. As a Teacher with several groups (for example a specials teacher), I want to create more than one Class, so that each group's Students stay separate.
5. As a Teacher with several Classes, I want to switch between them, so that I can work on one at a time.
6. As a Teacher, I want to rename a Class, so that I can fix a typo or reuse it next year.
7. As a Teacher, I want everything I do to save automatically in my browser, so that closing the tab doesn't lose my work.
8. As a Teacher, I want to read a short, plain-language privacy page, so that I can show my principal the app stores nothing about Students on any server.
9. As a principal or district tech reviewer, I want the app to make no requests to outside services (no ads, analytics or tracking), so that I can approve it without a data agreement.

### My own Avatar

10. As a Teacher, I want to build my own Avatar in the same Builder my Students use, so that I appear on charts alongside them.
11. As a Teacher, I want my own Avatar to be separate from any Class, so that I don't rebuild it for every Class.
12. As a Teacher, I want to edit my own Avatar later, so that it stays accurate if my look changes.

### The Builder

13. As a Student who can't read yet, I want every choice to be a picture, so that I can build my Avatar without help.
14. As a Student, I want to choose my skin tone first, from 10 options, so that my Avatar starts looking like me.
15. As a Student, I want to choose from 48 hairstyles, including hijab, turban, afro, cornrows, bantu knots, twists and buns, so that I can find mine.
16. As a Student, I want to choose my hair color from six natural colors (black, dark brown, brown, auburn, blonde, gray), so that my hair looks like mine.
17. As a Student, I want to choose glasses, sunglasses, an eyepatch or nothing, so that my Avatar matches what I wear.
18. As a Student, I want to pick my favorite Expression from friendly faces only, so that my Avatar shows how I want to look.
19. As a Student, I want to choose a clothing color from 10 options, so that I'm recognizable as "the kid in green" on the chart.
20. As a Student, I want to see my Avatar update live as I choose, so that I know what each choice does.
21. As a Student, I want to go back and change an earlier choice before finishing, so that I don't have to start over.
22. As a Student, I want the Builder to ask "What's your first name?" at the end, so that my Teacher knows the Avatar is mine.
23. As a Student in K–2, I want to type my name myself, so that I don't need an adult.
24. As a Student using a screen reader or keyboard, I want every picture choice to have an accessible name and be reachable by keyboard, so that I can build an Avatar too.
25. As a Student on a phone or tablet, I want the Builder to work at small screen sizes, so that I can use whatever device I have.

### Adding Students on the Teacher's device

26. As a Teacher, I want an "Add a student" action that opens the Builder in a new tab, so that Students can take turns on my laptop while my Class stays open in another tab.
27. As a Teacher, I want each finished Avatar from that tab to appear in my Class as a new Student, named with what the Student typed, so that I don't type any names.
28. As a Teacher, I want the Builder tab to reset for the next Student after each finish, so that children can take turns without me touching the laptop.
29. As a Teacher, I want my Class tab to show new Students without reloading, so that I can watch progress.
30. As a Teacher, I want to use "Add a student" myself for an absent child, so that everyone ends up on the chart.

### Turning in and importing Cutouts

31. As a Student on my own device, I want to finish the Builder and save my Avatar as a picture, so that I can turn it in like any other assignment.
32. As a Student, I want my saved picture to be a head-only Cutout with my favorite Expression and no visible name, so that it looks like a normal avatar picture.
33. As a Student, I want the device I used to remember my last Avatar, so that I can come back tomorrow and tweak it.
34. As a Student, I want to drop my own saved Cutout back into the Builder to keep editing it, so that my picture doubles as my save file.
35. As a Teacher, I want to drop many Cutouts into my Class at once, so that importing a whole Class takes seconds.
36. As a Teacher, I want each imported Cutout to become a new Student, named from the name inside it, so that I never match files to names by hand.
37. As a Teacher, I want to type a name when an imported Cutout has none, so that every Student has a Display Name.
38. As a Teacher, I want a clear message when a dropped picture has no Avatar data inside, such as a screenshot or a resized upload, so that I know to ask the Student for the saved file instead.
39. As a Teacher, I want a clear message when I drop something that isn't a Cutout, so that I understand why nothing was added.
40. As a Teacher, I want a new Student whose name matches an existing Student to be marked with "There's already a Maya. Replace her Avatar instead?", so that a resubmitted Avatar doesn't leave a duplicate unless I want one.
41. As a Teacher, I want to ignore that marker and keep both Students, so that two children with the same first name both stay in the Class.
42. As a Teacher, I want to drop Cutouts from an old Cutout Set into a Class, so that I can rebuild Students if I lost my Class File.

### Managing a Class

43. As a Teacher, I want to see all Students in a Class with their Avatars and Display Names, so that I can check everyone is there.
44. As a Teacher, I want to edit a Student's Display Name, so that I can turn "MAYA!!!" into "Maya R.".
45. As a Teacher, I want to open a Student's Avatar in the Builder and change it, so that I can update it when a Student gets glasses.
46. As a Teacher, I want to permanently delete a Student and their Avatar, with a confirmation, so that a child who moved away is removed.
47. As a Teacher, I want to permanently delete a whole Class, with a confirmation, so that I can clear out a finished school year.

### Cutout Sets

48. As a Teacher, I want to download a Cutout Set of my whole Class in one go, so that I get every Student's behavior chart piece at once.
49. As a Teacher, I want to choose head-only or bust framing for a Cutout Set, so that I get small faces for clothespins or head-and-shoulders pieces for charts.
50. As a Teacher, I want to choose one of 23 bust Poses for the whole Cutout Set, so that the chart looks consistent.
51. As a Teacher, I want each Student's own favorite Expression and clothing color used by default, so that the chart shows my Students' personalities.
52. As a Teacher, I want to switch the whole Cutout Set to a single Expression, so that everyone matches when I want them to.
53. As a Teacher, I want to switch the whole Cutout Set to a single clothing color, so that everyone can be in school colors for spirit week.
54. As a Teacher, I want each Cutout labeled with the Student's Display Name by default, with a switch to turn labels off, so that I can make named or unnamed chart pieces.
55. As a Teacher, I want an "include me" switch (off by default) that adds my own Cutout to the set, so that I can be on the chart too.
56. As a Teacher, I want a preview of the Cutout Set before downloading, so that I can check the Pose and overrides.
57. As a Teacher, I want the zip named after the Class and Pose, and each PNG named after the Display Name, so that I can find pieces in my Drive.
58. As a Teacher, I want each PNG to have a transparent background and be large enough to print at half a page, so that pieces look good laminated or placed in Slides.
59. As a Teacher, I want to download a single Student's Cutout, so that I can replace one lost chart piece.

### Class Files

60. As a Teacher, I want to download a Class File whenever I choose, so that I have a copy outside the browser.
61. As a Teacher, I want one Class File to hold all my Classes and my own Avatar, so that one file restores everything.
62. As a Teacher, I want to load a Class File in any browser, so that I can move to a new laptop or recover after my Chromebook wipes its storage.
63. As a Teacher, I want a confirmation that shows what will be replaced before a Class File loads, so that I don't overwrite newer work by accident.

### Longevity

64. As a Teacher, I want Cutouts and Class Files I saved this year to still load correctly in future versions of the app, so that my files in Drive keep working.
65. As a Teacher, I want a file that references a part the app doesn't recognize to still load with a sensible default, so that one bad value doesn't block a whole import.

## Implementation Decisions

### Platform

- Static web app on the workspace default stack: Bun, TypeScript, Vite, SvelteKit built as a static site, Svelte, Tailwind. No backend, no PocketBase and no accounts (ADR 0008).
- On-screen Avatars render as DOM SVG. Canvas is used only to rasterize SVG into PNG for downloads, where avoiding it is unreasonable.
- The app makes no third-party network requests at runtime: no analytics, no ad scripts and no hosted fonts. All assets are self-hosted.

### Part catalog

- One module owns the ordered part lists: skin tones (10), hairstyles (48), hair colors (6), eyewear (none plus 9), Expressions (19), clothing colors (10) and bust Poses (23).
- Lists are append-only (ADR 0010). Each entry has a stable position, and an entry can be marked retired: hidden from the Builder but still renderable. The Builder's display order is kept separately from the stored order.
- The art comes from the Open Peeps pieces in the `react-peeps` project (MIT code, CC0 art), converted to framework-neutral SVG fragments. No shapes are added or edited (ADR 0005).
- **Hairstyles:** every Open Peeps hair piece except the three medical headwear pieces (DocBouffant, DocSurgery, DocShield).
- **Eyewear:** Eyepatch, GlassAviator, GlassButterfly, GlassButterflyOutline, GlassClubmaster, GlassRound, GlassRoundThick, SunglassClubmaster, SunglassWayfarer, or none.
- **Expressions:** Smile, SmileBig, SmileLol, SmileTeeth, SmileNM, Calm, CalmNM, CheersNM, Cute, Cheeky, Awe, LoveGrin, LoveGrinTeeth, EatingHappy, EyesClosed, Explaining, Driven, Blank, Serious. All negative or non-likeness faces are excluded (ADR 0002).
- **Bust Poses:** ArmsCrossed, BlazerBlackTee, ButtonShirt, DotJacket, Dress, Explaining, FurJacket, Geek, Hoodie, Paper, PocketShirt, PointingUp, PoloSweater, Shirt, ShirtCoat, ShirtFilled, SportyShirt, StripedShirt, Sweater, SweaterDots, Thunder, Turtleneck, Whatever. Killer, Selena, Device, Gaming and Coffee are excluded.
- Not included: facial hair, standing and sitting Poses, and fun hair colors.

### Avatar

- An Avatar is six positions: skin tone, hairstyle, hair color, eyewear, favorite Expression and clothing color. It never includes a Pose or a name.

### Avatar renderer

- A pure function from (Avatar, framing, optional Pose, optional Expression override, optional clothing color override, optional name label) to SVG.
- **Framings:** head-only (no Pose) or bust (with a Pose). Every head uses the Open Peeps fixed head angle (ADR 0001).
- **Coloring rules (ADR 0006), confirmed by a rendering prototype:**
  - The body (Pose) is filled with the clothing color, with black lines.
  - The hair piece is filled with the skin tone and its lines are drawn in the hair color.
  - The face piece's lines are always black.
  - Accessories use black lines.
- The known side effects are accepted, not bugs: clothing-colored hands and necks, skin-colored outline hair and turbans, and the head outline taking the hair color.
- When a name label is shown, it appears below the figure in a large, friendly, self-hosted font.

### Cutout codec

- Rasterizes rendered SVG to a transparent PNG.
- Writes hidden data into a PNG international text section under a fixed app keyword, as UTF-8 so names like "José" survive. Pixels are unchanged (ADR 0009).
- **Hidden data:** a format version number (starting at 1), the Avatar's six positions, and the name. The name is always included, even when no label is shown.
- Reading accepts any dropped file and reports one of three outcomes:
  - a valid Avatar with a name, or without one
  - "not a PNG"
  - "PNG with no Avatar data" (a screenshot or re-saved image)
- A position that is out of range for its list falls back to that list's default. Retired positions still load.
- **Sizes:** a Student's own Cutout is head-only, has no visible name, and stays well under 2000px on its longest side (Seesaw resizes anything larger). Cutout Set PNGs are about 1500px tall.

### Classroom store

- **Holds:** the Teacher's own Avatar (optional), plus a list of Classes. Each Class has a name and a list of Students; each Student has a Display Name, an Avatar, and a flag for whether a duplicate-name marker is pending.
- Every change saves to browser local storage immediately. Other tabs pick up changes through browser storage events, which is how the Builder tab and the Class tab stay in sync.
- On first run, the store creates one default Class so a single-Class Teacher needs no setup.
- **Class File:** a JSON document with a format version, the Teacher's Avatar and all Classes, using the same Avatar positions as Cutouts.
  - Download is always available with no warnings or reminders.
  - Loading replaces the whole store after a confirmation that summarizes what will be replaced. Invalid positions in a Class File fall back the same way as in Cutouts.

### Import rules

- Every imported Avatar, whether a dropped Cutout or a finished Builder tab from "Add a student", becomes a new Student. The app never tries to match it to an existing Student.
- The Display Name is the name exactly as typed. If a dropped Cutout has no name, the Teacher is asked to type one for that Student.
- If a new Student's Display Name exactly matches an existing Student's in the same Class, the new Student carries a marker offering "Replace [name]'s Avatar instead?".
  - Accepting moves the new Avatar onto the existing Student and removes the new one.
  - Ignoring the marker keeps both Students.
  - The marker appears only in the Teacher's Class view, never in the Student's Builder tab.
- A multi-file drop processes each file independently and reports all messages together.

### Builder

- **Steps, all picture-only:** skin tone → hairstyle → hair color → eyewear → favorite Expression → clothing color → "What's your first name?" (a text input).
- **Opened from a Class ("Add a student"):** runs in a new tab. Finishing adds the Avatar to that Class through the import rules, then resets for the next child.
- **Opened standalone:** finishing saves the Student's own Cutout. The last Avatar is remembered in that device's local storage, and dropping a Cutout onto the standalone Builder reopens it for editing.
- **Opened for the Teacher's own Avatar:** it has no name step, and finishing saves to the store's Teacher Avatar.
- **Opened for an existing Student:** finishing replaces that Student's Avatar. The Display Name is edited separately in the Class view.
- Every picture option has an accessible name, and the Builder is fully keyboard-operable.

### Cutout Set export

- **Inputs:** a Class, framing, Pose (bust only), optional Expression override, optional clothing color override, name label on/off (default on), and include-me (default off).
- **Output:** a client-side zip named after the Class and Pose, containing one PNG per Student named after their Display Name. Duplicate Display Names get a numeric suffix. Every PNG carries hidden data per the Cutout codec.

## Testing Decisions

- **One test seam: the running app in a real browser.** Playwright end-to-end tests drive the static app the way a Teacher and Student do: they click picture choices by accessible name, type names, drop files through file inputs, and capture downloads.
  - This is the highest seam available. It covers the Builder, the classroom store, import rules, the Cutout codec and Cutout Set export together, with no internal seams exposed for testing.
  - The repo has no existing seams.
- **Downloaded files are external contracts, so tests assert on them directly:**
  - reading the hidden data out of a downloaded PNG
  - listing zip entry names
  - parsing a downloaded Class File
- **What makes a good test here:** it describes something a Teacher or Student can observe. Examples: "after dropping three Cutouts, the Class shows Maya, Leo and Ava", "the downloaded zip is named after the Class and Pose", "the Builder reopened from a Cutout has the same choices selected".
  - Tests don't reach into local storage keys, component state or renderer internals.
  - They don't compare pixels, except to check that a PNG has a transparent background and the expected dimensions.
- **Golden fixtures guard ADR 0010.** A Cutout PNG and a Class File produced by v1 are checked in as fixtures. Tests load them and check that the Builder shows exactly the expected choices. Appending parts to any list must never change these results.
- **Negative fixtures:** the same Cutout re-encoded without its hidden data (expects the "no Avatar data" message), a non-PNG file (expects the "not a Cutout" message), and a Cutout with out-of-range positions (expects defaults).
- **Two-tab flow:** a test opens "Add a student", finishes a Builder in the second tab, and checks that the Class tab shows the new Student without a reload.
- **Duplicate-name flow:** importing a second "Maya" shows the marker. Accepting replaces the original Avatar and leaves one Maya. Ignoring leaves two.
- **Persistence:** reloading keeps the Class. A Class File downloaded in one browser context and loaded into a fresh context reproduces all Classes and the Teacher's Avatar after the confirmation.
- **Viewports:** run on desktop and mobile projects, following the prior art in the sibling `hall-pass-tracker` project's Playwright setup (Desktop Chrome and Pixel 7 projects, a web server started by the test runner).
- **Dev servers:** start them through the workspace's development-server port coordination script, per the workspace instructions.
- **Manual check, not automated:** before building import, take a real Cutout through Google Classroom and through Seesaw, re-download it, and check whether the hidden data survives. Record the result in the Further Notes of the import ticket.

## Out of Scope

- Accounts, sign-in, passwords, email, any server-side storage, and PocketBase.
- Syncing or merging Classes across devices, sharing Classes between Teachers, and moving Avatars from one Teacher to another. Moving data always means moving a file.
- A Station mode, PINs or any locking of the Builder tab.
- Matching imported Cutouts to existing Students, apart from the duplicate-name marker.
- Full-body Cutouts, standing and sitting Poses, and the wheelchair and prosthetic-leg Poses (ADR 0007).
- The label sheet. It's the first follow-up after v1.
- Facial hair, fun hair colors, a "surprise me" button, and any Expression or Pose showing a negative state (ADR 0002).
- New or edited art of any kind, including hearing aids and cochlear implants (ADR 0005).
- JPEG or SVG downloads, visible codes (QR or similar) on Cutouts, and hiding data in pixels.
- Automatic deletion or expiry of data, and reminders to download a Class File.
- Photos or face detection of any kind.

## Further Notes

- Seesaw automatically resizes uploaded photos to 2000px on the longest side, which likely strips hidden PNG data. Google Classroom stores attachments in Drive, which normally keeps the original file. Neither has been tested yet, which is why the manual check above exists.
- The part lists and coloring rules were validated by rendering every Open Peeps piece during design. Head and body take separate fills, and the hair piece's line color works as hair color.
- ADR 0010 is the easiest decision to break by accident. Sorting a list or deleting an unused part silently corrupts every saved Avatar, so review any change to the part catalog against it.
- The Teacher's own Avatar being built in the same Builder (opened as "me", with no name step) was stated as an assumption at the end of design and wasn't objected to.
- The test seam in this spec was not separately reviewed with the user, at the user's request not to be asked questions.
- The repo has no `docs/agents/` directory yet. This spec follows the sibling `aac` project's local-markdown issue-tracker conventions: one directory per feature under `.scratch/`, with the spec at `spec.md` and a bold Status line.
