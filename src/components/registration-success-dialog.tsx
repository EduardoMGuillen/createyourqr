"use client";

import type { ResendEmailFailureCode } from "@/server/email/resend-failure-codes";

type RegistrationSuccessDialogProps = {
  open: boolean;
  email: string;
  emailSent: boolean;
  /** When the welcome email failed, explains likely cause (Resend / env). */
  emailFailureCode?: ResendEmailFailureCode | null;
  continuing: boolean;
  onContinue: () => void;
};

function emailFailureHint(code: ResendEmailFailureCode | null | undefined): string | null {
  if (!code) return null;
  switch (code) {
    case "invalid_sender":
      return "Resend rechazó el remitente: el valor de RESEND_FROM debe ser un dominio verificado en tu cuenta Resend (p. ej. «Nombre <hola@tudominio.com>»). Si usas un dominio que aún no está verificado, el correo no sale aunque el panel cuente un intento.";
    case "missing_api_key":
      return "En el servidor no está configurada RESEND_API_KEY (o está vacía). Añádela en las variables de entorno del despliegue (Vercel, etc.) y vuelve a desplegar.";
    case "missing_or_invalid_key":
      return "La clave de Resend no es válida o está restringida. Crea una API key de envío en el panel de Resend y actualiza RESEND_API_KEY.";
    case "quota":
      return "Resend indica que se alcanzó la cuota del plan (mensual o diaria). Revisa el panel de Resend → Usage.";
    case "rate_limit":
      return "Resend aplicó límite de velocidad. Espera unos minutos e inténtalo de nuevo.";
    case "validation":
      return "Resend devolvió un error de validación (from, to o contenido). Revisa que el email de destino sea válido y que RESEND_FROM tenga el formato «Nombre <correo@dominio>».";
    case "unknown":
    default:
      return "El envío falló por un motivo no clasificado. Revisa los logs del servidor (busca «[email] Resend welcome») y en Resend → Logs el detalle del intento.";
  }
}

export function RegistrationSuccessDialog({
  open,
  email,
  emailSent,
  emailFailureCode,
  continuing,
  onContinue,
}: RegistrationSuccessDialogProps) {
  if (!open) {
    return null;
  }

  const hint = emailFailureHint(emailFailureCode ?? null);

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
        {!emailSent && hint ? (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
            <strong className="font-semibold">Por qué puede pasar:</strong> {hint}
          </p>
        ) : null}
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
