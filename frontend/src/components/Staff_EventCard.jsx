import { useMemo, useState } from "react";
import StaffConfirmPopup from "./Staff_ConfirmPopup";
import { deleteEvent } from "../services/eventService";
import toast from "react-hot-toast";
import ProtectedImage from "./ProtectedImage";

export default function StaffEventCard({
  e,
  loggedIn,
  onToggle,
  onRequireLogin,
  onOpen,
  onDelete, // callback ลบจาก parent (optional)
}) {
  const detailHref = `/staff/events/${e.id}`;
  const readerHref = `/staff/events/${e.id}/reader`;
  const editHref = `/staff/events/${e.id}/edit`;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // วันที่กิจกรรม
  const formattedDate = useMemo(() => {
    if (!e.date) return "";
    try {
      return new Date(e.date).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, [e.date]);

  // วันที่แก้ไขล่าสุด (ถ้ามี)
  const formattedUpdatedAt = useMemo(() => {
    if (!e.updatedAt) return "";
    try {
      return new Date(e.updatedAt).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, [e.updatedAt]);

  const onNavigate = () => {
    if (onOpen) {
      onOpen(e);
      return;
    }
    // ไปหน้า staff event detail ในแท็บเดิม
    window.location.href = detailHref;
  };

  // สถิติ
  const views = e.views ?? e.viewCount ?? "-";
  const likes = e.likes ?? e.favoriteCount ?? "-";
  const reviews = e.reviews ?? e.reviewCount ?? "-";
  const score = e.score ?? e.rating ?? "-";

  // ทำจริงตอนยืนยันลบ
  const handleConfirmDelete = async () => {
    setDeleting(true);
    
    try {
      // เรียก API ลบจริง
      await deleteEvent(e.id);
      
      toast.success('ลบกิจกรรมสำเร็จ!');
      setDeleteOpen(false);
      
      // ถ้ามี callback จาก parent ให้เรียก
      if (onDelete) {
        onDelete(e);
      } else {
        // ถ้าไม่มี callback ให้ reload หน้า
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'ไม่สามารถลบกิจกรรมได้');
      setDeleting(false);
    }
  };

  const imagePlaceholder = (
    <div className="flex h-full w-full flex-col items-center justify-center text-gray-500 text-sm">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-400">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M7 13l3-3 3 4 2-2 3 4" />
          <circle cx="9" cy="8" r="1" />
        </svg>
      </div>
      <p>ภาพโปรโมตกิจกรรม</p>
      <p className="text-xs mt-1 text-gray-400">ขนาด 5:3</p>
    </div>
  );

  return (
    <>
      <article
        onClick={onNavigate}
        className="group h-full cursor-pointer rounded-[24px] border border-black/5 bg-white shadow-[0_16px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_38px_rgba(15,23,42,0.12)] overflow-hidden"
      >
        <div className="flex flex-col md:flex-row w-full">
          {/* ฝั่งซ้าย: รูป + รายละเอียดหลัก */}
          <div className="flex-1 px-6 py-5 flex flex-col">
            {/* กล่องรูป 5:3 */}
            <div className="rounded-2xl bg-gray-100 overflow-hidden mb-5">
              <div className="aspect-[5/3] w-full flex items-center justify-center">
                <ProtectedImage
                  src={e.imageUrl}
                  alt={e.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  fallback={imagePlaceholder}
                />
              </div>
            </div>

            {/* ชื่อกิจกรรม + หมวดหมู่ */}
            <div>
              <h3 className="text-base md:text-lg font-semibold leading-snug text-gray-900 line-clamp-2">
                {e.title}
              </h3>
              {e.category && (
                <p className="mt-1 text-xs font-medium text-gray-500">
                  {e.category}
                </p>
              )}
            </div>

            {/* แถวล่าง: แก้ไขล่าสุด + โพสต์เมื่อ */}
            <div className="mt-4 flex flex-wrap items-center justify-between text-[11px] md:text-xs text-gray-500 gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                <span>
                  แก้ไขล่าสุด{" "}
                  {formattedUpdatedAt || formattedDate || "-"}
                </span>
              </div>
              {formattedDate && <span>โพสต์เมื่อ {formattedDate}</span>}
            </div>
          </div>

          {/* ฝั่งขวา: ภาพรวม + ปุ่ม */}
          <div className="w-full md:w-60 border-t md:border-t-0 md:border-l border-black/5 bg-[#fafafa] px-6 py-5 flex flex-col justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900 text-center md:text-left">
                ภาพรวม
              </p>
              <dl className="mt-4 space-y-1 text-xs md:text-sm text-gray-700">
                <div className="flex justify-between">
                  <dt>จำนวนเข้าชม</dt>
                  <dd>{views}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>การกดถูกใจ</dt>
                  <dd>{likes}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>จำนวนรีวิว</dt>
                  <dd>{reviews}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>คะแนน</dt>
                  <dd>{score}</dd>
                </div>
              </dl>
            </div>

            {/* ปุ่มด้านล่าง */}
            <div className="mt-6 flex flex-col gap-2">
              {/* มุมมองผู้อ่าน (ลิงก์ - รองรับ middle click / Ctrl+click) */}
              <a
                href={readerHref}
                onClick={(ev) => {
                  // กันไม่ให้ไปติด onClick ของ article
                  ev.stopPropagation();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs md:text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-100 transition"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z" />
                  </svg>
                </span>
                มุมมองผู้อ่าน
              </a>

              {/* แก้ไขกิจกรรม (ลิงก์) */}
              <a
                href={editHref}
                onClick={(ev) => {
                  ev.stopPropagation();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs md:text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-100 transition"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M4 20h4L20 8l-4-4L4 16v4z" />
                  </svg>
                </span>
                แก้ไขกิจกรรม
              </a>

              {/* ลบกิจกรรม + popup ยืนยัน (ยังเป็น button เพราะเป็น action ในหน้า) */}
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setDeleteOpen(true); // เปิด popup
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e84c3d] px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-[#d63a2b] transition"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6v14h8V6" />
                    <path d="M10 10v6M14 10v6" />
                    <path d="M5 6l1-2h12l1 2" />
                  </svg>
                </span>
                ลบกิจกรรม
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* popup ยืนยันลบ */}
      <StaffConfirmPopup
        open={deleteOpen}
        title="คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้"
        message="หากยืนยัน กิจกรรมและข้อมูลที่เกี่ยวข้องจะถูกลบออกจากระบบ และไม่สามารถกู้คืนได้"
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
