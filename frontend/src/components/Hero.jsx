import { useEffect, useMemo, useRef, useState } from "react";
import { FLAGS } from "../theme";

export default function Hero({
  images = [],
  fallbackSrc = "/hero/fallback.jpg",
  headline = "ยินดีต้อนรับสู่แหล่งรวมกิจกรรมต่างๆของมหาวิทยาลัยธรรมศาสตร์",
  tagline = "งานกิจกรรมเด่นประจำสัปดาห์",
  period = "",
  onSearch,
}) {
  const slides = useMemo(() => {
    if (images?.length) return images;
    return [{ id: "fallback", src: fallbackSrc, href: "#", alt: "กิจกรรมเด่น" }];
  }, [images, fallbackSrc]);

  const [index, setIndex] = useState(0);
  const [introVisible, setIntroVisible] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const paused = useRef(false);
  const touchStartX = useRef(null);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroVisible(true), 40);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      if (!paused.current) {
        setIndex((prev) => (prev + 1) % slides.length);
      }
    }, FLAGS.HERO_AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 160);
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setSearchValue("");
      }
    };
    const handleClick = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchOpen(false);
        setSearchValue("");
      }
    };
    window.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
      window.clearTimeout(focusTimer);
    };
  }, [searchOpen]);

  useEffect(() => {
    paused.current = searchOpen;
  }, [searchOpen]);

  const goTo = (href) => {
    if (!href) return;
    if (href.startsWith("/")) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = href;
    }
  };

  const prev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const next = () => setIndex((prev) => (prev + 1) % slides.length);

  const active = slides[index] ?? slides[0];
  const showIntro = index === 0;

  const toggleSearch = () => {
    setSearchOpen((prev) => {
      if (prev) {
        setSearchValue("");
      }
      return !prev;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    if (query) {
      onSearch?.(query);
      setSearchOpen(false);
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-black text-white shadow-lg"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { if (!searchOpen) paused.current = false; }}
      onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
      onTouchEnd={(event) => {
        if (touchStartX.current == null) return;
        const delta = event.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 40) (delta > 0 ? prev() : next());
        touchStartX.current = null;
      }}
    >
      <button
        type="button"
        className="relative block h-full w-full focus:outline-none"
        onClick={() => goTo(active?.href)}
      >
        <div className="relative w-full">
          <div className="aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/8]">
            <img
              src={active?.src ?? fallbackSrc}
              alt={active?.alt ?? headline}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/40" />
          </div>
        </div>

        {showIntro && (
          <div
            className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-all duration-700 ease-out ${
              introVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
            }`}
          >
            {tagline ? (
              <p className="text-[13px] uppercase tracking-[0.28em] text-white/80 md:text-sm">
                {tagline}
              </p>
            ) : null}
            {headline ? (
              <h2 className="mt-4 text-2xl font-semibold leading-snug md:text-3xl lg:text-4xl">
                {headline}
              </h2>
            ) : null}
            {period ? (
              <p className="mt-6 text-base font-medium text-white/80 md:text-lg">
                {period}
              </p>
            ) : null}
          </div>
        )}
      </button>

      {slides.length > 1 && (
        <>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
            <button
              type="button"
              aria-label="ก่อนหน้า"
              className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black transition hover:bg-white"
              onClick={prev}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M15 6 9 12l6 6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="ถัดไป"
              className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black transition hover:bg-white"
              onClick={next}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            {slides.map((slide, idx) => (
              <span
                key={slide.id ?? idx}
                aria-hidden
                className={`h-[6px] rounded-full transition-all ${idx === index ? "w-8 bg-white" : "w-2.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}

      <div className="pointer-events-none absolute right-3 top-3 md:right-6 md:top-6">
        <div
          ref={searchContainerRef}
          className={`pointer-events-auto flex h-12 items-center rounded-2xl bg-white text-gray-800 shadow-lg hover:shadow-xl ${
            searchOpen ? "pl-3 pr-3 gap-3" : "justify-center"
          }`}
          style={{
            width: searchOpen ? "min(90vw, 520px)" : "3rem",
            transition: "width 480ms cubic-bezier(0.22, 0.61, 0.36, 1), padding 480ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 240ms ease",
          }}
        >
          <button
            type="button"
            onClick={toggleSearch}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ease-out hover:bg-black/5"
            aria-label={searchOpen ? "ปิดช่องค้นหา" : "เปิดช่องค้นหา"}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="6" />
              <path d="m20 20-3.6-3.6" />
            </svg>
          </button>

          {searchOpen && (
            <>
              <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2 pl-1">
                <input
                  ref={inputRef}
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="ค้นหากิจกรรม..."
                  className="flex-1 border-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white transition-all duration-300 ease-out hover:bg-black/80"
                >
                  ค้นหา
                </button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchValue("");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-gray-500 transition-all duration-300 ease-out hover:bg-black/10"
                aria-label="ปิดช่องค้นหา"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </>
          )}
        </div>
        {searchOpen && (
          <div className="pointer-events-none mt-2 text-right text-xs text-white/70 md:text-sm">
            กด Enter เพื่อค้นหา หรือ Esc เพื่อปิด
          </div>
        )}
      </div>
    </section>
  );
}
