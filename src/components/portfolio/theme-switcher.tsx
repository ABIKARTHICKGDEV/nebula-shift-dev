import { useEffect, useRef, useState } from "react";
import { Palette, Check } from "lucide-react";
import { THEMES, useTheme } from "@/components/theme-provider";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-9 w-9 place-items-center rounded-sm border border-[var(--hairline-strong)] bg-surface text-foreground/80 transition hover:text-primary"
      >
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md border border-[var(--hairline-strong)] bg-surface shadow-[var(--shadow-elevated)]"
        >
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Theme
          </div>
          <ul className="pb-1">
            {THEMES.map((t) => {
              const active = t.id === theme;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      setTheme(t.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-foreground/90 transition hover:bg-[var(--card-hover)]"
                  >
                    <span className="flex h-5 w-9 overflow-hidden rounded-sm border border-[var(--hairline)]">
                      {t.swatch.map((c) => (
                        <span key={c} className="flex-1" style={{ background: c }} />
                      ))}
                    </span>
                    <span className="flex-1">{t.label}</span>
                    {active && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
