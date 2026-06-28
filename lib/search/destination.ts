export type DestinationEntry = {
  uid: string;
  term: string;
  type: string;
};

export function trimDestinations(raw: unknown[]): DestinationEntry[] {
  return (raw ?? [])
    .map((d) => {
      const r = (d ?? {}) as Record<string, unknown>;
      return {
        uid: String(r.uid ?? ""),
        term: String(r.term ?? ""),
        type: r.type ? String(r.type) : "",
      };
    })
    .filter((d) => d.uid && d.term);
}
