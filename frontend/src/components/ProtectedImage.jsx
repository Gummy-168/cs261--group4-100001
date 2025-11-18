import { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";

export default function ProtectedImage({
  src,
  alt = "",
  className = "",
  fallback = null,
  ...imgProps
}) {
  const [currentSrc, setCurrentSrc] = useState(src || "");
  const [secureAttempted, setSecureAttempted] = useState(false);
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    setCurrentSrc(src || "");
    setSecureAttempted(false);
  }, [src]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const handleError = async () => {
    if (!src || secureAttempted) return;
    setSecureAttempted(true);
    try {
      const response = await axiosInstance.get(src, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      setObjectUrl(url);
      setCurrentSrc(url);
    } catch (err) {
      console.error("ProtectedImage: failed to fetch image with auth", err);
      if (fallback) {
        setCurrentSrc("");
      }
    }
  };

  if (!currentSrc && fallback) {
    return fallback;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...imgProps}
    />
  );
}
