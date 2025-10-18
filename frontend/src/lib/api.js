// Pretend-backend: replace with your real endpoints.

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

const mockHome = {
  hero: {
    images: [
      { id: "festival", src: "/hero/festival.jpg", href: "/events/festival-lights", alt: "บรรยากาศงานเทศกาลกลางคืน" },
      { id: "sports", src: "/hero/sports-day.jpg", href: "/events/sports-day", alt: "งานกีฬาเฟรชชี่" },
      { id: "concert", src: "/hero/concert.jpg", href: "/events/concert-night", alt: "คอนเสิร์ตกลางแจ้ง" },
    ],
    fallbackSrc: "/hero/fallback.jpg",
    headline: "ยินดีต้อนรับสู่แหล่งรวมกิจกรรมต่างๆของมหาวิทยาลัยธรรมศาสตร์",
    tagline: "งานเด่นช่วงสัปดาห์นี้",
    period: "งานเทศกาลวัฒนธรรม ตั้งแต่วันที่ 13 – 26 ตุลาคม",
  },
  events: [
    {
      id: "camping",
      title: "ค่ายกลางแจ้ง 4 วัน 3 คืน ณ เขาค้อ",
      host: "ชมรมท่องเที่ยวธรรมศาสตร์",
      date: "2025-10-14",
      location: "อุทยานแห่งชาติเขาค้อ",
      coverUrl: "/covers/camping.jpg",
      liked: true,
      category: "เรื่องเด่น",
      type: "อาสา",
      unit: "ชมรม",
    },
    {
      id: "scholar",
      title: "เวิร์กช็อปเตรียมสอบและทุนการศึกษาต่างประเทศ",
      host: "ศูนย์แนะแนวและทุนการศึกษา",
      date: "2025-10-19",
      location: "ห้องประชุมคณะสังคมศาสตร์",
      coverUrl: "/covers/scholar.jpg",
      liked: false,
      category: "กิจกรรมใหม่",
      type: "วิชาการ",
      unit: "คณะสังคมศาสตร์",
    },
    {
      id: "python",
      title: "อบรม Python เบื้องต้น สำหรับน้องปีหนึ่ง",
      host: "ชมรมโปรแกรมเมอร์ธรรมศาสตร์",
      date: "2025-10-24",
      location: "Co-Working Space อาคารเรียนรวม SC",
      coverUrl: "/covers/python.jpg",
      liked: false,
      category: "ใกล้ปิดรับสมัคร",
      type: "พัฒนาตน",
      unit: "คณะวิทยาศาสตร์",
    },
  ],
  favoriteEvents: [
    {
      id: "camping",
      title: "ค่ายกลางแจ้ง 4 วัน 3 คืน ณ เขาค้อ",
      host: "ชมรมท่องเที่ยวธรรมศาสตร์",
      date: "2025-10-14",
      location: "อุทยานแห่งชาติเขาค้อ",
      coverUrl: "/covers/camping.jpg",
      liked: true,
      category: "เรื่องเด่น",
      type: "อาสา",
      unit: "ชมรม",
    },
  ],
  agendaDays: [
    {
      date: "2025-10-14",
      highlight: true,
      items: [
        { title: "เปิดงานเทศกาลวัฒนธรรมมหาวิทยาลัย", id: "a1" },
        { title: "เวิร์กช็อปศิลปะไทยประยุกต์", id: "a2" },
      ],
    },
    {
      date: "2025-10-15",
      items: [
        { title: "การแข่งขันกีฬาสีภายใน", id: "b1" },
        { title: "ชมรมดนตรีแจ๊สเปิดบ้าน", id: "b2" },
      ],
    },
    {
      date: "2025-10-16",
      items: [
        { title: "กิจกรรมบำเพ็ญประโยชน์ ณ วัดใกล้เคียง", id: "c1" },
        { title: "บรรยายพิเศษอนาคตสายอาชีพดิจิทัล", id: "c2" },
      ],
    },
    {
      date: "2025-10-18",
      highlight: true,
      items: [
        { title: "งานประกวดวงดนตรีมหาวิทยาลัย", id: "d1" },
        { title: "ตลาดนัดศิษย์เก่าพบศิษย์ปัจจุบัน", id: "d2" },
      ],
    },
    {
      date: "2025-10-19",
      items: [
        { title: "ค่ายเตรียมความพร้อมภาษาอังกฤษ", id: "e1" },
      ],
    },
  ],
  notifications: [
    {
      id: "n1",
      icon: "🎉",
      color: "#9db8ff",
      title: "กิจกรรมใหม่: เทศกาลวัฒนธรรม Thammasat 2025",
      detail: "อย่าลืมลงทะเบียนร่วมงานก่อนวันที่ 12 ตุลาคม เพื่อรับของที่ระลึกพิเศษจำนวนจำกัด!",
      unread: true,
    },
    {
      id: "n2",
      icon: "🗓️",
      color: "#ffd166",
      title: "แจ้งเตือน: ปิดรับสมัครอบรม Python เบื้องต้น",
      detail: "เหลือเวลาอีก 2 วันสำหรับการสมัครเข้าร่วมอบรม Python สำหรับน้องปีหนึ่ง รีบลงชื่อกันนะ!",
      unread: true,
    },
    {
      id: "n3",
      icon: "📢",
      color: "#66a68c",
      title: "อัปเดตระบบ: ปรับหน้าตาใหม่หน้าโฮม",
      detail: "ทีมพัฒนาปรับดีไซน์หน้า Home ให้ใช้งานง่ายขึ้น หากมีคำแนะนำเพิ่มเติมสามารถส่งมาได้เลย",
      unread: false,
    },
  ],
};

function buildHeaders(token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchHomeData(token) {
  try {
    const response = await fetch(`${API_BASE}/home`, {
      method: "GET",
      headers: buildHeaders(token),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch home data: ${response.status}`);
    }

    const data = await response.json();
    return {
      hero: data.hero ?? mockHome.hero,
      events: data.events ?? [],
      favoriteEvents: data.favoriteEvents ?? [],
      agendaDays: data.agendaDays ?? [],
      notifications: data.notifications ?? [],
    };
  } catch (error) {
    console.warn("[fetchHomeData] Falling back to mock data", error);
    return mockHome;
  }
}

export async function updateFavoriteEvent(eventId, liked, token) {
  const endpoint = `${API_BASE}/favorites/${eventId}`;
  const method = liked ? "POST" : "DELETE";

  try {
    const response = await fetch(endpoint, {
      method,
      headers: buildHeaders(token),
      credentials: "include",
      body: liked ? JSON.stringify({ eventId }) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Failed to update favorite (${response.status})`);
    }
    return { ok: true };
  } catch (error) {
    console.error("[updateFavoriteEvent] error", error);
    return { ok: false, error };
  }
}

export async function fetchAllEvents() {
  return []; // fill in
}

export async function signInMock() {
  // return tokens, profile, etc.
  return { ok: true, user: { name: "Demo User" } };
}
