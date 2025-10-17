// Pretend-backend: replace with your real endpoints.

export async function fetchHomeData() {
  // e.g., const res = await fetch("/api/home"); return res.json();
  return {
    hero: {
      images: [
        { id: "s1", src: "/hero/a.jpg", href: "/events/slide-1", alt: "Slide 1" },
        { id: "s2", src: "/hero/b.jpg", href: "/events/slide-2", alt: "Slide 2" },
        { id: "s3", src: "/hero/c.jpg", href: "/events/slide-3", alt: "Slide 3" },
      ],
      fallbackSrc: "/hero/fallback.jpg",
    },
    events: [
      { id: "camping",  title: "ค่าย Camping 4 วัน 3 คืน ณ ดอยสวย", host: "ชมรมท่องเที่ยว", date: "2025-10-14", coverUrl: "/covers/camping.jpg", liked: true },
      { id: "scholar",  title: "ประชุมทุนการศึกษา", host: "คณะวิทยาศาสตร์", date: "2025-10-14", coverUrl: "/covers/scholar.jpg", liked: false },
      { id: "python",   title: "โปรแกรม Python เบื้องต้น", host: "คณะวิศวกรรมศาสตร์", date: "2025-10-24", coverUrl: "/covers/python.jpg", liked: false },
    ],
    agendaDays: [
      { date: "2025-10-14", items: [{ title: "ค่ายxxxxxxxxxx", id: "a1" }, { title: "เวิร์กช็อปxxxxxx", id: "a2" }] },
      { date: "2025-10-15", items: [{ title: "กิจกรรม 1", id: "b1" }] },
      { date: "2025-10-16", items: [{ title: "กิจกรรม 2", id: "b2" }, { title: "กิจกรรมเพิ่ม", id: "b22" }] },
      { date: "2025-10-18", items: [{ title: "กิจกรรม 4", id: "b4" }, { title: "กิจกรรมย่อย", id: "b42" }] },
    ],
    notifications: [
      { id: "n1", icon: "🔔", color: "#9db8ff", title: "แบบสำรวจความพึงพอใจการใช้บริการ", detail: "ความคิดเห็นของท่านมีความสำคัญ...", unread: true },
      { id: "n2", icon: "〰️", color: "#ffd166", title: "กิจกรรมที่สนใจมีการปรับรายละเอียด", detail: "อัปเดตแล้ว...", unread: true },
      { id: "n3", icon: "〰️", color: "#66a68c", title: "กิจกรรมที่น่าสนใจกำลังดำเนินอยู่", detail: "กำลังเปิดให้เข้าร่วม/รับชม", unread: false },
    ],
  };
}

export async function fetchAllEvents() {
  return []; // fill in
}

export async function signInMock() {
  // return tokens, profile, etc.
  return { ok: true, user: { name: "Demo User" } };
}
