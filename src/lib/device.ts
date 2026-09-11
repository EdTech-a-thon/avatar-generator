/**
 * What one device remembers for the Student sitting at it.
 *
 * A Student who builds an Avatar on their own laptop should find it again
 * tomorrow without turning anything in. This is only a convenience: the Cutout
 * they downloaded is the real copy, and clearing browser storage loses this
 * (ADR 0008). It never leaves the device, and it holds a first name only.
 */
import { settleAvatar, type Avatar } from "./avatar";

const KEY = "avatar-generator:last-avatar";

export interface RememberedAvatar {
  avatar: Avatar;
  name: string;
}

export function rememberAvatar(remembered: RememberedAvatar) {
  try {
    localStorage.setItem(KEY, JSON.stringify(remembered));
  } catch {
    // A browser with storage turned off simply doesn't remember.
  }
}

export function lastAvatar(): RememberedAvatar | undefined {
  try {
    const held = localStorage.getItem(KEY);
    if (!held) return undefined;
    const parsed = JSON.parse(held) as { avatar?: unknown; name?: unknown };
    return {
      avatar: settleAvatar(parsed.avatar),
      name: typeof parsed.name === "string" ? parsed.name : "",
    };
  } catch {
    // Storage turned off, or something else wrote nonsense under our key.
    return undefined;
  }
}
