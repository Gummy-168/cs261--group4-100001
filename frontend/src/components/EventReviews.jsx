import { useState, useEffect, useMemo } from "react";
import StarIcon from "./starIcon";
import { useState } from "react";
import { Star } from "lucide-react";

export default function EventReviews({ eventId, auth, scenario = "can-review" }) {
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [filter, setFilter] = useState("all");

useEffect(() => {
  let active = true;
  async function loadReviews() {
    try {
      const token = auth.token; // if your API needs auth
      const res = await fetch(`/api/events/${eventId}/reviews`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("โหลดรีวิวไม่สำเร็จ");
      const data = await res.json();
      // shape: [{ id, userId, userName, rating, date, content }, …]
      if (active) setReviews(data);
    } catch (err) {
      console.error(err);
    }
  }
  loadReviews();
  return () => {
    active = false;
  };
}, [eventId, auth.token]);


  const currentUserId = auth?.userId || auth?.profile?.id;
  const userHasReview = useMemo(
    () => reviews.some((r) => currentUserId && r.userId === currentUserId),
    [reviews, currentUserId]
  );
  const canReview = Boolean(auth?.loggedIn && !userHasReview);

  const { average, counts, total } = useMemo(() => {
    if (reviews.length === 0) {
      return {
        average: 0,
        counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        total: 0,
      };
    }
    const cnts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      cnts[r.rating] = (cnts[r.rating] || 0) + 1;
      sum += r.rating;
    });
    return { average: sum / reviews.length, counts: cnts, total: reviews.length };
  }, [reviews]);

  const filteredReviews =
    filter === "all"
      ? reviews
      : reviews.filter((r) => r.rating === parseInt(filter, 10));

async function onSubmit(event) {
  event.preventDefault();
  if (!canReview || !newRating || !newComment.trim()) return;
  try {
    const token = auth.token;
    const res = await fetch(`/api/events/${eventId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rating: newRating,
        content: newComment.trim(),
      }),
    });
    if (!res.ok) throw new Error("ไม่สามารถบันทึกรีวิวได้");
    const saved = await res.json();
    // Prepend the saved review to state
    setReviews((prev) => [saved, ...prev]);
    setNewRating(0);
    setNewComment("");
  } catch (err) {
    console.error(err);
    // Optionally show an error toast here
  }
}


  // Helper components
const RatingStars = ({ rating, className = "", size = 5 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const diff = rating - i + 1;
    let filled = false;
    let half = false;
    if (diff >= 1) filled = true;
    else if (diff > 0) half = true;
    stars.push(
      <StarIcon
        key={i}
        filled={filled || half}
        half={half}
        size={size}
      />
    );
  }
  return <span className={`inline-flex gap-1 ${className}`}>{stars}</span>;
};


const DistributionBars = () => {
  const max = Math.max(...Object.values(counts));
  return (
    <div
      className="flex flex-col gap-1 text-sm text-gray-500 ml-6 min-w-[12rem]"
    >
{[5, 4, 3, 2, 1].map((n) => {
  // Scale relative to the total number of reviews (not the max count)
  const percentage = total ? (counts[n] / total) * 100 : 0;
  return (
    <div key={n} className="flex items-center gap-2 h-3">
      <span className="w-2 text-right mr-1">{n}</span>
      <span className="text-xs">★</span>
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            percentage > 0 ? 'bg-[#f4b400]' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
})}
    </div>
  );
};


  const FilterButtons = () => (
    <div className="mt-4 flex gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => setFilter("all")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
          filter === "all"
            ? "bg-[#e84c3d] text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        ทั้งหมด
      </button>
      {[5, 4, 3, 2, 1].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setFilter(String(n))}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition border border-gray-300 ${
            filter === String(n)
              ? "bg-[#e84c3d] text-white border-[#e84c3d] shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {n}
          <span className="text-xs">★</span>
        </button>
      ))}
    </div>
  );

  const ReviewCard = ({ review }) => {
    const isOwner = currentUserId && review.userId === currentUserId;
    return (
      <article className="relative flex flex-col gap-2 rounded-2xl bg-gray-100 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-300" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {review.userName || "ผู้ใช้ไม่ทราบชื่อ"}
            </p>
            <div className="flex items-center gap-1 text-xs mt-0.5 text-gray-500">
              <RatingStars rating={review.rating} size="h-4 w-4"/>
              <span className="ml-2">
                {new Date(review.date).toLocaleDateString("th-TH")}
              </span>
            </div>
          </div>
          <div className="relative">
            <button type="button" className="p-1">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {isOwner && (
              <div className="absolute right-0 top-6 z-10 w-24 rounded-md border border-black/10 bg-white py-1 text-sm shadow-lg">
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    /* editing logic goes here */
                  }}
                >
                  แก้ไข
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-red-600"
                  onClick={() => {
                    setReviews((prev) => prev.filter((r) => r.id !== review.id));
                  }}
                >
                  ลบ
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {review.content}
        </p>
      </article>
    );
  };

  return (
    <section className="mt-12 flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-900">รีวิวทั้งหมด</h2>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        
      <div className="flex items-start gap-4">
        <span className="text-5xl font-extrabold text-gray-900">
          {average.toFixed(1)}
        </span>
        {/* Stars and label grouped together */}
        <div className="flex flex-col">
          <RatingStars rating={average} size={7} className="gap-2" />
          <span className="mt-1 text-xs text-gray-500">
            จากทั้งหมด {total} รีวิว
          </span>
        </div>
      </div>

        <DistributionBars />
      </div>
      {canReview && (
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4"
        >
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNewRating(n)}
                className="text-xl focus:outline-none"
              >
                <span
                  className={n <= newRating ? "text-[#f4b400]" : "text-gray-300"}
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="แสดงความคิดเห็นของคุณได้ที่นี่"
            className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e84c3d]"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-[#e84c3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c03428] disabled:opacity-50"
            disabled={!newRating || newComment.trim() === ""}
          >
            ส่ง
          </button>
        </form>
      )}
      <FilterButtons />
      {total === 0 ? (
        <div className="mt-8 flex justify-center">
          <div className="rounded-full bg-gray-100 px-6 py-4 text-gray-500 text-sm">
            ยังไม่มีการรีวิว
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}



export default function EventComment({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    onSubmit?.({ rating, comment });
    setRating(0);
    setComment("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-3 bg-gray-50 rounded-full px-3 py-1.5"
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`cursor-pointer transition-colors ${
              (hover || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
            }`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
          />
        ))}
      </div>

      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="แสดงความคิดเห็นของคุณได้ที่นี่"
        className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
      />

      <button
        type="submit"
        className="rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
      >
        ส่ง
      </button>
    </form>
  );
}
