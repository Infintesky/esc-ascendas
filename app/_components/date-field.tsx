"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * A shadcn Calendar inside a Popover, exposing an ISO (`yyyy-MM-dd`) value so it
 * drops into the existing date state/validation. Days before `min` are disabled.
 */
export function DateField({
  label,
  value,
  min,
  onChange,
  ariaLabel,
}: {
  label: string;
  value: string; // ISO yyyy-MM-dd, or ""
  min?: string; // ISO yyyy-MM-dd
  onChange: (iso: string) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(value) : undefined;
  const minDate = min ? parseISO(min) : undefined;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-label={ariaLabel ?? label}
              data-empty={!selected}
              className="h-11 w-full justify-start gap-2 px-3 font-normal data-[empty=true]:text-muted-foreground"
            >
              <CalendarIcon className="size-4 text-muted-foreground" />
              {selected ? format(selected, "EEE, d MMM yyyy") : "Select date"}
            </Button>
          }
        />
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? minDate}
            disabled={minDate ? { before: minDate } : undefined}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, "yyyy-MM-dd"));
                setOpen(false);
              }
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
