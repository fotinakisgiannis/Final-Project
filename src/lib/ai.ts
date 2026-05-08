import Anthropic from '@anthropic-ai/sdk';
import type { AIFoodAnalysis, VoiceParseResult } from '@/types/food';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-6';

export async function analyzeFoodPhoto(imageBase64: string, mimeType: string): Promise<AIFoodAnalysis> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `Analyze this food image and provide a detailed nutritional breakdown. Return ONLY a valid JSON object with this exact structure:
{
  "foods": [
    {
      "name": "food name",
      "estimatedCalories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "fiber": 0,
      "sugar": 0,
      "servingDescription": "estimated serving size",
      "confidence": 0.0
    }
  ],
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0,
  "notes": "any relevant notes about the meal"
}

Be as accurate as possible. Use standard nutrition databases for estimates. Confidence score should be between 0.0 and 1.0. If multiple foods are visible, list each separately.`,
          },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from AI');

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]) as AIFoodAnalysis;
  } catch {
    throw new Error('Failed to parse AI food analysis response');
  }
}

export async function parseVoiceFoodLog(transcript: string): Promise<VoiceParseResult> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Parse this food log voice transcript and estimate calories and macros for each food item.

Transcript: "${transcript}"

Return ONLY a valid JSON object:
{
  "foods": [
    {
      "name": "food name",
      "quantity": "amount and unit",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "fiber": 0
    }
  ],
  "transcript": "${transcript}",
  "totalCalories": 0
}

Use standard nutrition data. Be accurate with portion sizes mentioned.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]) as VoiceParseResult;
  } catch {
    throw new Error('Failed to parse voice log response');
  }
}

export async function generateInsights(data: {
  weeklyCalories: number[];
  weeklyProtein: number[];
  weeklyWater: number[];
  calorieGoal: number;
  proteinGoal: number;
  waterGoal: number;
  currentWeight: number;
  targetWeight: number;
  streak: number;
}): Promise<string[]> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Based on this nutrition data, generate 3-5 personalized, actionable coaching insights.

Data:
- 7-day calories: ${data.weeklyCalories.join(', ')} (goal: ${data.calorieGoal})
- 7-day protein (g): ${data.weeklyProtein.join(', ')} (goal: ${data.proteinGoal}g)
- 7-day water (ml): ${data.weeklyWater.join(', ')} (goal: ${data.waterGoal}ml)
- Current weight: ${data.currentWeight}kg, Target: ${data.targetWeight}kg
- Current streak: ${data.streak} days

Return ONLY a JSON array of insight strings (no objects, just strings):
["insight 1", "insight 2", "insight 3"]

Make insights specific, encouraging, and data-driven. Keep each under 100 characters.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') return [];

  try {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as string[];
  } catch {
    return [];
  }
}

export async function generateWeeklySummary(report: {
  avgCalories: number;
  calorieGoal: number;
  avgProtein: number;
  proteinGoal: number;
  loggingDays: number;
  weightChange?: number;
}): Promise<string> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Write a brief, motivating weekly nutrition summary (2-3 sentences) based on:
- Avg calories: ${report.avgCalories} (goal: ${report.calorieGoal})
- Avg protein: ${report.avgProtein}g (goal: ${report.proteinGoal}g)
- Days logged: ${report.loggingDays}/7
- Weight change: ${report.weightChange ? `${report.weightChange > 0 ? '+' : ''}${report.weightChange}kg` : 'not tracked'}

Return only the summary text, no JSON.`,
      },
    ],
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : 'Keep up the great work this week!';
}
