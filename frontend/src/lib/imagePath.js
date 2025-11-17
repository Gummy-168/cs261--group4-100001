export function normalizeImagePath(rawPath) {
  if (typeof rawPath !== "string") return null;

  let path = rawPath.trim();
  if (!path) return null;

  // Ignore base64/blob URLs – they shouldn't be persisted as-is
  if (/^(data|blob):/i.test(path)) {
    return null;
  }

  // Convert absolute URL to pathname so we're left with the backend path
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      path = url.pathname || "";
    } catch {
      return null;
    }
  }

  if (!path) return null;

  // Drop query/hash fragments to keep storage clean
  const hashIndex = path.indexOf("#");
  if (hashIndex !== -1) {
    path = path.slice(0, hashIndex);
  }
  const queryIndex = path.indexOf("?");
  if (queryIndex !== -1) {
    path = path.slice(0, queryIndex);
  }

  if (!path) return null;

  if (path.startsWith("/")) {
    path = `/${path.replace(/^\/+/, "")}`;
  } else {
    path = `/${path}`;
  }

  // Collapse duplicated slashes or prefixes that slipped in from previous saves
  path = path.replace(/\/{2,}/g, "/");
  path = path.replace(/\/api\/images\/api\/images\//g, "/api/images/");
  path = path.replace(/\/images\/images\//g, "/images/");

  return path;
}

export default normalizeImagePath;
