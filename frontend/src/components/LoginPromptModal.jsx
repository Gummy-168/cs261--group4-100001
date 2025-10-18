import { useEffect } from "react";

export default function LoginPromptModal({ open, onClose, onConfirm }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const stop = (event) => event.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={stop}
      >
        <div className="flex items-start justify-between bg-[#f6c556] px-6 py-7">
          <div className="text-m font-semibold text-black/70">ต้องเข้าสู่ระบบ</div>
          <button
            type="button"
            aria-label="ปิดหน้าต่าง"
            className="text-black/100 hover:text-red-500 transition"
            onClick={onClose}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2" // ความหนา
            >
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-8 py-9 text-center space-y-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-black/10 text-gray-700">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="5" y="11" width="14" height="10" rx="3" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="text-[15px] leading-relaxed text-gray-800">
            กรุณาเข้าสู่ระบบเพื่อใช้งานฟังก์ชันนี้
          </p>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-full bg-[#e84c3d] py-3 text-base font-semibold text-white shadow hover:bg-[#d13b2d] transition-colors"
            onClick={onConfirm}
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
