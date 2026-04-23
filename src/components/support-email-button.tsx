type SupportEmailButtonProps = {
  variant?: "link" | "button";
  className?: string;
  source?: string;
};

export function SupportEmailButton({
  variant = "link",
  className = "",
  source = "createyourqr-app",
}: SupportEmailButtonProps) {
  const subject = encodeURIComponent("CreateYourQR support request");
  const body = encodeURIComponent(
    `Hi Eduardo,%0D%0A%0D%0AI need help with billing/account on CreateYourQR.%0D%0ASource: ${source}%0D%0A`,
  );
  const href = `mailto:eduardoguillendev@proton.me?subject=${subject}&body=${body}`;

  if (variant === "button") {
    return (
      <a
        href={href}
        className={`inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 ${className}`}
      >
        Support
      </a>
    );
  }

  return (
    <a href={href} className={`text-zinc-800 underline-offset-4 hover:underline ${className}`}>
      Support
    </a>
  );
}
