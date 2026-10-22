"use client";

import { useActionState, useState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [show, setShow] = useState(false);
  const error = state?.error;

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Mật khẩu</span>
        <span className="relative block">
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            autoFocus
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "login-error" : undefined}
            placeholder="Nhập mật khẩu quản trị"
            className={`h-12 w-full rounded-xl border bg-card pr-20 pl-4 text-base shadow-sm outline-none transition-colors placeholder:text-ink-soft/50 focus:border-ink/50 focus:ring-4 focus:ring-caramel/15 ${
              error ? "border-[#b4442b]" : "border-line"
            }`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-paper-2 hover:text-ink"
          >
            {show ? "Ẩn" : "Hiện"}
          </button>
        </span>
      </label>
      {error && (
        <p id="login-error" role="alert" className="text-sm text-[#9a3a24]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-ink text-[15px] font-semibold text-cream transition-colors hover:bg-caramel-dark disabled:opacity-60"
      >
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}
