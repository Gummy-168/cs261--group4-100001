import { useCallback, useMemo, useState } from "react";

/**
 * Default preference shape for newly initialized users.
 */
export const DEFAULT_PREFERENCES = {
  theme: "light",
  notifications: { follow: true, near: true, recommend: true, announce: true },
  privacy: { showFavorites: true },
};

const readStoredJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const mergeObjects = (base, patch) => {
  if (!patch || typeof patch !== "object") return base;
  const next = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(patch)) {
    next[key] =
      value && typeof value === "object" && !Array.isArray(value)
        ? mergeObjects(next[key] ?? {}, value)
        : value;
  }
  return next;
};

const hasAdminRole = (profile) => {
  if (!profile) return false;
  const roles = profile.roles ?? profile.role;
  if (!roles) return false;
  if (typeof roles === "string") return roles === "admin";
  if (Array.isArray(roles)) return roles.includes("admin");
  return false;
};

const persistAdminEmail = (profile) => {
  if (typeof window === "undefined") return;
  if (profile && hasAdminRole(profile) && profile.email) {
    try {
      window.localStorage.setItem("adminEmail", profile.email.toLowerCase());
    } catch {
      // ignore
    }
  } else {
    window.localStorage.removeItem("adminEmail");
  }
};

/**
 * Local auth store that mirrors the logic previously defined in main.jsx.
 * Holds token/profile/userId/preferences and exposes helpers to mutate + persist them.
 */
export function useAuthStore() {
  const [state, setState] = useState(() => {
    const storedToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem("authToken") ??
          window.sessionStorage.getItem("authToken")
        : null;
    const storedUserId =
      typeof window !== "undefined"
        ? window.localStorage.getItem("userId")
        : null;
    const storedProfile = readStoredJson("profileDraft", null);
    const storedPreferences = mergeObjects(
      DEFAULT_PREFERENCES,
      readStoredJson("userPreferences", DEFAULT_PREFERENCES)
    );
    return {
      loggedIn: Boolean(storedToken),
      token: storedToken,
      profile: storedProfile,
      userId: storedUserId ? parseInt(storedUserId, 10) : null,
      preferences: storedPreferences,
    };
  });

  const persistProfile = useCallback((profile) => {
    if (typeof window === "undefined") return;
    if (!profile) {
      window.localStorage.removeItem("profileDraft");
      return;
    }
    try {
      window.localStorage.setItem("profileDraft", JSON.stringify(profile));
    } catch {
      // no-op
    }
  }, []);

  const persistPreferences = useCallback((prefs) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("userPreferences", JSON.stringify(prefs));
    } catch {
      // no-op
    }
  }, []);

  const login = useCallback(({ token, profile, remember = true, userId } = {}) => {
    let resolvedProfile = profile;
    setState((prev) => {
      const nextProfile = resolvedProfile ?? prev.profile;
      resolvedProfile = nextProfile;
      if (nextProfile) {
        try {
          window.localStorage.setItem("profileDraft", JSON.stringify(nextProfile));
        } catch {
          // no-op
        }
      }
      return {
        ...prev,
        loggedIn: true,
        token: token ?? prev.token,
        profile: nextProfile,
        userId: userId ?? prev.userId,
      };
    });

    if (token) {
      if (remember) {
        window.localStorage.setItem("authToken", token);
        window.sessionStorage.removeItem("authToken");
      } else {
        window.sessionStorage.setItem("authToken", token);
        window.localStorage.removeItem("authToken");
      }
    }

    if (userId) {
      window.localStorage.setItem("userId", userId.toString());
    }

    persistAdminEmail(resolvedProfile);
    if (typeof window !== "undefined" && resolvedProfile) {
      const usernameValue =
        resolvedProfile.username ||
        resolvedProfile.studentId ||
        resolvedProfile.email ||
        resolvedProfile.id ||
        null;
      if (usernameValue != null) {
        window.localStorage.setItem("username", usernameValue.toString());
      }
      const displayNameValue =
        resolvedProfile.displaynameTh ||
        resolvedProfile.fullName ||
        resolvedProfile.name ||
        null;
      if (displayNameValue) {
        window.localStorage.setItem("displayName", displayNameValue);
      }
      if (resolvedProfile.email) {
        window.localStorage.setItem("userEmail", resolvedProfile.email.toLowerCase());
      }
    }
  }, []);

  const updateProfile = useCallback(
    (updater) => {
      setState((prev) => {
        const base = prev.profile ?? {};
        const next =
          typeof updater === "function" ? updater(base) : { ...base, ...updater };
        persistProfile(next);
        persistAdminEmail(next);
        return { ...prev, profile: next };
      });
    },
    [persistProfile]
  );

  const updatePreferences = useCallback(
    (updater) => {
      setState((prev) => {
        const base = mergeObjects(DEFAULT_PREFERENCES, prev.preferences ?? {});
        const next =
          typeof updater === "function"
            ? updater(base)
            : mergeObjects(base, updater);
        persistPreferences(next);
        return { ...prev, preferences: next };
      });
    },
    [persistPreferences]
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("authToken");
      window.sessionStorage.removeItem("authToken");
      window.localStorage.removeItem("userId");
      window.localStorage.removeItem("adminEmail");
      window.localStorage.removeItem("username");
      window.localStorage.removeItem("displayName");
      window.localStorage.removeItem("userEmail");
    }
    persistProfile(null);
    persistPreferences({ ...DEFAULT_PREFERENCES });
    setState({
      loggedIn: false,
      token: null,
      profile: null,
      userId: null,
      preferences: { ...DEFAULT_PREFERENCES },
    });
  }, [persistProfile, persistPreferences]);

  return useMemo(
    () => ({
      ...state,
      login,
      logout,
      updateProfile,
      updatePreferences,
    }),
    [state, login, logout, updateProfile, updatePreferences]
  );
}

export const useAuth = useAuthStore;

export default useAuthStore;
