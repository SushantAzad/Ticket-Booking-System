export type UserRole = "CUSTOMER" | "ORGANISER" | "ADMIN";

export type StoredUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole;
};

export function readStoredUser(): StoredUser {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      localStorage.getItem("ticketflow_user") || "{}",
    ) as StoredUser;
  } catch {
    return {};
  }
}

export function getStoredUserRole(): UserRole | undefined {
  return readStoredUser().role;
}

export function storeAuthState(accessToken: string, user: StoredUser) {
  if (typeof window === "undefined") return;

  localStorage.setItem("ticketflow_access_token", accessToken);
  localStorage.setItem("ticketflow_user", JSON.stringify(user));
  window.dispatchEvent(new Event("ticketflow-auth-changed"));
}

export function clearAuthState() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("ticketflow_access_token");
  localStorage.removeItem("ticketflow_user");
  localStorage.removeItem("ticketflow_onboarded");
  window.dispatchEvent(new Event("ticketflow-auth-changed"));
}

export function routeUserAfterLogin(user?: StoredUser) {
  const role = user?.role ?? getStoredUserRole();

  if (role === "ORGANISER" || role === "ADMIN") {
    return "/organiser/dashboard";
  }

  if (
    typeof window !== "undefined" &&
    !localStorage.getItem("ticketflow_onboarded")
  ) {
    return "/onboarding";
  }

  return "/dashboard";
}
