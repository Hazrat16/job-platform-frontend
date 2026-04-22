"use client";

import { cn } from "@/lib/cn";
import { Check, ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export type FilterSelectOption = { value: string; label: string };

type FilterSelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  /** Extra classes on the root wrapper */
  className?: string;
  /** When false, trigger sizes to content (e.g. toolbar “Sort”). Default: full width in forms. */
  fullWidth?: boolean;
};

const triggerBase =
  "relative flex w-full items-center rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 pr-11 text-left text-sm text-slate-900 shadow-inner shadow-slate-900/5 transition-[color,box-shadow,border-color] hover:border-slate-300/90 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

export function FilterSelect({
  id,
  value,
  onChange,
  options,
  className,
  fullWidth = true,
}: FilterSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const found = options.findIndex((o) => o.value === value);
  const selectedIndex = found >= 0 ? found : 0;
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex);

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? options[0]?.label ?? "";

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const selectIndex = (idx: number) => {
    const opt = options[idx];
    if (!opt) return;
    onChange(opt.value);
    close();
  };

  const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlightedIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlightedIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Home" && open) {
      e.preventDefault();
      setHighlightedIndex(0);
    } else if (e.key === "End" && open) {
      e.preventDefault();
      setHighlightedIndex(options.length - 1);
    } else if ((e.key === "Enter" || e.key === " ") && open) {
      e.preventDefault();
      selectIndex(highlightedIndex);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        fullWidth
          ? "w-full"
          : "inline-block min-w-[14rem] max-w-[min(100vw-2rem,20rem)] shrink-0",
        className,
      )}
    >
      <button
        type="button"
        id={id}
        role="combobox"
        aria-autocomplete="list"
        className={cn(triggerBase, open && "border-indigo-300 ring-2 ring-indigo-500/15")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={
          open ? `${id}-option-${highlightedIndex}` : undefined
        }
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKeyDown}
      >
        <span className="block min-w-0 flex-1 truncate">{selectedLabel}</span>
      </button>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-transform duration-200",
          open && "rotate-180 text-indigo-600",
        )}
        aria-hidden
      />

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/[0.08] ring-1 ring-slate-900/[0.04]"
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={opt.value === "" ? "__all__" : opt.value}
                id={`${id}-option-${idx}`}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  "mx-1 flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors",
                  isHighlighted && "bg-slate-100",
                  !isHighlighted && isSelected && "bg-indigo-50 text-indigo-950",
                  !isHighlighted && !isSelected && "text-slate-800",
                  isHighlighted && isSelected && "bg-indigo-100/90 text-indigo-950",
                )}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectIndex(idx)}
              >
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                {isSelected && (
                  <Check
                    className="h-4 w-4 shrink-0 text-indigo-600"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
