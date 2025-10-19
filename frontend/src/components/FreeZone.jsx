export default function FreeZoneSection({
  title = "Free Zone",
  description = "พื้นที่สำหรับกิจกรรมพิเศษและโปรโมชั่นต่างๆ",
  className = "",
}) {
  return (
    <section
      className={`rounded-[28px] border border-black/5 bg-white py-16 text-center shadow-sm ${className}`}
    >
      <h2 className="text-3xl font-semibold tracking-tight text-gray-900">{title}</h2>
      <p className="mt-4 text-base text-gray-600">{description}</p>
    </section>
  );
}
