"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * A shadcn range Calendar (mode="range") in a Popover. Picks check-in → check-out
 * in one pass and reports both as ISO (`yyyy-MM-dd`) strings so it drops into the
 * existing date state/validation. Days before `min` are disabled.
 */
export function DateRangeField({
  label,
  checkin,
  checkout,
  min,
  onChange,
}: {
  label: string;
  checkin: string; // ISO yyyy-MM-dd, or ""
  checkout: string; // ISO yyyy-MM-dd, or ""
  min?: string; // ISO yyyy-MM-dd
  onChange: (range: { checkin: string; checkout: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const from = checkin ? parseISO(checkin) : undefined;
  const to = checkout ? parseISO(checkout) : undefined;
  const minDate = min ? parseISO(min) : undefined;
  const selected: DateRange | undefined = from ? { from, to } : undefined;

  const labelText = from
    ? to
      ? `${format(from, "d MMM")} — ${format(to, "d MMM yyyy")}`
      : `${format(from, "d MMM yyyy")} — …`
    : "Select dates";

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-label={label}
              data-empty={!from}
              className="h-11 w-full justify-start gap-2 px-3 font-normal data-[empty=true]:text-muted-foreground"
            >
              <CalendarIcon className="size-4 text-muted-foreground" />
              {labelText}
            </Button>
          }
        />
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            selected={selected}
            defaultMonth={from ?? minDate}
            disabled={minDate ? { before: minDate } : undefined}
            numberOfMonths={2}
            onSelect={(range) => {
              const start = range?.from ? format(range.from, "yyyy-MM-dd") : "";
              const end = range?.to ? format(range.to, "yyyy-MM-dd") : "";
              // react-day-picker reports {from===to} on the first click; treat
              // that as "check-in chosen, awaiting check-out" rather than a
              // complete 0-night range.
              const completed = !!start && !!end && end !== start;
              onChange({ checkin: start, checkout: completed ? end : "" });
              if (completed) setOpen(false);
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
