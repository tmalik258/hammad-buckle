import type { ReactNode } from "react";

export const authInputClassName =
  "w-full rounded-none rounded-tr-2xl rounded-bl-2xl border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400";

export const authLinkClassName =
  "font-medium text-zinc-900 underline-offset-4 hover:underline cursor-pointer";

export const authMutedTextClassName = "text-sm text-zinc-600";

interface AuthFormShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthFormShell({ title, description, children }: AuthFormShellProps) {
  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
          {description ? (
            <p className={`mt-2 ${authMutedTextClassName}`}>{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
