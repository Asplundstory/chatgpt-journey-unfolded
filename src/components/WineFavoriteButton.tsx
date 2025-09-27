import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserFavorites } from "@/hooks/useUserFavorites";
import { useLocalStorageFavorites } from "@/hooks/useLocalStorageFavorites";
import { cn } from "@/lib/utils";

interface WineFavoriteButtonProps {
  wineId: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "ghost";
}

export const WineFavoriteButton = ({ 
  wineId, 
  size = "sm", 
  variant = "ghost" 
}: WineFavoriteButtonProps) => {
  const { user } = useAuth();
  const { isFavorite: isDbFavorite, addFavorite: addDbFavorite, removeFavorite: removeDbFavorite } = useUserFavorites();
  const { isFavorite: isLocalFavorite, addFavorite: addLocalFavorite, removeFavorite: removeLocalFavorite } = useLocalStorageFavorites();

  const isFavorite = user ? isDbFavorite(wineId) : isLocalFavorite(wineId);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (user) {
      if (isFavorite) {
        await removeDbFavorite(wineId);
      } else {
        await addDbFavorite(wineId);
      }
    } else {
      if (isFavorite) {
        removeLocalFavorite(wineId);
      } else {
        addLocalFavorite(wineId);
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleFavorite}
      className={cn(
        "transition-colors",
        isFavorite && "text-red-500 hover:text-red-600"
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4",
          isFavorite && "fill-current"
        )} 
      />
    </Button>
  );
};