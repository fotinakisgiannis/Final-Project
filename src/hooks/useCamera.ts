'use client';
import { useState, useRef, useCallback } from 'react';
import type { AIFoodAnalysis } from '@/types/food';

export function useCamera() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIFoodAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capturePhoto = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsCapturing(true);
    setAnalysis(null);
  }, []);

  const analyzePhoto = useCallback(async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    try {
      const base64 = imageDataUrl.split(',')[1];
      const mimeType = imageDataUrl.split(';')[0].split(':')[1];

      const res = await fetch('/api/food/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setAnalysis(data.analysis);
      return data.analysis as AIFoodAnalysis;
    } catch (error) {
      console.error('Photo analysis error:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
      setIsCapturing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPreview(null);
    setAnalysis(null);
    setIsCapturing(false);
    setIsAnalyzing(false);
  }, []);

  return { preview, isCapturing, isAnalyzing, analysis, fileInputRef, capturePhoto, handleFileSelect, analyzePhoto, reset };
}
