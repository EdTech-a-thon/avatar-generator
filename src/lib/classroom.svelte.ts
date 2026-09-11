/**
 * The Teacher's Classes, kept in this browser and nowhere else (ADR 0008).
 *
 * Every change is written to local storage straight away, because there is no
 * server to fall back on and no save button to forget. Other tabs hear about
 * changes through the browser's storage event, which is how a Builder tab and
 * the Class tab stay in step while children take turns at a laptop.
 *
 * This is also the shape a Class File holds (ticket 10), so anything read back
 * is settled the same careful way a Cutout is: an unknown position falls back
 * to its list's default rather than throwing an import away.
 */
import { settleAvatar, type Avatar } from "./avatar";

export interface Student {
  id: string;
  /** A first name, optionally with a last initial. Exactly as typed. */
  name: string;
  avatar: Avatar;
}

export interface Classroom {
  id: string;
  name: string;
  students: Student[];
}

export interface ClassroomData {
  version: number;
  teacherAvatar?: Avatar;
  classes: Classroom[];
}

export const CLASSROOM_VERSION = 1;
const KEY = "avatar-generator:classroom";
const CURRENT_KEY = "avatar-generator:current-class";

function id() {
  return crypto.randomUUID();
}

function freshClass(name = "My class"): Classroom {
  return { id: id(), name, students: [] };
}

/** Reads anything at all and returns something the app can use. */
export function settleClassroomData(value: unknown): ClassroomData | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const held = value as Record<string, unknown>;
  if (held.version !== CLASSROOM_VERSION || !Array.isArray(held.classes))
    return undefined;
  return {
    version: CLASSROOM_VERSION,
    ...(held.teacherAvatar
      ? { teacherAvatar: settleAvatar(held.teacherAvatar) }
      : {}),
    classes: held.classes.map((room) => {
      const group = (room ?? {}) as Record<string, unknown>;
      return {
        id: typeof group.id === "string" ? group.id : id(),
        name: typeof group.name === "string" ? group.name : "My class",
        students: (Array.isArray(group.students) ? group.students : []).map(
          (held) => {
            const student = (held ?? {}) as Record<string, unknown>;
            return {
              id: typeof student.id === "string" ? student.id : id(),
              name: typeof student.name === "string" ? student.name : "",
              avatar: settleAvatar(student.avatar),
            };
          },
        ),
      };
    }),
  };
}

function read(): ClassroomData | undefined {
  if (typeof localStorage === "undefined") return undefined;
  try {
    const held = localStorage.getItem(KEY);
    return held ? settleClassroomData(JSON.parse(held)) : undefined;
  } catch {
    return undefined;
  }
}

function write(data: ClassroomData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Nothing else to do: this browser won't keep anything.
  }
}

// A Teacher with one Class should never have to set anything up, so the first
// visit already has a Class waiting.
let data = $state<ClassroomData>({ version: CLASSROOM_VERSION, classes: [] });
let chosenClassId = $state<string | undefined>(undefined);
let started = false;

function save() {
  write($state.snapshot(data) as ClassroomData);
}

/** Called once when the app starts in a browser. */
export function startClassroom() {
  if (started || typeof localStorage === "undefined") return;
  started = true;
  data = read() ?? { version: CLASSROOM_VERSION, classes: [freshClass()] };
  if (data.classes.length === 0) data.classes.push(freshClass());
  save();

  try {
    chosenClassId = localStorage.getItem(CURRENT_KEY) ?? undefined;
  } catch {
    chosenClassId = undefined;
  }

  // Another tab changed something: pick it up without a reload.
  window.addEventListener("storage", (event) => {
    if (event.key === KEY) data = read() ?? data;
    if (event.key === CURRENT_KEY) chosenClassId = event.newValue ?? undefined;
  });
}

export function classes(): Classroom[] {
  return data.classes;
}

export function currentClass(): Classroom {
  return (
    data.classes.find((room) => room.id === chosenClassId) ?? data.classes[0]
  );
}

export function classById(
  classId: string | null | undefined,
): Classroom | undefined {
  return classId ? data.classes.find((room) => room.id === classId) : undefined;
}

export function addStudent(
  classId: string,
  student: { name: string; avatar: Avatar },
): Student {
  const room = data.classes.find((group) => group.id === classId);
  if (!room) throw new Error("that class is gone");
  const added: Student = {
    id: id(),
    name: student.name,
    avatar: student.avatar,
  };
  room.students.push(added);
  save();
  return added;
}
