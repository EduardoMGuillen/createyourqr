type PaymentMethodBadgesProps = {
  variant?: "light" | "dark";
  className?: string;
};

function badgeClass(variant: "light" | "dark") {
  return variant === "dark"
    ? "inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-100"
    : "inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700";
}

function cardIconClass(variant: "light" | "dark") {
  return variant === "dark" ? "text-zinc-300" : "text-zinc-500";
}

export function PaymentMethodBadges({
  variant = "light",
  className = "",
}: PaymentMethodBadgesProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className={badgeClass(variant)}>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 ${cardIconClass(variant)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 10h19" />
        </svg>
        Cards
      </span>

      <span className={badgeClass(variant)}>
        <span className="font-black tracking-tight text-sky-600">VISA</span>
      </span>

      <span className={badgeClass(variant)}>
        <span aria-hidden className="relative inline-block h-3.5 w-6">
          <span className="absolute left-0 top-0 h-3.5 w-3.5 rounded-full bg-red-500" />
          <span className="absolute left-2.5 top-0 h-3.5 w-3.5 rounded-full bg-amber-400" />
        </span>
        MC
      </span>

      <span className={badgeClass(variant)}>
        <span className="font-black tracking-tight text-cyan-700">AMEX</span>
      </span>

      <span className={badgeClass(variant)}>
        <span className="font-black tracking-tight text-sky-500">PayPal</span>
      </span>

      <span className={badgeClass(variant)}>
        <span className="font-black tracking-tight text-violet-500">Stripe</span>
      </span>
    </div>
  );
}
