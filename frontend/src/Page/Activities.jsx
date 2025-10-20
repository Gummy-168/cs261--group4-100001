import { useMemo, useState } from "react";
import Header, { HeaderSpacer } from "../components/Header";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import { THEME } from "../theme";
import useEventFavorites from "../hooks/useEventFavorites";

const CATEGORY_FILTERS = ["เรียงลำดับ", "เรื่องเด่น", "กิจกรรมใหม่", "ใกล้ปิดรับสมัคร"];
const TYPE_FILTERS = ["ประเภท", "วิชาการ", "บันเทิง", "กีฬา", "อาสา", "พัฒนาตน"];
const UNIT_FILTERS = [
  "สังกัด",
  "คณะวิศวกรรมศาสตร์",
  "คณะศิลปศาสตร์",
  "คณะวิทยาศาสตร์",
  "คณะสังคมศาสตร์",
  "ชมรม",
  "Test",
  "Test2",
  "Test3",
  "Test4",
  "Test5",
];

function FilterChip({ label, isActive, onClick, children }) {
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
  if (!open) return null;
  return (
    <div className="absolute left-1/2 top-full z-30 mt-2 w-48 -translate-x-1/2 rounded-2xl border border-black/10 bg-white shadow-lg">
      <ul className="max-h-60 overflow-y-auto py-2 text-sm text-gray-700">
        {items.map((item) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="flex w-full px-4 py-2 text-left hover:bg-black/5"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ActivitiesPage({ navigate, auth, data, requireLogin }) {
  const { events, error, onToggleLike, favoriteIds } = useEventFavorites(data, auth, requireLogin);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState(CATEGORY_FILTERS[0]);
  const [type, setType] = useState(TYPE_FILTERS[0]);
  const [unit, setUnit] = useState(UNIT_FILTERS[0]);
  const [openMenu, setOpenMenu] = useState(null);

  const goToSearch = (term = "") => {
    // ไม่ต้อง navigate แค่เซ็ต searchTerm
    setSearchTerm(term || searchTerm);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const termMatch =
        !searchTerm ||
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.host?.toLowerCase().includes(searchTerm.toLowerCase());

      const categoryMatch = category === CATEGORY_FILTERS[0] || event.category === category;
      const typeMatch = type === TYPE_FILTERS[0] || event.type === type;
      const unitMatch = unit === UNIT_FILTERS[0] || event.unit === unit;

      return termMatch && categoryMatch && typeMatch && unitMatch;
    });
  }, [events, searchTerm, category, type, unit]);

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

  const openEventDetail = (event) => {
    if (!event?.id) return;
    const target = `/events/${encodeURIComponent(event.id)}`;
    const url =
      typeof window !== "undefined"
        ? new URL(target, window.location.origin).toString()
        : target;
    window.open(url, "_blank", "noopener,noreferrer");
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

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  goToSearch(searchTerm);
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
                  className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/80"
                  aria-label="ค้นหา"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="6" />
                    <path d="m20 20-3.6-3.6" />
                  </svg>
                </button>
              </form>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
              <span className="text-sm font-medium text-gray-600">หมวดหมู่:</span>
              <div className="flex gap-3 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
                <FilterChip
                  label={category}
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
                  label={type}
                  isActive={type !== TYPE_FILTERS[0]}
                  onClick={() => setOpenMenu(openMenu === "type" ? null : "type")}
                >
                  <DropdownList open={openMenu === "type"} items={TYPE_FILTERS} onSelect={onSelectType} />
                </FilterChip>

                <FilterChip
                  label={unit}
                  isActive={unit !== UNIT_FILTERS[0]}
                  onClick={() => setOpenMenu(openMenu === "unit" ? null : "unit")}
                >
                  <DropdownList open={openMenu === "unit"} items={UNIT_FILTERS} onSelect={onSelectUnit} />
                </FilterChip>

                {(category !== CATEGORY_FILTERS[0] ||
                  type !== TYPE_FILTERS[0] ||
                  unit !== UNIT_FILTERS[0]) && (
                  <button
                    type="button"
                    className="ml-2 whitespace-nowrap text-sm text-gray-500 underline-offset-4 hover:underline"
                    onClick={() => {
                      setCategory(CATEGORY_FILTERS[0]);
                      setType(TYPE_FILTERS[0]);
                      setUnit(UNIT_FILTERS[0]);
                      resetMenu();
                    }}
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                )}
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-black/10 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
                ไม่พบกิจกรรมที่สอดคล้องกับการค้นหา
              </div>
            ) : (
              filteredEvents.map((event) => (
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
        </div>
      </main>

      <Footer className="mt-auto" />
    </div>
  );
}
