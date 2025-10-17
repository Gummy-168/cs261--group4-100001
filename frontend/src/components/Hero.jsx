import { useEffect, useMemo, useRef, useState } from "react";
import { FLAGS, THEME } from "../theme";

export default function Hero({ images = [], fallbackSrc = "/hero/fallback.jpg" }) {
  const seq = useMemo(
    () => (images?.length ? images : [{ id: "fallback", src: fallbackSrc, href: "#", alt: "fallback" }]),
    [images, fallbackSrc]
  );
  const [idx, setIdx] = useState(0);
  const pausedRef = useRef(false);
  const touchX = useRef(null);

  useEffect(() => {
    const t = setInterval(() => { if (!pausedRef.current) setIdx(i => (i + 1) % seq.length); }, FLAGS.HERO_AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [seq.length]);

  const go = (href) => { if (href?.startsWith("/events/")) window.open(href, "_blank"); };
  const prev = () => setIdx(i => (i - 1 + seq.length) % seq.length);
  const next = () => setIdx(i => (i + 1) % seq.length);

  return (
    <section
      className={`relative mx-auto max-w-6xl ${FLAGS.HERO_ASPECT} overflow-hidden rounded-2xl`}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 40) (dx > 0 ? prev() : next()); touchX.current = null; }}
    >
      <button className="absolute inset-0 w-full h-full text-left" onClick={() => go(seq[idx].href)}>
        <div className="absolute inset-0">
          {/* <img src={seq[idx].src} alt={seq[idx].alt} className="w-full h-full object-cover" /> */}
          <div className="w-full h-full bg-black" />
        </div>
        <div className="absolute inset-0" style={{ background: THEME.bannerStages[idx % THEME.bannerStages.length] }} />
        <div className="absolute inset-x-0 top-10 text-center text-white">
          <h2 className="text-lg md:text-2xl font-semibold drop-shadow">
            ยินดีต้อนรับสู่แหล่งรวมกิจกรรมของมหาวิทยาลัย
          </h2>
        </div>
      </button>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3">
        <button className="pointer-events-auto rounded-full bg-white/80 px-3 py-1 text-sm" onClick={prev}>‹</button>
        <button className="pointer-events-auto rounded-full bg-white/80 px-3 py-1 text-sm" onClick={next}>›</button>
      </div>
    </section>
  );
}
