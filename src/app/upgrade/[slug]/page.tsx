import Link from "next/link";

type UpgradePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function UpgradePage({ params }: UpgradePageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-800">
        QR expired
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
        This QR code needs reactivation
      </h1>
      <p className="max-w-xl text-zinc-600">
        The free QR for <span className="font-medium">{slug}</span> has reached its
        time or scan limit. Upgrade to CreateYourQR Pro for unlimited scans and no
        expiration.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/pricing"
          className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Activate with Pro - $15/mo
        </Link>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Generate new free QR
        </Link>
      </div>
    </main>
  );
}
