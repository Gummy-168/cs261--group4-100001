import React from 'react';

export default function EventGrid({ events, onToggleFavorite }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border border-gray-200 rounded-lg shadow-xs dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      {events.map((e) => (
        <article
          key={e.id}
          className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800 cursor-pointer relative"
          onClick={() => window.open(`/events/${e.id}`, '_blank')}
        >
          <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-500 text-sm dark:bg-gray-700">
            {e.coverUrl ? (
              <img src={e.coverUrl} alt={e.title} className="w-full h-full object-cover rounded-t-lg" />
            ) : (
              <span>ภาพไม่มีการจัดแสดงของอีเวนต์นี้</span>
            )}
          </div>

          {/* ปุ่มหัวใจ */}
          <button
            onClick={(ev) => {
              ev.stopPropagation();
              onToggleFavorite?.(e.id);
            }}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow"
            aria-label="favorite"
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-5 h-5 ${e.liked ? 'fill-red-500' : 'fill-none'}`}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 21s-7-4.35-9.5-7.5C.5 10 2.5 6 6 6c2 0 3.5 1 4.5 2 1-1 2.5-2 4.5-2 3.5 0 5.5 4 3.5 7.5S12 21 12 21z" />
            </svg>
          </button>

          <div className="p-4 text-sm">
            <h3 className="font-semibold line-clamp-2 min-h-[2.4em]">{e.title}</h3>
            <p className="text-gray-600 mt-1">{e.description}</p>
            <p className="text-gray-500 mt-1 text-xs">{new Date(e.date).toLocaleDateString('th-TH')}</p>
          </div>
        </article>
      ))}
    </div>
  );
}