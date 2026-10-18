// A tiny id factory. Isolated here so the rest of the domain never depends on
// how ids are generated -- swap in UUIDs or database sequences without touching
// Board/Column/Card.
let counter = 0;

export function newId(prefix = 'id') {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${counter}${rand}`;
}
