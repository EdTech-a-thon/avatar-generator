# How Avatars are colored without redrawing any art

Each Open Peeps part has only one line color and one fill color, and ADR-0005 rules out redrawing parts. We color Avatars with three rules that work within that:

1. **Skin tone:** the head (face plus hair) is filled with the Avatar's skin tone.
2. **Clothing color:** the body (the Pose) is filled with the Avatar's clothing color.
3. **Hair color:** the hair part's lines are drawn in the Avatar's hair color, one of six natural colors (black, dark brown, brown, auburn, blonde, gray). The face's lines stay black.

We chose this over a single color for the whole figure (skin and shirt always match) and over black-and-white only (no skin tone at all), because the face and hair are where a Student recognizes themselves.

## Consequences

- Hands, arms and necks are drawn as part of the body, so they come out the clothing color, like gloves.
- Light or outline-only hair and turbans are part of the head, so they come out the skin tone.
- The head outline and ear are drawn as part of the hair part, so they take the hair color. This is noticeable only with blonde and gray.
- Bust Poses with mostly black tops show little of the clothing color.

None of these are bugs. They can't be fixed without redrawing parts, which ADR-0005 forbids.
