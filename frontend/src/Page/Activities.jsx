import { useMemo, useState, useEffect, useCallback, useRef } from "react"; 
import Header, { HeaderSpacer } from "../components/Header";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import { THEME } from "../theme";
import useEventFavorites from "../hooks/useEventFavorites";
import { searchEvents } from "../services/eventService"; //

// --- Constants (เหมือนเดิม) ---
const CATEGORY_FILTERS = ["เรียงลำดับ", "เรื่องเด่น", "กิจกรรมใหม่", "ใกล้ปิดรับสมัคร"];
const TYPE_FILTERS = ["ประเภท", "วิชาการ", "บันเทิง", "กีฬา", "อาสา", "พัฒนาตน"]; //
const UNIT_FILTERS = [ // (นี่คือ "สังกัด" หรือ Organizer)
  "สังกัด",
  "คณะวิศวกรรมศาสตร์",
  "คณะศิลปศาสตร์",
  "คณะวิทยาศาสตร์",
  "คณะสังคมศาสตร์",
  "ชมรม",
  "กองกิจการนักศึกษา", // ⭐️ เพิ่มจาก JSON
];

// ⭐️ [เพิ่มใหม่] สร้าง List สำหรับ "สถานที่" (Location)
const LOCATION_FILTERS = [
  "สถานที่", // Default value
  "สนามกีฬากลาง ม.ธรรมศาสตร์", // ⭐️ เพิ่มจาก JSON
  "อาคารเรียนรวม",
  "SC1-306",
  "ออนไลน์",
];


// --- Components (เหมือนเดิม) ---
function FilterChip({ label, isActive, onClick, children }) {
  // (โค้ดเดิม ไม่เปลี่ยนแปลง)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
          isActive ? "bg-[#e84c3d] text-white shadow-md" : "bg-black/5 text-gray-700 hover:bg-black/10"
        }`}
      >
        {label}
      </button>
      {children}
    </div>
  );
}

function DropdownList({ open, items, onSelect }) {
  // (โค้ดเดิม ไม่เปลี่ยนแปลง)
  if (!open) return null;
  return (
    <div className="absolute left-0 top-full z-10 mt-2 min-w-[200px] overflow-hidden rounded-2xl border border-black/10 bg-white py-2 shadow-lg">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className="block w-full px-5 py-2 text-left text-sm transition hover:bg-black/5"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

// --- Page Component (แก้ไขใหม่) ---
export default function ActivitiesPage({ navigate, auth, data, requireLogin }) {
  
  // --- ⭐️ State สำหรับการดึงข้อมูล ---
  const [fetchedEvents, setFetchedEvents] = useState(data?.events || []); 
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // --- ⭐️ State สำหรับตัวกรอง (Filters) ---
  const [searchTerm, setSearchTerm] = useState(""); // 1. Keyword
  const [category, setCategory] = useState(CATEGORY_FILTERS[0]); // 2. SortBy
  const [type, setType] = useState(TYPE_FILTERS[0]); // 3. Category
  const [unit, setUnit] = useState(UNIT_FILTERS[0]); // 4. Organizer (สังกัด)
  // ⭐️ 5. [เพิ่มใหม่] State สำหรับ Location (สถานที่)
  const [locationFilter, setLocationFilter] = useState(LOCATION_FILTERS[0]); 
  // 6. Date Range
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD

  const [openMenu, setOpenMenu] = useState(null);

  // --- ⭐️ Hook จัดการ Favorite ---
  const { events, error: favoriteError, onToggleLike, favoriteIds } = useEventFavorites(
    { ...data, events: fetchedEvents },
    auth, 
    requireLogin
  );
  
  const error = apiError || favoriteError;

  // --- ⭐️ [แก้ไข] ฟังก์ชันสำหรับเรียก API Search (useCallback) ---
  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    const params = {
      keyword: searchTerm || undefined,
      category: type === TYPE_FILTERS[0] ? undefined : type,
      
      // ⭐️ [แก้ไข] เพิ่ม locationFilter เข้าไป
      location: locationFilter === LOCATION_FILTERS[0] ? undefined : locationFilter,
      // ⭐️ [แก้ไข] "สังกัด" (unit) แมปไปที่ "organizer"
      organizer: unit === UNIT_FILTERS[0] ? undefined : unit,
      
      // (อ้างอิง EventController.java สำหรับการแมป sortBy)
      sortBy: category === CATEGORY_FILTERS[0] ? "default" : 
              (category === "เรื่องเด่น" ? "popular" : 
              (category === "กิจกรรมใหม่" ? "new" : 
              (category === "ใกล้ปิดรับสมัคร" ? "closingSoon" : "default"))),
      startTime: startDate || undefined,
      endTime: endDate || undefined,
    };

    try {
      const results = await searchEvents(params); //
      setFetchedEvents(results); 
    } catch (err) {
      setApiError(err.message || "เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setIsLoading(false);
    }
  // ⭐️ [แก้ไข] เพิ่ม locationFilter ใน dependency array
  }, [searchTerm, category, type, unit, locationFilter, startDate, endDate]); 

  // --- ⭐️ [เพิ่ม] Ref สำหรับเช็กการโหลดครั้งแรก ---
  const isMounted = useRef(false);

  // --- ⭐️ [เพิ่ม] useEffect สำหรับค้นหาอัตโนมัติเมื่อ Filter (Dropdown/Date) เปลี่ยน ---
  useEffect(() => {
    if (isMounted.current) {
      handleSearch();
    }
  // ⭐️ [แก้ไข] เพิ่ม locationFilter ใน dependency array
  }, [category, type, unit, locationFilter, startDate, endDate, handleSearch]); 

  // --- ⭐️ [แก้ไข] useEffect สำหรับการโหลดครั้งแรก ---
  useEffect(() => {
    handleSearch();
    isMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run แค่ครั้งเดียวตอนโหลด

  // --- (ฟังก์ชันเดิม) ---
  const resetMenu = () => setOpenMenu(null);

  const onSelectCategory = (value) => {
    setCategory(value);
    resetMenu();
  };
  const onSelectType = (value) => {
    setType(value);
    resetMenu();
  };
  const onSelectUnit = (value) => {
    setUnit(value);
    resetMenu();
  };
  
  // ⭐️ [เพิ่มใหม่] Handler สำหรับ Location
  const onSelectLocation = (value) => {
    setLocationFilter(value);
    resetMenu();
  };

  const openEventDetail = (event) => {
    // ... (โค้ดเดิม)
    if (!event?.id) return;
    const target = `/events/${encodeURIComponent(event.id)}`;
    const url =
      typeof window !== "undefined"
        ? new URL(target, window.location.origin).toString()
        : target;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ⭐️ [แก้ไข] ฟังก์ชันล้างตัวกรอง (ให้ค้นหาทันที)
  const clearAllFilters = () => {
    setSearchTerm("");
    setCategory(CATEGORY_FILTERS[0]);
    setType(TYPE_FILTERS[0]);
    setUnit(UNIT_FILTERS[0]);
    setLocationFilter(LOCATION_FILTERS[0]); // ⭐️ เพิ่ม
    setStartDate("");
    setEndDate("");
    resetMenu();
    // ⭐️ (การ set state ข้างบนจะ trigger useEffect ให้ค้นหาอัตโนมัติ)
  };

  const goToSearch = (term = "") => {
    setSearchTerm(term || searchTerm);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: THEME.page, color: THEME.text }}
    >
      <Header
        auth={auth}
        navigate={navigate}
        onCalendarJump={() => navigate("/")}
        notifications={data.notifications}
        onSearch={goToSearch} 
        onActivities={() => navigate("/activities")}
        onRequireLogin={requireLogin}
      />
      <HeaderSpacer />

      <main className="flex-1 pb-20">
        <div className="mx-auto flex w-full max-w-8/10 flex-col gap-10 px-4 pt-10">
          <div className="rounded-[28px] border border-black/10 bg-white px-6 py-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">รายการกิจกรรม</h1>

              {/* ⭐️ [แก้ไข] onSubmit ให้เรียก handleSearch */}
              <form
                onSubmit={(event) => {
                  event.preventDefault(); // กันหน้า Reload
                  handleSearch(); // ⭐️ เรียก API Search
                }}
                className="flex w-full max-w-xl items-center rounded-full border border-black/10 bg-black/5 px-4 py-2 text-sm shadow-inner"
              >
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ค้นหากิจกรรมได้ที่นี่"
                  className="flex-1 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading} 
                  className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/80 disabled:bg-gray-400"
                  aria-label="ค้นหา"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="6" />
                    <path d="m20 20-3.6-3.6" />
                  </svg>
                </button>
              </form>
            </div>

            {/* ⭐️ ส่วนของตัวกรอง (Filters) */}
            <div className="mt-6 flex flex-col gap-3">
              <span className="text-sm font-medium text-gray-600">หมวดหมู่:</span>
              {/* ⭐️ แถว 1: Filters หลัก (เพิ่ม Location) */}
              <div className="flex flex-wrap gap-3 pb-2">
                <FilterChip
                  label={category} // SortBy
                  isActive={category !== CATEGORY_FILTERS[0]}
                  onClick={() => setOpenMenu(openMenu === "category" ? null : "category")}
                >
                  <DropdownList
                    open={openMenu === "category"}
                    items={CATEGORY_FILTERS}
                    onSelect={onSelectCategory}
                  />
                </FilterChip>

                <FilterChip
                  label={type} // Category
                  isActive={type !== TYPE_FILTERS[0]}
                  onClick={() => setOpenMenu(openMenu === "type" ? null : "type")}
                >
                  <DropdownList open={openMenu === "type"} items={TYPE_FILTERS} onSelect={onSelectType} />
                </FilterChip>

                <FilterChip
                  label={unit} // Organizer (สังกัด)
                  isActive={unit !== UNIT_FILTERS[0]}
                  onClick={() => setOpenMenu(openMenu === "unit" ? null : "unit")}
                >
                  <DropdownList open={openMenu === "unit"} items={UNIT_FILTERS} onSelect={onSelectUnit} />
                </FilterChip>
                
                {/* ⭐️ [เพิ่มใหม่] FilterChip สำหรับ Location (สถานที่) */}
                <FilterChip
                  label={locationFilter}
                  isActive={locationFilter !== LOCATION_FILTERS[0]}
                  onClick={() => setOpenMenu(openMenu === "location" ? null : "location")}
                >
                  <DropdownList
                    open={openMenu === "location"}
                    items={LOCATION_FILTERS}
                    onSelect={onSelectLocation}
                  />
                </FilterChip>

              </div>
              
              {/* ⭐️ แถว 2: Date Filters (เปลี่ยนเป็น type="date") */}
              <div className="flex flex-wrap items-center gap-3">
                 <input
                    type="date" // ⭐️ แก้ไข
                    placeholder="วันที่เริ่ม"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-full bg-black/5 px-4 py-2 text-sm text-gray-700 focus:outline-none hover:bg-black/10"
                    style={{ colorScheme: "light" }} 
                  />
                  <span className="text-sm text-gray-500">ถึง</span>
                  <input
                    type="date" // ⭐️ แก้ไข
                    placeholder="วันที่สิ้นสุด"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-full bg-black/5 px-4 py-2 text-sm text-gray-700 focus:outline-none hover:bg-black/10"
                    style={{ colorScheme: "light" }}
                  />

                {/* ⭐️ ปุ่มล้างตัวกรอง (อัปเดตเงื่อนไข) */}
                {(category !== CATEGORY_FILTERS[0] ||
                  type !== TYPE_FILTERS[0] ||
                  unit !== UNIT_FILTERS[0] ||
                  locationFilter !== LOCATION_FILTERS[0] || // ⭐️ เพิ่ม
                  startDate || endDate || searchTerm) && ( 
                  <button
                    type="button"
                    className="ml-auto whitespace-nowrap text-sm text-gray-500 underline-offset-4 hover:underline"
                    onClick={clearAllFilters} // ⭐️ เรียกฟังก์ชันล้างค่า
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ⭐️ แสดง Error (รวม Error จาก API และ Hook) */}
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {/* ⭐️ แสดง Loading */}
          {isLoading ? (
             <div className="col-span-full py-10 text-center text-sm text-gray-500">
               กำลังค้นหากิจกรรม...
             </div>
          ) : (
            /* ⭐️ แสดงผลลัพธ์ (ใช้ `events` ที่มาจาก Hook) */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-black/10 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
                  ไม่พบกิจกรรมที่สอดคล้องกับการค้นหา
                </div>
              ) : (
                events.map((event) => (
                  <EventCard
                    key={event.id}
                    e={{ ...event, liked: favoriteIds.has(event.id) || event.liked }}
                    loggedIn={auth.loggedIn}
                    onToggle={onToggleLike}
                    onRequireLogin={requireLogin}
                    onOpen={openEventDetail}
                  />
                ))
              )}
            </div>
          )}

        </div>
      </main>

      <Footer className="mt-auto" />
    </div>
  );
}
