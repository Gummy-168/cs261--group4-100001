import { useEffect, useMemo, useState } from "react";
import { updateFavoriteEvent } from "../lib/api";

export default function useEventFavorites(data = {}, auth, requireLogin) {
  const [events, setEvents] = useState(data.events ?? []);
  const [favorites, setFavorites] = useState(data.favoriteEvents ?? []);
  const [error, setError] = useState(null);

  useEffect(() => {
    const favoriteSet = new Set((data.favoriteEvents ?? []).map((event) => event.id));
    setFavorites(data.favoriteEvents ?? []);
    setEvents(
      (data.events ?? []).map((event) => ({
        ...event,
        liked: favoriteSet.has(event.id) ? true : Boolean(event.liked),
      }))
    );
  }, [data.events, data.favoriteEvents]);

  const favoriteIds = useMemo(
    () => new Set((favorites ?? []).map((event) => event.id)),
    [favorites]
  );

  const onToggleLike = async (id, state) => {
    if (!auth?.loggedIn) {
      requireLogin?.();
      return;
    }

    // ต้องมี userId
    if (!auth?.userId && !auth?.profile?.id) {
      console.error("User ID not found");
      setError("ไม่พบข้อมูลผู้ใช้ กรุณา Login ใหม่อีกครั้ง");
      return;
    }

    const userId = auth?.userId || auth?.profile?.id;

    setError(null);

    const prevEvents = events.map((event) => ({ ...event }));
    const prevFavorites = favorites.map((event) => ({ ...event }));

    const targetFromEvents = events.find((event) => event.id === id);
    const target = targetFromEvents ?? favorites.find((event) => event.id === id);

    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, liked: state } : event))
    );

    setFavorites((prev) => {
      const filtered = prev.filter((event) => event.id !== id);
      if (state && target) {
        return [...filtered, { ...target, liked: true }];
      }
      return filtered;
    });

    const result = await updateFavoriteEvent(id, state, auth?.token, userId);
    if (!result.ok) {
      setEvents(prevEvents);
      setFavorites(prevFavorites);
      setError("ไม่สามารถบันทึกกิจกรรมได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return { events, favorites, error, setError, onToggleLike, favoriteIds };
}
