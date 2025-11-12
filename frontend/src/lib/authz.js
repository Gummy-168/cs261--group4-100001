// src/lib/authz.js
export function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

const hasRole = (auth, role) => {
  if (!auth) return false;

  if (auth.role === role) return true;

  const roles = auth?.profile?.roles ?? auth?.roles;
  if (typeof roles === "string" && roles === role) return true;
  if (Array.isArray(roles) && roles.includes(role)) return true;

  const claims = auth?.token ? decodeJwt(auth.token) : null;
  const claimRoles = claims?.roles ?? claims?.role;
  if (typeof claimRoles === "string" && claimRoles === role) return true;
  if (Array.isArray(claimRoles) && claimRoles.includes(role)) return true;

  return false;
};

export function isStaff(auth) {
  return hasRole(auth, "staff") || hasRole(auth, "admin");
}

export function isAdmin(auth) {
  return hasRole(auth, "admin");
}
