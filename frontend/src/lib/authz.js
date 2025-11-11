// src/lib/authz.js
export function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function isStaff(auth) {
  if (!auth) return false;

  // 1) ฟิลด์ตรง ๆ
  if (auth.role === "staff") return true;

  // 2) roles ใน profile
  const roles = auth?.profile?.roles || auth?.roles;
  if (Array.isArray(roles) && roles.includes("staff")) return true;

  // 3) JWT claim
  const claims = auth?.token ? decodeJwt(auth.token) : null;
  const claimRoles = claims?.roles || claims?.role;
  if (Array.isArray(claimRoles) && claimRoles.includes("staff")) return true;
  if (typeof claimRoles === "string" && claimRoles === "staff") return true;

  return false;
}
