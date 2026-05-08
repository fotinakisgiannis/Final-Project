'use client';
import { useState } from 'react';
import { Scan, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useFood } from '@/hooks/useFood';
import { motion, AnimatePresence } from 'framer-motion';
import type { BarcodeProduct } from '@/types/food';
import type { MealType } from '@/types/food';

interface BarcodeScannerProps {
  mealType: MealType;
  onLogged?: () => void;
}

export function BarcodeScanner({ mealType, onLogged }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState('');
  const [isLooking, setIsLooking] = useState(false);
  const [product, setProduct] = useState<BarcodeProduct | null>(null);
  const [error, setError] = useState('');
  const { logFood, isSaving } = useFood();

  const lookup = async () => {
    if (!barcode.trim()) return;
    setIsLooking(true);
    setError('');
    setProduct(null);
    try {
      const res = await fetch(`/api/food/barcode?code=${barcode.trim()}`);
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? 'Product not found');
        return;
      }
      const d = await res.json() as { product: BarcodeProduct };
      setProduct(d.product);
    } catch {
      setError('Failed to look up barcode');
    } finally {
      setIsLooking(false);
    }
  };

  const handleLog = async () => {
    if (!product) return;
    await logFood({
      foodName: product.name,
      brand: product.brand,
      mealType,
      servingSize: 1,
      servingUnit: product.servingSize,
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fat: product.fat,
      fiber: product.fiber,
      source: 'BARCODE',
      barcode: product.barcode,
    });
    setProduct(null);
    setBarcode('');
    onLogged?.();
  };

  return (
    <div className="space-y-5">
      <div className="text-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <Scan className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium">Camera barcode scanning</p>
        <p className="text-xs text-gray-400">coming soon</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Enter barcode number..."
          onKeyDown={(e) => e.key === 'Enter' && lookup()}
          leftIcon={<Search className="w-4 h-4" />}
          className="flex-1"
        />
        <Button onClick={lookup} loading={isLooking} size="md">
          Look up
        </Button>
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <AnimatePresence>
        {product && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-brand-50 rounded-2xl border border-brand-200">
              <p className="font-semibold text-gray-900">{product.name}</p>
              {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}
              <p className="text-xs text-gray-400 mt-1">Per {product.servingSize}</p>
              <div className="grid grid-cols-4 gap-3 mt-3">
                {[
                  { label: 'Calories', value: product.calories, unit: '' },
                  { label: 'Protein', value: product.protein, unit: 'g' },
                  { label: 'Carbs', value: product.carbs, unit: 'g' },
                  { label: 'Fat', value: product.fat, unit: 'g' },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="text-center">
                    <p className="text-base font-bold text-gray-900">{value}{unit}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <Button fullWidth onClick={handleLog} loading={isSaving} size="lg">
              Log This Product
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
