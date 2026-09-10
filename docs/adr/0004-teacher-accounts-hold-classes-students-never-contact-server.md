# Teacher accounts hold Classes; Students never contact the server

Teachers want to save Classes and come back to them, so Teachers have accounts and the server stores each Class as is: Display Names and Avatars. We never take photos, and Students have no accounts. Avatars can reveal religion (head coverings), disability (hearing aids, wheelchairs) and race (skin tone), so the data is sensitive even though it isn't a picture. We still chose to store it unencrypted, so a Teacher's names and Avatars follow them to any device. Students only add Avatars through a Station (under the Teacher's session) or a Turn-in Link (which the Teacher imports), so no child ever sends data to the server directly.

## Considered Options

- **No server, with the avatar kept in the URL or a file.** This is the most private option, but a Class can't follow the Teacher from device to device.
- **Display Names kept only in the Teacher's browser.** On a new device the Teacher would see unlabeled Avatars.
- **Encrypted in the browser with a Teacher passphrase.** A forgotten passphrase loses the Class, and it's too complex for this team.
- **Class join codes.** These are smoothest for Students, but children under 13 would send personal data to the server themselves.

## Promises that come with this

- No ads, no analytics or tracking scripts, and student data is never sold. All of this is stated on a short plain-language privacy page.
- A Teacher can permanently delete a Student (with their Avatar) or a whole Class at any time.

## Consequences

A Turn-in Link has to keep the Avatar in a part of the URL the browser never sends to the server; otherwise simply opening the link would send a child's data to us.
