// Sample shared-session fixtures. Presence is simulated locally; nothing is synced.
export type Participant = {
  id: string;
  name: string;
  initials: string;
  role: string;
  hue: number;
  focus: string;
};

const localUser: Participant = { id: "you", name: "You", initials: "YO", role: "Developer", hue: 110, focus: "Chat" };

export const participants: Participant[] = [
  localUser,
  { id: "mira", name: "Mira Holm", initials: "MH", role: "Backend lead", hue: 200, focus: "database/schema.sql" },
  { id: "jonas", name: "Jonas Ek", initials: "JE", role: "Frontend", hue: 30, focus: "Frontend preview" },
  { id: "sara", name: "Sara Lind", initials: "SL", role: "Reviewer", hue: 320, focus: "Review gate" },
];

export function participant(id: string): Participant {
  return participants.find((p) => p.id === id) ?? localUser;
}

/** Only the driver may send instructions to the agent; everyone else can draft. */
export function canInstruct(actorId: string, driverId: string, busy: boolean) {
  return actorId === driverId && !busy;
}

/** Control hand-off is refused while the agent is mid-run so a turn is never split across drivers. */
export function handOff(driverId: string, toId: string, busy: boolean) {
  return busy ? driverId : toId;
}
