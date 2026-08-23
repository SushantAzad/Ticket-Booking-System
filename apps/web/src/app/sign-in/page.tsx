"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, setAuthToken } from "@/lib/api-client";
import { redirect } from "next/navigation";

export default function SignInPage() {
  redirect("/login");
  const router = useRouter();
  const [email, setEmail] = useState("customer@tbs.com");
  const [password, setPassword] = useState("Customer@123");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.post(
        mode === "login" ? "/auth/login" : "/auth/register",
        mode === "login" ? { email, password } : { email, password, name },
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
      router.push("/dashboard");
    } catch (requestError: unknown) {
      const apiMessage =
        typeof requestError === "object" &&
        requestError !== null &&
        "response" in requestError
          ? (
              requestError as {
                response?: { data?: { message?: string | string[] } };
              }
            ).response?.data?.message
          : undefined;
      setError(
        Array.isArray(apiMessage)
          ? apiMessage.join(" ")
          : apiMessage ||
              (mode === "login"
                ? "That login did not work. Check your details and try again."
                : "We could not create your account."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-enter grid min-h-[calc(100vh-80px)] items-center py-12 lg:grid-cols-2 lg:gap-20">
      <div className="hidden lg:block">
        <p className="eyebrow mb-5">Welcome back</p>
        <h1 className="max-w-lg text-6xl font-black leading-none">
          Your next seat is closer than you think.
        </h1>
        <p className="muted mt-6 max-w-md text-lg leading-8">
          Sign in to see your bookings, manage holds, and pick up where you left
          off.
        </p>
      </div>
      <div className="panel mx-auto w-full max-w-md rounded-2xl p-7 sm:p-9">
        <p className="eyebrow">TicketFlow account</p>
        <div className="mt-3 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-black">
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="text-sm font-bold text-[#70e1d0]"
          >
            {mode === "login" ? "Register" : "I have an account"}
          </button>
        </div>
        <p className="muted mt-2 text-sm">
          {mode === "login"
            ? "Use the seeded customer account or your own account."
            : "Create a customer account to reserve seats."}
        </p>
        <form onSubmit={signIn} className="mt-8 space-y-5">
          <label className="block text-sm font-bold">
            {mode === "register" && (
              <>
                <span>Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 mb-5 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
                />
              </>
            )}
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
              : mode === "login"
                ? "Continue to dashboard"
                : "Create account"}
          </button>
        </form>
        <Link
          href="/events"
          className="muted mt-6 block text-center text-sm hover:text-white"
        >
          Continue browsing events
        </Link>
      </div>
    </div>
  );
}
