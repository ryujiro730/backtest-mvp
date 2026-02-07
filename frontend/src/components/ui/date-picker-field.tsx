"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** value/onChange は YYYY-MM-DD の文字列。カレンダークリックで確実に反映する。 */
export function DatePickerField({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  className,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const date = value ? parseOrNull(value) : undefined;
  const defaultMonth = date ?? new Date();

  const handleSelect = React.useCallback(
    (d: Date | undefined) => {
      if (!d) {
        onChange(null);
        return;
      }
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      onChange(`${yyyy}-${mm}-${dd}`);
      setOpen(false);
    },
    [onChange]
  );

  const displayText = value ? formatDisplay(value) : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          defaultMonth={defaultMonth}
          captionLayout="dropdown"
          hideNavigation
          startMonth={new Date(1990, 0)}
          endMonth={new Date(2030, 11)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function parseOrNull(ymd: string): Date | null {
  const [y, m, d] = ymd.split("-").map(Number);
  if (y == null || m == null || d == null) return null;
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  )
    return null;
  return date;
}

function formatDisplay(ymd: string): string {
  const d = parseOrNull(ymd);
  if (!d) return ymd;
  return format(d, "yyyy-MM-dd");
}
