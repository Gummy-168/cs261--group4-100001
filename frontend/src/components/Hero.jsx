import { useEffect, useMemo, useRef, useState } from "react";
import { FLAGS } from "../theme";

export default function Hero({
  images = [],
  fallbackSrc = "/hero/fallback.jpg",
  headline = "ยินดีต้อนรับสู่แหล่งรวมกิจกรรมต่างๆของมหาวิทยาลัยธรรมศาสตร์",
  tagline = "งานกิจกรรมเด่นประจำสัปดาห์",
  period = "",
}) {
  const slides = useMemo(() => {
    if (images?.length) return images;
    return [{ id: "fallback", src: fallbackSrc, href: "#", alt: "กิจกรรมเด่น" }];
  }, [images, fallbackSrc]);

  const [index, setIndex] = useState(0);
  const [introVisible, setIntroVisible] = useState(false);
  const paused = useRef(false);
  const touchStartX = useRef(null);

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

  return (
    <section
      className="relative w-full overflow-hidden bg-black text-white shadow-lg"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
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
    </section>
  );
}
