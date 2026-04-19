"use client";

type RegistrationSuccessDialogProps = {
  open: boolean;
  email: string;
  emailSent: boolean;
  continuing: boolean;
  onContinue: () => void;
};

export function RegistrationSuccessDialog({
  open,
  email,
  emailSent,
  continuing,
  onContinue,
}: RegistrationSuccessDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-success-title"
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <h2
          id="registration-success-title"
          className="text-xl font-semibold tracking-tight text-zinc-900"
        >
          Cuenta creada exitosamente
        </h2>
        <p className="mt-3 text-sm text-zinc-600">
          Tu cuenta está lista.{" "}
          {emailSent ? (
            <>
              Te enviamos un correo a{" "}
              <span className="font-medium text-zinc-900">{email}</span> con el
              resumen de acceso (en inglés) y el enlace para iniciar sesión.
            </>
          ) : (
            <>
              No pudimos enviar el correo de bienvenida en este momento; igual
              puedes entrar con{" "}
              <span className="font-medium text-zinc-900">{email}</span> y la
              contraseña que elegiste.
            </>
          )}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Por seguridad, nunca enviamos tu contraseña por email: usa la que
          acabas de crear al registrarte.
        </p>
        <button
          type="button"
          onClick={onContinue}
          disabled={continuing}
          className="mt-6 w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {continuing ? "Entrando…" : "Ir al panel"}
        </button>
      </div>
    </div>
  );
}
