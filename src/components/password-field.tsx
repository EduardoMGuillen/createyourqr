"use client";

import { useId, useMemo, useState } from "react";

import { evaluatePasswordStrength } from "@/lib/auth/password-strength";

type PasswordFieldProps = {
  id?: string;
  name?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  showStrength?: boolean;
  className?: string;
};

const LEVEL_LABEL: Record<string, string> = {
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

const BAR_CLASS: Record<string, string> = {
  weak: "bg-red-500",
  fair: "bg-amber-500",
  good: "bg-lime-500",
  strong: "bg-emerald-600",
};

export function PasswordField({
  id: idProp,
  name = "password",
  autoComplete,
  required,
  minLength = 8,
  placeholder,
  showStrength = true,
  className = "",
}: PasswordFieldProps) {
  const reactId = useId();
  const id = idProp ?? `password-${reactId}`;
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");

  const strength = useMemo(() => evaluatePasswordStrength(value), [value]);
  const filled = value.length > 0;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`w-full rounded-md border border-zinc-300 px-3 py-2 pr-11 ${className}`}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-2 my-auto rounded px-2 text-xs font-medium text-zinc-600 hover:text-zinc-900"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {showStrength && filled ? (
        <div className="space-y-1">
          <div className="flex gap-1" role="status" aria-live="polite">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i <= strength.score ? BAR_CLASS[strength.level] : "bg-zinc-200"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-600">
            Strength: <span className="font-medium">{LEVEL_LABEL[strength.level]}</span>
          </p>
          {strength.suggestions.length ? (
            <ul className="list-inside list-disc text-xs text-zinc-600">
              {strength.suggestions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
