"use client";

import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MAX_GUESTS_PER_ROOM } from "@/lib/search/params";

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-1">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-5 text-center text-sm font-medium tabular-nums text-foreground">
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// Adults + children occupancy per room. The upstream API takes a single guest
// count per room, so these combine into that total (max MAX_GUESTS_PER_ROOM);
// there's at least one adult.
export function GuestSelector({
  adults,
  childCount,
  onChange,
}: {
  adults: number;
  childCount: number;
  onChange: (next: { adults: number; childCount: number }) => void;
}) {
  const total = adults + childCount;
  const summary = `${adults} adult${adults === 1 ? "" : "s"}${
    childCount > 0 ? `, ${childCount} child${childCount === 1 ? "" : "ren"}` : ""
  }`;

  return (
    <div>
      <Label className="mb-1.5">Guests per room</Label>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-start gap-2 font-normal"
            >
              <Users className="size-4 text-muted-foreground" />
              {summary}
            </Button>
          }
        />
        <PopoverContent className="w-72 space-y-1" align="start">
          <Stepper
            label="Adults"
            hint="Ages 18 or above"
            value={adults}
            min={1}
            max={MAX_GUESTS_PER_ROOM - childCount}
            onChange={(a) => onChange({ adults: a, childCount })}
          />
          <Stepper
            label="Children"
            hint="Ages 0–17"
            value={childCount}
            min={0}
            max={MAX_GUESTS_PER_ROOM - adults}
            onChange={(c) => onChange({ adults, childCount: c })}
          />
          <p className="pt-1 text-xs text-muted-foreground">
            {total} of {MAX_GUESTS_PER_ROOM} guests per room
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
