export default function StarIcon({ filled = false, half = false, size = 5 }) {
  const sizeClass = `h-${size} w-${size}`;
  const fillColor = filled || half ? "#f4b400" : "none";
  const strokeColor = "#f4b400";

  return (
    <span className={`relative inline-block overflow-hidden ${sizeClass}`}>
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.5"
      >
        <path d="M12 .587l3.668 7.431 8.198 1.182-5.938 5.797 1.404 8.186L12 18.896l-7.332 3.861 1.404-8.186-5.938-5.797 8.198-1.182z" />
      </svg>
        {half && (
        <span
            className="absolute inset-0 text-gray-300"
            // Clip the overlay to the right half of the star only
            style={{ clipPath: "inset(0 0 0 50%)" }}
        >
            <svg
            viewBox="0 0 24 24"
            className="h-full w-full"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            >
            <path d="M12 .587l3.668 7.431 8.198 1.182-5.938 5.797 1.404 8.186L12 18.896l-7.332 3.861 1.404-8.186-5.938-5.797 8.198-1.182z" />
            </svg>
        </span>
        )}
    </span>
  );
}
