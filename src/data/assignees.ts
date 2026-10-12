/** Dummy roster for assignment and @mentions. Not tied to a real directory. */
export type Assignee = {
  name: string;
  role: string;
};

export const ASSIGNEES: Assignee[] = [
  { name: "Matthew Carr", role: "Validator" },
  { name: "Ilham", role: "Client" },
  { name: "Elena Vogel", role: "Platform" },
  { name: "Henrik Dahl", role: "Infrastructure" },
  { name: "Claire Moreau", role: "Data" },
  { name: "Luca Bianchi", role: "Frontend" },
  { name: "Ingrid Holm", role: "IT" },
  { name: "Thomas Keller", role: "Backend" },
  { name: "Sophie Laurent", role: "Security" },
  { name: "Marcus Hale", role: "Validator" },
  { name: "Nina Berg", role: "Validator" },
];

export function mentionAtCursor(value: string, cursor: number) {
  const upto = value.slice(0, cursor);
  const match = upto.match(/@([A-Za-z][A-Za-z .'-]*)$/);
  if (!match) return null;
  const typed = match[1];
  if (/\s$/.test(typed)) {
    const exact = typed.trimEnd().toLowerCase();
    if (ASSIGNEES.some((person) => person.name.toLowerCase() === exact)) return null;
  }
  return {
    query: typed.trimEnd(),
    start: cursor - match[0].length,
  };
}

export function renderMentionNodes(body: string) {
  const names = [...ASSIGNEES].sort((a, b) => b.name.length - a.name.length);
  const pattern = new RegExp(
    `@(?:${names.map((person) => person.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g"
  );
  const nodes: Array<{ mention: boolean; text: string }> = [];
  let last = 0;
  for (const match of body.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push({ mention: false, text: body.slice(last, index) });
    nodes.push({ mention: true, text: match[0] });
    last = index + match[0].length;
  }
  if (last < body.length) nodes.push({ mention: false, text: body.slice(last) });
  return nodes;
}
