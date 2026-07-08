import { describe, it, expect } from "vitest";
import { parseDescription } from "@/lib/hotel/description";

const SAMPLE = `Make use of convenient amenities, which include complimentary wireless internet access and tour/ticket assistance. Distances are displayed to the nearest 0.1 mile and kilometer.

Bugis Street Shopping District - 0.3 km / 0.2 mi
Mustafa Centre - 0.7 km / 0.4 mi
Sultan Mosque - 1 km / 0.6 mi

The nearest airports are:
Seletar Airport (XSP) - 16.3 km / 10.2 mi
Singapore Changi Airport (SIN) - 19.9 km / 12.4 mi

With a stay at Campbell Inn - Hostel in Singapore, you'll be a 4-minute walk from Bugis Street.`;

describe("parseDescription", () => {
  it("separates prose, nearby landmarks, and airports", () => {
    const { paragraphs, nearby, airports } = parseDescription(SAMPLE);

    expect(nearby).toEqual([
      { name: "Bugis Street Shopping District", km: 0.3, mi: 0.2 },
      { name: "Mustafa Centre", km: 0.7, mi: 0.4 },
      { name: "Sultan Mosque", km: 1, mi: 0.6 },
    ]);
    expect(airports).toEqual([
      { name: "Seletar Airport (XSP)", km: 16.3, mi: 10.2 },
      { name: "Singapore Changi Airport (SIN)", km: 19.9, mi: 12.4 },
    ]);

    // The airport header line is dropped; both prose blocks survive.
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toContain("convenient amenities");
    expect(paragraphs[1]).toContain("Campbell Inn - Hostel");
    expect(paragraphs.join(" ")).not.toContain("nearest airports");
  });

  it("parses distances embedded in an HTML <p>/<br> fragment", () => {
    const html =
      "Great little inn.\n\nDistances are displayed to the nearest 0.1 mile. <br /> <p>Church of St Mary - 0.4 km / 0.3 mi <br /> Lancaster Castle - 0.8 km / 0.5 mi <br /> </p>\n\nNear the castle.";
    const { paragraphs, nearby } = parseDescription(html);
    expect(nearby).toEqual([
      { name: "Church of St Mary", km: 0.4, mi: 0.3 },
      { name: "Lancaster Castle", km: 0.8, mi: 0.5 },
    ]);
    expect(paragraphs.some((p) => p.includes("Great little inn"))).toBe(true);
    expect(paragraphs.join(" ")).not.toContain("<");
  });

  it("returns only prose when there are no distance lines", () => {
    const { paragraphs, nearby, airports } = parseDescription("A quiet boutique stay.\n\nGreat coffee downstairs.");
    expect(nearby).toHaveLength(0);
    expect(airports).toHaveLength(0);
    expect(paragraphs).toEqual(["A quiet boutique stay.", "Great coffee downstairs."]);
  });
});
