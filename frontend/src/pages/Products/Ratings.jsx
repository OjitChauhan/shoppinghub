import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const Ratings = ({ value, text, color, onSelect, onHover, onLeave }) => {
  const fullStars = Math.floor(value);
  const halfStars = value - fullStars >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;

  // Gold & Slate theme integration
  const activeColor = "text-[#D4AF37]"; // Premium Gold
  const inactiveColor = "text-zinc-600"; // Slate/Zinc

  return (
    <div className="flex flex-wrap items-center justify-start gap-1 sm:gap-2">
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, index) => (
        <FaStar
          key={`full-${index}`}
          className={`${activeColor} w-4 h-4 sm:w-5 sm:h-5 ${onSelect ? "cursor-pointer transition-transform hover:scale-110" : ""}`}
          onClick={() => onSelect && onSelect(index + 1)}
          onMouseEnter={() => onHover && onHover(index + 1)}
          onMouseLeave={() => onLeave && onLeave()}
        />
      ))}

      {/* Half Star */}
      {halfStars === 1 && (
        <FaStarHalfAlt
          className={`${activeColor} w-4 h-4 sm:w-5 sm:h-5`}
        />
      )}

      {/* Empty Stars */}
      {[...Array(emptyStars)].map((_, index) => (
        <FaRegStar
          key={`empty-${index}`}
          className={`${onSelect ? activeColor : inactiveColor} w-4 h-4 sm:w-5 sm:h-5 ${onSelect ? "cursor-pointer transition-transform hover:scale-110 opacity-40 hover:opacity-100" : "opacity-40"}`}
          onClick={() => onSelect && onSelect(fullStars + halfStars + index + 1)}
          onMouseEnter={() => onHover && onHover(fullStars + halfStars + index + 1)}
          onMouseLeave={() => onLeave && onLeave()}
        />
      ))}

      {text && (
        <span className={`ml-2 text-sm sm:text-base font-bold text-zinc-500`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Ratings;

