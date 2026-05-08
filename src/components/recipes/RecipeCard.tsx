'use client';
import { useState } from 'react';
import { Heart, Clock, Flame, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  difficulty?: string;
  dietaryTags: string[];
  isFavorited?: boolean;
  isVerified?: boolean;
}

interface RecipeCardProps {
  recipe: Recipe;
  onFavorite?: (id: string) => void;
  onClick?: () => void;
}

export function RecipeCard({ recipe, onFavorite, onClick }: RecipeCardProps) {
  const [favorited, setFavorited] = useState(recipe.isFavorited ?? false);
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'favorite', recipeId: recipe.id }),
      });
      const d = await res.json() as { favorited: boolean };
      setFavorited(d.favorited);
      onFavorite?.(recipe.id);
    } catch {
      // ignore
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="relative h-44 bg-gray-100">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
        >
          <Heart className={cn('w-4 h-4 transition-colors', favorited ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
        </button>
        {recipe.isVerified && (
          <div className="absolute top-3 left-3">
            <Badge variant="green" size="sm">✓ Verified</Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{recipe.title}</h3>
        {recipe.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{recipe.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{recipe.calories} kcal</span>
          </div>
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{totalTime} min</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1 mb-3">
          {[
            { label: 'Protein', value: recipe.protein, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Carbs', value: recipe.carbs, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Fat', value: recipe.fat, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-lg p-1.5 text-center`}>
              <p className={`text-xs font-bold ${color}`}>{value}g</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          {recipe.dietaryTags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="gray" size="sm">{tag}</Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
