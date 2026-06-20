"use client";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
      <span className="text-body text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-foreground/15"
        }`}
      >
        <span
          className={`h-6 w-6 rounded-full bg-card shadow transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
