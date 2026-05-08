'use client';
import { useEffect, useState } from 'react';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';

const DIETARY_FILTERS = ['All', 'high-protein', 'keto', 'vegan', 'vegetarian', 'gluten-free', 'low-carb'];

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

interface RecipesResponse {
  recipes: Recipe[];
  total: number;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [dietary, setDietary] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (search) params.set('search', search);
      if (dietary !== 'All') params.set('dietary', dietary);
      const res = await fetch(`/api/recipes?${params}`);
      const d = await res.json() as RecipesResponse;
      setRecipes(d.recipes);
      setTotal(d.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadRecipes(); }, [search, dietary, page]);

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">Healthy Recipes</h1>
        <p className="text-sm text-gray-500 mt-1">AI-curated recipes tailored to your goals</p>
      </div>

      <Input
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search recipes..."
        leftIcon={<Search className="w-4 h-4" />}
      />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {DIETARY_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => { setDietary(f); setPage(1); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              dietary === f
                ? 'bg-brand-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
            }`}
          >
            {f === 'All' ? 'All Recipes' : f.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🍲</p>
          <p className="text-gray-500">No recipes found</p>
          <button onClick={() => { setSearch(''); setDietary('All'); }} className="text-brand-600 text-sm mt-2">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      {total > 12 && (
        <div className="flex gap-2 justify-center">
          {page > 1 && (
            <button onClick={() => setPage((p) => p - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium">
              Previous
            </button>
          )}
          {page * 12 < total && (
            <button onClick={() => setPage((p) => p + 1)} className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-medium">
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
