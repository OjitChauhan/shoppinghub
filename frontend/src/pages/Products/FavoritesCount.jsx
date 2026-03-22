import { useSelector } from "react-redux";

const FavoritesCount = () => {
  const favorites = useSelector((state) => state.favorites);
  const favoriteCount = favorites.length;

  return (
    <div className="absolute left-2 top-8">
      {favoriteCount > 0 && (
        <span className="px-2 py-0.5 text-sm text-[#285570] bg-[#EFAF76] rounded-full font-bold">
          {favoriteCount}
        </span>
      )}
    </div>
  );
};

export default FavoritesCount;
