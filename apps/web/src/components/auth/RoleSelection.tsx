"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { readStoredUser, storeAuthState } from "@/lib/auth";

const options = [
  {
    key: "CUSTOMER",
    title: "CUSTOMER",
    description:
      "Discover events, choose your seats, and manage your bookings.",
  },
  {
    key: "ORGANISER",
    title: "ORGANISER",
    description:
      "Create events, configure venues, manage shows, pricing, and bookings.",
  },
] as const;

export function RoleSelection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectRole = async (role: (typeof options)[number]["key"]) => {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/role", { role });
      const user = readStoredUser();
      const nextUser = { ...user, role };
      const accessToken = localStorage.getItem("ticketflow_access_token");

      if (accessToken) {
        storeAuthState(accessToken, nextUser);
        localStorage.setItem("ticketflow_onboarded", "true");
      }

      const payload = response.data?.user ?? nextUser;
      localStorage.setItem("ticketflow_user", JSON.stringify(payload));
      window.dispatchEvent(new Event("ticketflow-auth-changed"));

      router.push(role === "ORGANISER" ? "/organiser/dashboard" : "/dashboard");
    } catch (requestError: unknown) {
      const message =
        requestError &&
        typeof requestError === "object" &&
        "response" in requestError
          ? (
              requestError as {
                response?: { data?: { message?: string | string[] } };
              }
            ).response?.data?.message
          : undefined;

      setError(
        Array.isArray(message)
          ? message.join(" ")
          : message || "We could not update your role. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-enter py-12 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <p className="eyebrow">Welcome to TicketFlow</p>
          <h1 className="mt-4 text-4xl font-black sm:text-6xl">
            How will you use TicketFlow?
          </h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              disabled={loading}
              onClick={() => void selectRole(option.key)}
              className="panel rounded-2xl p-7 text-left hover:border-[#70e1d0]/60 hover:bg-white/5"
            >
              <div className="mb-5 inline-flex rounded-full border border-[#70e1d0]/30 bg-[#70e1d0]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#70e1d0]">
                {option.title}
              </div>
              <p className="mt-4 text-lg text-white">{option.description}</p>
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-[#ff8d72]/40 bg-[#ff8d72]/10 p-4 text-sm text-[#ffc0b0]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
