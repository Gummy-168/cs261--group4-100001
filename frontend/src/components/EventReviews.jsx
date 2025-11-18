import { useState, useEffect, useMemo, useCallback } from "react";
import StarIcon from "./starIcon";
import {
  getAllFeedbacks,
  submitFeedback,
  deleteFeedback as deleteFeedbackApi,
  getMyFeedback,
  getFeedbackStatistics,
} from "../services/feedbackService";

const EMPTY_DISTRIBUTION = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

const normalizeStatisticsDistribution = (distribution) => {
  const normalized = { ...EMPTY_DISTRIBUTION };
  if (!distribution || typeof distribution !== "object") {
    return normalized;
  }
  const keyMap = {
    5: ["5stars", "5star", "five", "5"],
    4: ["4stars", "4star", "four", "4"],
    3: ["3stars", "3star", "three", "3"],
    2: ["2stars", "2star", "two", "2"],
    1: ["1stars", "1star", "one", "1"],
  };
  Object.entries(keyMap).forEach(([rating, keys]) => {
    for (const key of keys) {
      if (distribution[key] != null) {
        const num = Number(distribution[key]);
        normalized[rating] = Number.isFinite(num) ? num : 0;
        return;
      }
    }
  });
  return normalized;
};

const buildDistributionFromReviews = (reviews = []) => {
  const distribution = { ...EMPTY_DISTRIBUTION };
  reviews.forEach((review) => {
    const rating = Number(review.rating) || 0;
    if (rating >= 1 && rating <= 5) {
      distribution[rating] = (distribution[rating] || 0) + 1;
    }
  });
  return distribution;
};

export default function EventReviews({ eventId, auth, scenario = "can-review" }) {
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState(() => ({
    status: auth?.loggedIn ? "checking" : "guest",
    message: "",
  }));

  const refreshReviews = useCallback(async () => {
    if (!eventId) {
      setReviews([]);
      setStatistics(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [list, stats] = await Promise.all([
        getAllFeedbacks(eventId),
        getFeedbackStatistics(eventId).catch((statsErr) => {
          console.error("Error fetching feedback statistics:", statsErr);
          return null;
        }),
      ]);
      const normalized = Array.isArray(list)
        ? list
        : Array.isArray(list?.feedbacks)
        ? list.feedbacks
        : [];
      setReviews(normalized);
      setStatistics(stats);
    } catch (err) {
      console.error(err);
      setError(err.message || "ไม่สามารถโหลดรีวิวได้");
      setReviews([]);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    refreshReviews();
  }, [refreshReviews]);

  const determineEligibility = useCallback(async () => {
    if (!eventId) return;
    if (!auth?.loggedIn) {
      setEligibility({ status: "guest", message: "" });
      return;
    }
    setEligibility({ status: "checking", message: "" });
    try {
      const feedback = await getMyFeedback(eventId);
      if (feedback) {
        setEligibility({ status: "has-review", feedback, message: "" });
      } else {
        setEligibility({ status: "allowed", message: "" });
      }
    } catch (err) {
      if (err?.code === 403) {
        setEligibility({
          status: "forbidden",
          message:
            err.message || "ท่านยังไม่มีสิทธิ์รีวิวกิจกรรมนี้ในขณะนี้",
        });
      } else {
        setEligibility({
          status: "error",
          message: err.message || "ไม่สามารถตรวจสอบสิทธิ์รีวิวได้",
        });
      }
    }
  }, [auth?.loggedIn, eventId]);

  useEffect(() => {
    determineEligibility();
  }, [determineEligibility]);

  const currentUserId =
    auth?.userId ||
    auth?.profile?.id ||
    (typeof window !== "undefined"
      ? Number(window.localStorage.getItem("userId"))
      : null);
  const currentUsername =
    auth?.profile?.username ||
    auth?.profile?.studentId ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("username")
      : null);
  const currentEmail =
    auth?.profile?.email ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("adminEmail")
      : null);

  const matchesCurrentUser = useCallback(
    (review) => {
      const reviewUserId = review.userId ?? review.userID ?? review.ownerId;
      if (
        reviewUserId != null &&
        currentUserId != null &&
        String(reviewUserId) === String(currentUserId)
      ) {
        return true;
      }
      const reviewUsername = (
        review.username ||
        review.userName ||
        review.ownerUsername ||
        ""
      )
        .toString()
        .toLowerCase();
      if (
        reviewUsername &&
        currentUsername &&
        reviewUsername === currentUsername.toString().toLowerCase()
      ) {
        return true;
      }
      const reviewEmail = (review.email || review.userEmail || "")
        .toString()
        .toLowerCase();
      if (
        reviewEmail &&
        currentEmail &&
        reviewEmail === currentEmail.toString().toLowerCase()
      ) {
        return true;
      }
      return false;
    },
    [currentUserId, currentUsername, currentEmail]
  );

  const hasExistingReview = eligibility.status === "has-review";
  const userHasReview = useMemo(
    () => hasExistingReview || reviews.some((r) => matchesCurrentUser(r)),
    [reviews, matchesCurrentUser, hasExistingReview]
  );
  const canReview = eligibility.status === "allowed";

  const { average, counts, total } = useMemo(() => {
    if (statistics) {
      const parsedAverage =
        typeof statistics.averageRating === "number"
          ? statistics.averageRating
          : parseFloat(statistics.averageRating);
      const totalCount =
        typeof statistics.totalFeedbacks === "number"
          ? statistics.totalFeedbacks
          : statistics.totalFeedbacks != null
          ? Number(statistics.totalFeedbacks)
          : statistics.count != null
          ? Number(statistics.count)
          : null;
      return {
        average: Number.isFinite(parsedAverage) ? parsedAverage : 0,
        counts: normalizeStatisticsDistribution(statistics.distribution),
        total:
          Number.isFinite(totalCount) && totalCount !== null
            ? totalCount
            : reviews.length,
      };
    }
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return { average: 0, counts: { ...EMPTY_DISTRIBUTION }, total: 0 };
    }
    const sum = reviews.reduce((acc, review) => acc + (Number(review.rating) || 0), 0);
    return {
      average: reviews.length ? sum / reviews.length : 0,
      counts: buildDistributionFromReviews(reviews),
      total: reviews.length,
    };
  }, [reviews, statistics]);

  const filteredReviews =
    filter === "all"
      ? reviews
      : reviews.filter((r) => Number(r.rating) === parseInt(filter, 10));

  async function onSubmit(event) {
    event.preventDefault();
    if (!canReview || !newRating || newComment.trim().length < 10) return;
    try {
      setSubmitting(true);
      await submitFeedback(eventId, {
        rating: newRating,
        comment: newComment.trim(),
      });
      setNewRating(0);
      setNewComment("");
      await refreshReviews();
      await determineEligibility();
    } catch (err) {
      console.error(err);
      setError(err.message || "ไม่สามารถบันทึกรีวิวได้");
    } finally {
      setSubmitting(false);
    }
  }

  const deleteOwnReview = useCallback(
    async () => {
      if (!window.confirm("ต้องการลบรีวิวของคุณหรือไม่?")) return;
      try {
        setSubmitting(true);
        await deleteFeedbackApi(eventId);
        await refreshReviews();
        await determineEligibility();
      } catch (err) {
        console.error(err);
        setError(err.message || "ไม่สามารถลบรีวิวได้");
      } finally {
        setSubmitting(false);
      }
    },
    [eventId, refreshReviews, determineEligibility]
  );


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
  return (
    <div className="flex flex-col gap-1 text-sm text-gray-500 ml-6 min-w-[12rem]">
      {[5, 4, 3, 2, 1].map((n) => {
        const value = counts?.[n] ?? 0;
        const percentage = total ? (value / total) * 100 : 0;
        return (
          <div key={n} className="flex items-center gap-2 h-3">
            <span className="w-2 text-right mr-1">{n}</span>
            <span className="text-xs">★</span>
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  percentage > 0 ? "bg-[#f4b400]" : ""
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
    const isOwner = matchesCurrentUser(review);
    const displayName =
      review.userName ||
      review.username ||
      review.ownerName ||
      review.email ||
      "ผู้ใช้ไม่ทราบชื่อ";
    const reviewDate =
      review.date || review.createdAt || review.updatedAt || Date.now();
    const content = review.content ?? review.comment ?? "";
    return (
      <article className="relative flex flex-col gap-2 rounded-2xl bg-gray-100 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-300" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {displayName}
            </p>
            <div className="flex items-center gap-1 text-xs mt-0.5 text-gray-500">
              <RatingStars rating={Number(review.rating) || 0} size={3} />
              <span className="ml-2">
                {new Date(reviewDate).toLocaleDateString("th-TH")}
              </span>
            </div>
          </div>
          {isOwner && (
            <button
              type="button"
              onClick={deleteOwnReview}
              disabled={submitting}
              className={`rounded-full border border-red-100 px-3 py-1 text-xs font-medium text-red-600 transition ${
                submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50"
              }`}
            >
              ลบรีวิว
            </button>
          )}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {content || "—"}
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
          <RatingStars rating={average} size={5} className="gap-2" />
          <span className="mt-1 text-xs text-gray-500">
            จากทั้งหมด {total} รีวิว
          </span>
        </div>
      </div>

        <DistributionBars />
      </div>
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {loading && (
        <p className="text-sm text-gray-500">กำลังโหลดรีวิว...</p>
      )}
      {eligibility.status === "checking" && auth?.loggedIn && (
        <p className="text-sm text-gray-500">กำลังตรวจสอบสิทธิ์ในการรีวิว...</p>
      )}
      {eligibility.status === "guest" && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          กรุณาเข้าสู่ระบบเพื่อเขียนรีวิวกิจกรรมนี้
        </div>
      )}
      {eligibility.status === "forbidden" && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {eligibility.message || "คุณยังไม่สามารถรีวิวกิจกรรมนี้ได้ในขณะนี้"}
        </div>
      )}
      {eligibility.status === "has-review" && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          คุณได้เขียนรีวิวแล้ว หากต้องการแก้ไขสามารถลบรีวิวเดิมแล้วส่งใหม่อีกครั้ง
        </div>
      )}
        {canReview && (
          <form
            onSubmit={onSubmit}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 px-5 py-3"
          >
            <span className="text-sm font-medium text-gray-700 shrink-0">
              รีวิวได้ที่นี่เลย!
            </span>
            {/* Star rating inline */}
            <div className="flex items-center gap-1 shrink-0">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => !submitting && setNewRating(n)}
                  className={`text-xl focus:outline-none transition-transform hover:scale-110 ${
                    submitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={submitting}
                  aria-label={`ให้คะแนน ${n} ดาว`}
                >
                  <span className={n <= newRating ? "text-[#f4b400]" : "text-gray-300"}>
                    ★
                  </span>
                </button>
              ))}
            </div>

            {/* Label text */}

            {/* Single-line input */}
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (newRating && newComment.trim().length >= 10) {
                    onSubmit(e);
                  }
                }
              }}
              placeholder="เขียนรีวิวของคุณที่นี่... (อย่างน้อย 10 ตัวอักษร)"
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e84c3d] focus:border-transparent"
              disabled={submitting}
            />

            {/* Send button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[#e84c3d] p-2.5 text-white shadow-sm transition hover:bg-[#c03428] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              disabled={!newRating || newComment.trim().length < 10 || submitting}
              aria-label="ส่งรีวิว"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
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
          {filteredReviews.map((review, idx) => (
            <ReviewCard key={review.id ?? `${review.username ?? "review"}-${idx}`} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
