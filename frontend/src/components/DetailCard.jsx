import React from 'react';

export default function EventDetail({ event }) {
  const {
    title,
    organizer,
    date,
    time,
    location,
    category,
    description,
    imageUrl,
    website
  } = event;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 text-sm rounded-md mb-4">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-md" />
        ) : (
          <span>ภาพไม่มีการจัดแสดงของอีเวนต์นี้</span>
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-1">ผู้จัด: {organizer}</p>
      <p className="text-gray-700 dark:text-gray-300 mb-1">วันที่: {date}</p>
      <p className="text-gray-700 dark:text-gray-300 mb-1">เวลา: {time}</p>
      <p className="text-gray-700 dark:text-gray-300 mb-1">สถานที่: {location}</p>
      <p className="text-gray-700 dark:text-gray-300 mb-4">หมวดหมู่: {category}</p>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-gray-600 dark:text-gray-400 mb-6">
        <h2 className="text-lg font-semibold mb-2">รายละเอียดกิจกรรม</h2>
        <p>{description}</p>
      </div>

      <div className="flex gap-4">
        <button className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-md">
          บันทึกกิจกรรม
        </button>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md">
          แชร์กิจกรรม
        </button>
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(location)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md"
        >
          ดูแผนที่
        </a>
      </div>

      {website && (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          เว็บไซต์กิจกรรม: <a href={website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{website}</a>
        </p>
      )}
    </div>
  );
}