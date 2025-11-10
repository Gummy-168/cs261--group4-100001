// src/components/Staff_ConfirmPopup.jsx
import React from "react";

export default function StaffConfirmPopup({
  open,
  title = "แจ้งเตือน",
  message = "คุณแน่ใจหรือไม่ที่จะทำรายการนี้",
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const handleClose = () => {
    onCancel?.();
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* แถบเหลืองบนสุด + ปุ่ม X */}
        <div className="relative h-10 bg-[#f7d24c]">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:scale-110 transition"
            aria-label="ปิด"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* เนื้อหา */}
        <div className="px-8 pb-7 pt-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.29 3.86 2.82 18a1.5 1.5 0 0 0 1.32 2.2h15.72a1.5 1.5 0 0 0 1.32-2.2L13.71 3.86a1.5 1.5 0 0 0-2.42 0z" />
            </svg>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-700">{message}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex min-w-[120px] items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.08)] border border-black/10 hover:bg-gray-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => onConfirm?.()}
              className="inline-flex min-w-[120px] items-center justify-center rounded-full bg-[#e84c3d] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:bg-[#d63a2b]"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
