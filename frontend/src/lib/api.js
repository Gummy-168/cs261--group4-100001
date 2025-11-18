import axiosInstance, { API_BASE_URL } from './axiosInstance';
import { getAllEventCards, getEventCardsForUser, getAllEventCardsForAdmin } from '../services/eventService';
import { addFavorite, removeFavorite } from '../services/favoriteService';
import Show from "../assets/img/Show.png";
import Welcome from "../assets/img/Welcom.png";
import Welcome2 from "../assets/img/Welcome2.png";
import { normalizeImagePath } from "./imagePath";

const resolveRawImageSource = (event = {}) => {
  const candidates = [
    event.imageUrl,
    event.imageURL,
    event.image_path,
    event.imagePath,
    event.image,
    event.imageSrc,
    event.image_source,
    event.coverImage,
    event.cover_image,
    event.coverUrl,
    event.cover_url,
    event.thumbnail,
    event.thumbnailUrl,
    event.thumbnail_url,
    event.thumbnailPath,
    event.thumbnail_path,
    event.poster,
    event.posterUrl,
    event.poster_url,
    event.heroImage,
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (typeof candidate === "string") {
      if (candidate.trim()) return candidate;
      continue;
    }
    if (typeof candidate === "object") {
      const nested =
        candidate.url ||
        candidate.src ||
        candidate.path ||
        candidate.imageUrl ||
        candidate.image_path;
      if (typeof nested === "string" && nested.trim()) {
        return nested;
      }
    }
  }
  return null;
};

const mockHome = {
  hero: {
    // Silde Show data
    images: [
      { id: "festival", src: Show, href: "/events/some-event", alt: "WELCOME" },
      { id: "sports", src: Welcome2, href: "/events/sports-day", alt: "" },
      { id: "concert", src: Welcome , href: "/events/concert-night", alt: "" },
    ],
    fallbackSrc: "/hero/fallback.jpg",
    headline: "ยินดีต้อนรับสู่แหล่งรวมกิจกรรมต่างๆของมหาวิทยาลัยธรรมศาสตร์",
    tagline: "",
    period: "ตุลาคม 2025",
  },
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
  ],
};

/**
 * แปลงข้อมูลจาก Backend เป็น format ที่ Frontend ต้องการ
 * ⭐️ [รวมการแก้ไข] ⭐️ - แก้ไขการสร้าง URL รูปภาพให้เป็นมาตรฐานเดียว (รองรับทุกเคส)
 */
function transformEventToFrontend(event) {
  const rawImage = resolveRawImageSource(event);
  let correctImageUrl = null;

  if (rawImage) {
    if (typeof rawImage === "string" && rawImage.startsWith("http")) {
      correctImageUrl = rawImage;
    } else {
      const normalizedPath = normalizeImagePath(rawImage);
      if (normalizedPath) {
        const backendBaseUrl = API_BASE_URL.replace(/\/api\/?$/, "");
        const relativePath = normalizedPath.startsWith("/")
          ? normalizedPath
          : `/${normalizedPath}`;
        correctImageUrl = `${backendBaseUrl}${relativePath}`;
      }
    }
  }

  const normalizedDate = event.date || event.startTime || null;
  const normalizedUpdatedAt = event.updatedAt || event.modifiedAt || event.lastUpdated || null;
  const normalizedCreatedAt = event.createdAt || event.postedAt || null;
  const normalizedViews = event.views ?? event.viewCount ?? event.totalViews ?? null;
  const normalizedLikes = event.likes ?? event.favoriteCount ?? event.totalFavorites ?? event.likesCount ?? null;
  const normalizedReviews = event.reviews ?? event.reviewCount ?? event.totalReviews ?? null;
  const normalizedScore = event.rating ?? event.score ?? event.averageRating ?? null;

  return {
    id: event.id,
    title: event.title,
    host: event.organizer || 'ไม่ระบุผู้จัด',
    date: normalizedDate,
    location: event.location || 'ไม่ระบุสถานที่',
    imageUrl: correctImageUrl, // ❗️ ใช้ URL ที่เราแก้ไขแล้ว
    liked: event.isFavorited || false,
    category: event.category || 'ทั้งหมด',
    type: event.category || 'ทั้งหมด',
    unit: event.organizer || 'ทั้งหมด',
    // ข้อมูลเพิ่มเติม
    description: event.description,
    startTime: event.startTime,
    endTime: event.endTime,
    maxCapacity: event.maxCapacity,
    currentParticipants: event.currentParticipants,
    status: event.status,
    fee: event.fee,
    isFull: event.isFull,
    availableSeats: event.availableSeats,
    isPublic: event.isPublic,
    updatedAt: normalizedUpdatedAt,
    createdAt: normalizedCreatedAt,
    views: normalizedViews,
    likes: normalizedLikes,
    reviews: normalizedReviews,
    rating: normalizedScore,
  };
}


/**
 * ดึงข้อมูลหน้า Home (Events + Favorites + Hero + Agenda)
 */
export async function fetchHomeData(token, userId = null) {
  try {
    let events = [];
    let favoriteEvents = [];

    console.log('📦 Fetching home data...', { userId, hasToken: !!token });

    // ดึงข้อมูล Events
    if (userId) {
      // ถ้ามี userId ดึงพร้อม favorite status
      console.log('👤 Fetching events for user:', userId);
      const eventsData = await getEventCardsForUser(userId);
      events = eventsData.map(transformEventToFrontend); // ❗️ เรียกใช้ตัวแปลงที่แก้ไขแล้ว
      
      // กรอง events ที่ favorite
      favoriteEvents = events.filter(e => e.liked);
      console.log('✅ Events loaded:', events.length, 'Favorites:', favoriteEvents.length);
    } else {
      // ถ้าไม่มี userId ดึงแบบธรรมดา (Public)
      console.log('🌐 Fetching public events');
      const eventsData = await getAllEventCards();
      events = eventsData.map(transformEventToFrontend); // ❗️ เรียกใช้ตัวแปลงที่แก้ไขแล้ว
      console.log('✅ Public events loaded:', events.length);
    }

    return {
      hero: mockHome.hero,
      events: events,
      favoriteEvents: favoriteEvents,
      agendaDays: mockHome.agendaDays,
      notifications: mockHome.notifications,
    };
  } catch (error) {
    console.error("[fetchHomeData] Error:", error);
    return {
      hero: mockHome.hero,
      events: [],
      favoriteEvents: [],
      agendaDays: mockHome.agendaDays,
      notifications: mockHome.notifications,
    };
  }
}

/**
 * ดึงข้อมูลหน้า Home สำหรับ Staff (รวม Draft events)
 */
export async function fetchHomeDataForStaff(token, userId = null) {
  try {
    console.log('📦 Fetching home data for staff...');
    
    const eventsData = await getAllEventCardsForAdmin();
    const events = eventsData.map(transformEventToFrontend); // ❗️ เรียกใช้ตัวแปลงที่แก้ไขแล้ว
    
    console.log('✅ Staff events loaded (including drafts):', events.length);
    
    return {
      hero: mockHome.hero,
      events: events,
      favoriteEvents: [],
      agendaDays: mockHome.agendaDays,
      notifications: mockHome.notifications,
    };
  } catch (error) {
    console.error("[fetchHomeDataForStaff] Error:", error);
    return {
      hero: mockHome.hero,
      events: [],
      favoriteEvents: [],
      agendaDays: mockHome.agendaDays,
      notifications: mockHome.notifications,
    };
  }
}

/**
 * Toggle Favorite Event
 */
export async function updateFavoriteEvent(eventId, liked, token, userId) {
  if (!userId) {
    console.error("[updateFavoriteEvent] userId is required (for client check)");
    return { ok: false, error: "User ID is required" };
  }

  try {
    console.log("?? Updating favorite:", { eventId, nextState: liked, userId });

    if (liked) {
      await addFavorite(eventId, userId);
    } else {
      await removeFavorite(eventId, userId);
    }

    console.log("? Favorite updated successfully");
    return { ok: true };
  } catch (error) {
    console.error("[updateFavoriteEvent] error:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * ดึงข้อมูล Events ทั้งหมด
 */
export async function fetchAllEvents() {
  try {
    console.log('📋 Fetching all events...');
    const events = await getAllEventCards();
    const transformed = events.map(transformEventToFrontend); // ❗️ เรียกใช้ตัวแปลงที่แก้ไขแล้ว
    console.log('✅ All events loaded:', transformed.length);
    return transformed;
  } catch (error) {
    console.error("[fetchAllEvents] Error:", error);
    return [];
  }
}

/**
 * Sign in mock (deprecated - ใช้ authService.login แทน)
 */
export async function signInMock() {
  console.warn('⚠️ signInMock is deprecated. Use authService.login() instead.');
  return { ok: true, user: { name: "Demo User" } };
}
