import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PointsChart, toChartSeries } from "@/app/_components/points-chart";

describe("toChartSeries", () => {
  it("orders entries oldest-first for cumulative display", () => {
    const series = toChartSeries([
      { delta: -100, balanceAfter: 1100, reason: "redeem", createdAt: "2026-02-01T00:00:00Z" },
      { delta: 1200, balanceAfter: 1200, reason: "earn", createdAt: "2026-01-01T00:00:00Z" },
    ]);
    expect(series.map((p) => p.balance)).toEqual([1200, 1100]);
  });
});

describe("PointsChart", () => {
  it("renders without crashing for empty history", () => {
    const { container } = render(<PointsChart history={[]} />);
    expect(container).toBeTruthy();
  });
});
