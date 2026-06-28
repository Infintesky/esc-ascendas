export type DestinationEntry = {
  uid: string;
  term: string;
  lat: number;
  lng: number;
  state: string;
  type: string;
};

export function trimDestinations(raw: unknown[]): DestinationEntry[] {
  return (raw ?? [])
    .map((d) => {
      const r = (d ?? {}) as Record<string, unknown>;
      return {
        uid: String(r.uid ?? ""),
        term: String(r.term ?? ""),
        lat: typeof r.lat === "number" ? r.lat : 0,
        lng: typeof r.lng === "number" ? r.lng : 0,
        state: r.state ? String(r.state) : "",
        type: r.type ? String(r.type) : "",
      };
    })
    .filter((d) => d.uid && d.term);
}
