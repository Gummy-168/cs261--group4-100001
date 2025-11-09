import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noti, setNoti] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ดึงข้อมูลแจ้งเตือนจาก backend
    fetch(`https://your-backend-api.com/notifications/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("ไม่พบข้อมูล");
        return res.json();
      })
      .then((data) => {
        setNoti(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-6">กำลังโหลดข้อมูล...</div>;
  if (!noti) return <div className="p-6">ไม่พบการแจ้งเตือนนี้</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button
        className="text-sm text-blue-600 mb-4"
        onClick={() => navigate("/home")}
      >
          กลับไปหน้าแรก
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="w-14 h-14 flex items-center justify-center rounded-full"
            style={{ background: noti.color }}
          >
            <span className="text-2xl">{noti.icon}</span>
          </span>
          <h2 className="text-xl font-bold">{noti.title}</h2>
        </div>
        <p className="text-gray-700">{noti.detail}</p>
      </div>
    </div>
  );
}