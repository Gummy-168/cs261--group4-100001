// src/Page/Staff_MyActivities.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import StaffHeader, { HeaderSpacer } from "../components/Staff_Header";
import StaffEventCard from "../components/Staff_EventCard";
import Footer from "../components/Footer";
import { THEME, FLAGS } from "../theme";

// ✅ jump utils (ใช้ได้ทั้ง user/staff)
import { navigateAndJump } from "../lib/jump";

// ---------- hooks & helpers ----------
function useOutsideClick(ref, onOutside) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside?.();
    };
    document.addEventListener("mousedown", handler, { passive: true });
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onOutside]);
}

function useDebouncedValue(value, ms = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

const SORTERS = {
  startDate: (a, b) => {
    const da = new Date(a.startTime || a.date || 0).getTime();
    const db = new Date(b.startTime || b.date || 0).getTime();
    return da - db; // ใกล้เริ่มก่อน
  },
  likes: (a, b) => {
    const la = a.likes ?? a.favoriteCount ?? 0;
    const lb = b.likes ?? b.favoriteCount ?? 0;
    return lb - la; // ถูกใจเยอะก่อน
  },
  recent: (a, b) => {
    const ta = new Date(a.updatedAt || a.createdAt || a.date || 0).getTime();
    const tb = new Date(b.updatedAt || b.createdAt || b.date || 0).getTime();
    return tb - ta; // ล่าสุดก่อน
  },
};

// ---------- UI primitives ----------
function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative inline-flex items-center gap-2" ref={ref}>
      <span className="text-gray-500 whitespace-nowrap text-xs md:text-sm">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-between rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs md:text-sm text-gray-800 shadow-sm hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#e84c3d]/30"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="mr-2 truncate max-w-[8rem] md:max-w-[10rem] text-left">{selected?.label}</span>
        <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-black/10 bg-white py-1 shadow-lg max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-sm transition ${active ? "bg-[#e84c3d]/10 text-[#e84c3d] font-semibold" : "text-gray-800 hover:bg-black/5"}`}
                role="option"
                aria-selected={active}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Page ----------
export default function StaffMyActivitiesPage({ navigate, auth, data, requireLogin }) {
  const safeData = data || { events: [], notifications: [] };
  const staffEvents = safeData.events || [];

  // search + filters
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 200);
  const [categoryFilter, setCategoryFilter] = useState("ทั้งหมด");
  const [sortKey, setSortKey] = useState("recent"); // recent | startDate | likes

  // category options (dynamic + "ทั้งหมด")
  const categoryOptions = useMemo(() => {
    const dynamic = new Set();
    staffEvents.forEach((e) => e?.category && dynamic.add(e.category));
    const raw = ["ทั้งหมด", ...Array.from(dynamic)];
    return raw.map((cat) => ({ value: cat, label: cat === "ทั้งหมด" ? "ทุกประเภท" : cat }));
  }, [staffEvents]);

  const sortOptions = [
    { value: "recent", label: "แก้ไขล่าสุด" },
    { value: "startDate", label: "วันเริ่มกิจกรรม" },
    { value: "likes", label: "จำนวนถูกใจ" },
  ];

  const openEventDetail = (event) => {
    if (!event?.id) return;
    navigate(`/staff/events/${encodeURIComponent(event.id)}`);
  };

  // ✅ ใช้ navigateAndJump เพื่อความเสถียร (แนบ hash + รอ DOM)
  const handleAddActivityJump = () => {
    navigateAndJump(navigate, "/staff", "staff-add-event", {
      offsetPx: FLAGS?.HEADER_HEIGHT_PX || 0,
      highlightMs: 900,
    });
  };

  // filter + sort (memoized)
  const filteredEvents = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    let list = staffEvents.filter(Boolean);

    if (term) {
      list = list.filter((e) => {
        const text = [e.title, e.description, e.location, e.category].filter(Boolean).join(" ").toLowerCase();
        return text.includes(term);
      });
    }

    if (categoryFilter !== "ทั้งหมด") {
      list = list.filter((e) => (e.category || "").toString() === categoryFilter);
    }

    const sorter = SORTERS[sortKey] || SORTERS.recent;
    list.sort(sorter);
    return list;
  }, [staffEvents, debouncedSearch, categoryFilter, sortKey]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: THEME.page, color: THEME.text }}>
      <StaffHeader
        auth={auth}
        navigate={navigate}
        notifications={safeData.notifications || []}
        onSearch={() => navigate("/staff/myActivities")}
        onActivities={() => navigate("/staff/myActivities")}
        onAddActivityJump={handleAddActivityJump}
        onRequireLogin={requireLogin}
      />
      <HeaderSpacer />

      <main className="flex-1 pb-20">
        <div className="mx-auto flex w-full max-w-8/10 flex-col gap-8 px-4 pt-10">
          {/* Header + search + filters */}
          <section className="rounded-[28px] border border-black/10 bg-white px-6 py-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">กิจกรรมของฉัน</h1>
                <p className="text-sm text-gray-600">
                  จัดการกิจกรรมที่คุณสร้างทั้งหมด ดูภาพรวม ปรับแก้รายละเอียด และจัดการกิจกรรมที่คุณสร้างในระบบ MeetMeet
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <div className="relative flex-1 max-w-xl">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="6" />
                    <path d="m20 20-3.6-3.6" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหากิจกรรมตามชื่อ คำอธิบาย หรือสถานที่..."
                  className="w-full rounded-full border border-black/10 bg-gray-50 px-9 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#e84c3d] focus:outline-none focus:ring-2 focus:ring-[#e84c3d]/30"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <FilterDropdown label="ประเภท" value={categoryFilter} options={categoryOptions} onChange={setCategoryFilter} />
                <FilterDropdown label="เรียงลำดับตาม" value={sortKey} options={sortOptions} onChange={setSortKey} />
              </div>
            </div>
          </section>

          {/* Cards */}
          {filteredEvents.length === 0 ? (
            <section className="rounded-[28px] border border-dashed border-black/10 bg-white px-6 py-12 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">ยังไม่มีกิจกรรมที่คุณสร้าง</h2>
              <p className="mt-3 text-sm text-gray-600">
                เริ่มเพิ่มกิจกรรมแรกของคุณจากหน้า Staff Home เพื่อให้นิสิตเข้ามาดูและเข้าร่วมได้เลย
              </p>
            </section>
          ) : (
            <section className="rounded-[28px] border border-black/10 bg-white px-6 py-8 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">ทั้งหมด {filteredEvents.length} กิจกรรมที่คุณสร้าง</h2>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                  <StaffEventCard
                    key={event.id}
                    e={event}
                    loggedIn={auth?.loggedIn}
                    onToggle={() => {}}
                    onRequireLogin={requireLogin}
                    onOpen={openEventDetail}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer className="mt-auto" />
    </div>
  );
}
