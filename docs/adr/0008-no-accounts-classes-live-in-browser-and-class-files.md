# No accounts and no server: Classes live in the browser and in Class Files

This reverses ADR-0004. There are no Teacher accounts, and the app runs entirely in the browser. A Teacher's Classes are saved in that browser's local storage, and the Teacher can download a Class File (JSON) and load it again anywhere. Students either build their Avatar in a Builder tab on the Teacher's device, or send it to the Teacher as a Cutout (an image that also carries the Avatar's data) through the school's usual tools. No data about any Student ever reaches a server we run, and there's no sign-in to build or host. This is also the first step in AGENTS.md's order of preference for storage: no data, then local storage, then a server.

## Promises that carry over

- No ads, no analytics or tracking scripts, and student data is never sold. All of this is stated on a short plain-language privacy page.
- A Teacher can permanently delete a Student (with their Avatar) or a whole Class at any time.

## Consequences

- If the browser's data is cleared, the Teacher uses a different device or browser, or a school Chromebook wipes local data at sign-out, the Classes are gone unless a Class File was downloaded. The Class File is the only other copy.
- Class Files and Avatar images will sit in Teachers' drives for years, so they have to stay readable as the app changes.
- Neither hidden image data nor Class Files work across devices automatically. Moving a Class always means moving a file.
