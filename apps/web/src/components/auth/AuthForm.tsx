"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, setAuthToken } from "@/lib/api-client";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    mode === "login" ? "customer@tbs.com" : "",
  );
  const [password, setPassword] = useState(
    mode === "login" ? "Customer@123" : "",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.post(
        isLogin ? "/auth/login" : "/auth/register",
        isLogin ? { email, password } : { name, email, password },
      );
      setAuthToken(response.data.accessToken);
      localStorage.setItem(
        "ticketflow_access_token",
        response.data.accessToken,
      );
      localStorage.setItem(
        "ticketflow_user",
        JSON.stringify(response.data.user),
      );
      window.dispatchEvent(new Event("ticketflow-auth-changed"));
      router.push("/dashboard");
    } catch (requestError: unknown) {
      const response = requestError as {
        response?: { data?: { message?: string | string[] } };
      };
      const message = response.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join(" ")
          : message ||
              (isLogin
                ? "Invalid email or password."
                : "We could not create your account."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-enter grid min-h-[calc(100vh-80px)] items-center py-12 lg:grid-cols-2 lg:gap-20">
      <div className="hidden lg:block">
        <p className="eyebrow mb-5">TicketFlow account</p>
        <h1 className="max-w-lg text-6xl font-black leading-none">
          Make room for a better night out.
        </h1>
        <p className="muted mt-6 max-w-md text-lg leading-8">
          {isLogin
            ? "Sign in to manage your holds and bookings."
            : "Create a customer account and reserve seats in seconds."}
        </p>
      </div>
      <div className="panel mx-auto w-full max-w-md rounded-2xl p-7 sm:p-9">
        <p className="eyebrow">{isLogin ? "Welcome back" : "New account"}</p>
        <h2 className="mt-3 text-3xl font-black">
          {isLogin ? "Sign in" : "Create account"}
        </h2>
        <p className="muted mt-2 text-sm">
          {isLogin
            ? "Use the seeded demo account or your own account."
            : "Your account is created as a customer."}
        </p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          {!isLogin && (
            <label className="block text-sm font-bold">
              Name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
              />
            </label>
          )}
          <label className="block text-sm font-bold">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            />
          </label>
          <label className="block text-sm font-bold">
            Password
            <input
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            />
          </label>
          {error && (
            <p className="rounded-lg bg-[#ff8d72]/10 p-3 text-sm text-[#ffc0b0]">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="button-primary w-full rounded-xl px-4 py-3 text-sm disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Continue to dashboard"
                : "Create account"}
          </button>
        </form>
        <div className="mt-6 flex justify-between text-sm">
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="text-[#70e1d0]"
          >
            {isLogin ? "Create an account" : "I already have an account"}
          </Link>
          <Link href="/events" className="muted hover:text-white">
            Browse events
          </Link>
        </div>
      </div>
    </div>
  );
}
