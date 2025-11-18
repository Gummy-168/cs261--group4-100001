import { useEffect, useMemo, useState } from "react";
import { updateFavoriteEvent } from "../lib/api";

const toKey = (value) => (value == null ? "" : value.toString());

export default function useEventFavorites(data = {}, auth, requireLogin) {
  const [events, setEvents] = useState(data.events ?? []);
  const [favorites, setFavorites] = useState(data.favoriteEvents ?? []);
  const [error, setError] = useState(null);
  
  const [togglingIds, setTogglingIds] = useState(new Set()); 

  useEffect(() => {
    const favoriteSet = new Set((data.favoriteEvents ?? []).map((event) => toKey(event.id)));
    setFavorites(data.favoriteEvents ?? []);
    setEvents(
      (data.events ?? []).map((event) => ({
        ...event,
        liked: favoriteSet.has(toKey(event.id)) ? true : Boolean(event.liked),
      }))
    );
  }, [data.events, data.favoriteEvents]);

  const favoriteIds = useMemo(
    () => new Set((favorites ?? []).map((event) => toKey(event.id))),
    [favorites]
  );

  const onToggleLike = async (id, state) => {
    
    // ⭐️ (1) เช็คว่าล็อคอยู่หรือไม่ (เหมือนเดิม)
    if (togglingIds.has(id)) {
      console.warn(`Toggle for item ${id} is already in progress. Skipping.`);
      return; 
    }

    if (!auth?.loggedIn) {
      requireLogin?.();
      return;
    }

    if (!auth?.userId && !auth?.profile?.id) {
      console.error("User ID not found");
      setError("ไม่พบข้อมูลผู้ใช้ กรุณา Login ใหม่อีกครั้ง");
      // ⭐️ FIX: เพิ่ม return ตรงนี้เพื่อหยุดการทำงานถ้า userId ยังไม่พร้อม
      return;
    }

    const userId = auth?.userId || auth?.profile?.id;

    // ⭐️ (2) [จุดสำคัญ] หุ้มทุกอย่างด้วย try...finally
    try {
      // ⭐️ (3) "ล็อค": เพิ่ม "ID นี้" เข้าไปใน Set
      setTogglingIds(prev => new Set(prev).add(id));
      setError(null);

      // --- Optimistic Update (UI เปลี่ยนทันที) ---
      const prevEvents = events.map((event) => ({ ...event }));
      const prevFavorites = favorites.map((event) => ({ ...event }));

      const key = toKey(id);
      const targetFromEvents = events.find((event) => toKey(event.id) === key);
      const target = targetFromEvents ?? favorites.find((event) => toKey(event.id) === key);

      setEvents((prev) =>
        prev.map((event) => (toKey(event.id) === key ? { ...event, liked: state } : event))
      );

      setFavorites((prev) => {
        const filtered = prev.filter((event) => toKey(event.id) !== key);
        if (state && target) {
          return [...filtered, { ...target, liked: true }];
        }
        return filtered;
      });

      // --- เริ่มยิง API ---
      const result = await updateFavoriteEvent(id, state, auth?.token, userId);
      // --- API ตอบกลับมาแล้ว ---

      if (!result.ok) {
        // ถ้า API ล้มเหลว -> ย้อน UI กลับ
        setEvents(prevEvents);
        setFavorites(prevFavorites);
        setError("ไม่สามารถบันทึกกิจกรรมได้ กรุณาลองใหม่อีกครั้ง");
      }
      
    } catch (err) {
      // ⭐️ (4) [เผื่อ API พัง]
      // (โค้ดข้างบนอาจจะยังไม่ได้ย้อน state ให้ ถ้า error)
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด");
      // (เราไม่ต้องย้อน state ตรงนี้ เพราะ finally จะทำงานอยู่ดี)
      console.error("Error during toggle:", err);

    } finally {
      // ⭐️ (5) "ปลดล็อค": ลบ "ID นี้" ออกจาก Set
      // "finally" จะทำงาน "เสมอ" 
      // ไม่ว่า try จะ "สำเร็จ" (result.ok) 
      // หรือ "ล้มเหลว" (!result.ok)
      // หรือ "Error" (catch)
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return { 
    events, 
    favorites, 
    error, 
    setError, 
    onToggleLike, 
    favoriteIds,
    togglingIds 
  };
}
