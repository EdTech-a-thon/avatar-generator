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
  /**
   * The Student who already had this name when this one arrived. It means the
   * Class view offers to move the new Avatar onto that Student instead. Two
   * children really can share a name, so it is only ever an offer, and it sits
   * here until the Teacher answers it.
   */
  duplicateOf?: string;
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
              ...(typeof student.duplicateOf === "string"
                ? { duplicateOf: student.duplicateOf }
                : {}),
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
  // Exactly the same name, not a loose match: "Maya" and "maya R." are two
  // different children until the Teacher says otherwise.
  const sameName = room.students.find((other) => other.name === student.name);
  const added: Student = {
    id: id(),
    name: student.name,
    avatar: student.avatar,
    ...(sameName ? { duplicateOf: sameName.id } : {}),
  };
  room.students.push(added);
  save();
  return added;
}

/** Moves the new Avatar onto the Student who already had that name. */
export function replaceWithDuplicate(classId: string, studentId: string) {
  const room = data.classes.find((group) => group.id === classId);
  const arrived = room?.students.find((student) => student.id === studentId);
  const first = room?.students.find(
    (student) => student.id === arrived?.duplicateOf,
  );
  if (!room || !arrived || !first) return;
  first.avatar = arrived.avatar;
  room.students = room.students.filter((student) => student.id !== arrived.id);
  save();
}

/** Keeps both Students: two children in one Class really can share a name. */
export function keepDuplicate(classId: string, studentId: string) {
  const student = data.classes
    .find((group) => group.id === classId)
    ?.students.find((one) => one.id === studentId);
  if (!student) return;
  delete student.duplicateOf;
  save();
}

export function studentById(
  room: Classroom,
  studentId: string | undefined,
): Student | undefined {
  return room.students.find((student) => student.id === studentId);
}

function findStudent(classId: string, studentId: string) {
  return data.classes
    .find((room) => room.id === classId)
    ?.students.find((student) => student.id === studentId);
}

/** "MAYA!!!" becomes "Maya R.". The Avatar and everything else stay put. */
export function renameStudent(
  classId: string,
  studentId: string,
  name: string,
) {
  const student = findStudent(classId, studentId);
  if (!student || !name.trim()) return;
  student.name = name.trim();
  save();
}

/** Gone for good: a child who moved away leaves nothing behind. */
export function removeStudent(classId: string, studentId: string) {
  const room = data.classes.find((group) => group.id === classId);
  if (!room) return;
  room.students = room.students.filter((student) => student.id !== studentId);
  save();
}

/** A Student got glasses. Their Display Name is not touched. */
export function setStudentAvatar(
  classId: string,
  studentId: string,
  avatar: Avatar,
) {
  const student = findStudent(classId, studentId);
  if (!student) return;
  student.avatar = avatar;
  save();
}

export function addClass(name: string): Classroom {
  const room = freshClass(name.trim() || "My class");
  data.classes.push(room);
  save();
  selectClass(room.id);
  return room;
}

export function renameClass(classId: string, name: string) {
  const room = data.classes.find((group) => group.id === classId);
  if (!room || !name.trim()) return;
  room.name = name.trim();
  save();
}

/** Takes the Class and every Student in it. A Teacher is always left one. */
export function removeClass(classId: string) {
  data.classes = data.classes.filter((room) => room.id !== classId);
  if (data.classes.length === 0) data.classes.push(freshClass());
  save();
  if (chosenClassId === classId) selectClass(data.classes[0].id);
}

/** Which Class this tab is looking at. Other tabs follow along. */
export function selectClass(classId: string) {
  chosenClassId = classId;
  try {
    localStorage.setItem(CURRENT_KEY, classId);
  } catch {
    // The Class shown just won't be remembered for next time.
  }
}

/** The Teacher's own Avatar, kept outside every Class so it isn't rebuilt. */
export function teacherAvatar(): Avatar | undefined {
  return data.teacherAvatar;
}

export function setTeacherAvatar(avatar: Avatar) {
  data.teacherAvatar = avatar;
  save();
}

// --- Class Files ------------------------------------------------------------
// The only copy of a Teacher's work outside this browser, and the only way to
// move it to another one (ADR 0008). It holds the same positions a Cutout does,
// so it is read back just as forgivingly.

/** Everything worth keeping. Which Class this tab is showing is not in it. */
export function classroomFile(): ClassroomData {
  return $state.snapshot(data) as ClassroomData;
}

export function readClassroomFile(text: string): ClassroomData | undefined {
  try {
    return settleClassroomData(JSON.parse(text));
  } catch {
    return undefined;
  }
}

/** Replaces everything in this browser. The Teacher is asked first. */
export function loadClassroomFile(file: ClassroomData) {
  data = file;
  if (data.classes.length === 0) data.classes.push(freshClass());
  save();
  selectClass(data.classes[0].id);
}

/** "2 classes, 31 students, and your own avatar" — what a load would replace. */
export function describe(file: ClassroomData): string {
  const rooms = file.classes.length;
  const students = file.classes.reduce(
    (total, room) => total + room.students.length,
    0,
  );
  const parts = [
    `${rooms} ${rooms === 1 ? "class" : "classes"}`,
    `${students} ${students === 1 ? "student" : "students"}`,
  ];
  return `${parts.join(", ")}${file.teacherAvatar ? ", and your own avatar" : ""}`;
}
