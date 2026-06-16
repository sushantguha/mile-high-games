export function normalizeRoomCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
}

export function buildJoinUrl(code: string): string {
  const normalized = normalizeRoomCode(code);
  return `${window.location.origin}/?code=${normalized}`;
}