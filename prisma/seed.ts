import { PrismaClient, FitnessGoal, ActivityLevel, Gender, MealType, FoodSource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create achievements
  const achievements = [
    { name: 'First Log', description: 'Log your first meal', icon: '🍽️', category: 'logging', points: 10, requirement: { type: 'food_entries', count: 1 } },
    { name: 'Week Warrior', description: '7-day logging streak', icon: '🔥', category: 'streak', points: 50, requirement: { type: 'streak', count: 7 } },
    { name: 'Month Master', description: '30-day logging streak', icon: '💪', category: 'streak', points: 200, requirement: { type: 'streak', count: 30 } },
    { name: 'Hydration Hero', description: 'Hit water goal 7 days in a row', icon: '💧', category: 'water', points: 30, requirement: { type: 'water_streak', count: 7 } },
    { name: 'Protein Pro', description: 'Hit protein goal 5 days in a row', icon: '🥩', category: 'nutrition', points: 40, requirement: { type: 'protein_streak', count: 5 } },
    { name: 'Calorie Champion', description: 'Stay within calorie goal for 7 days', icon: '🎯', category: 'calories', points: 50, requirement: { type: 'calorie_streak', count: 7 } },
    { name: 'AI Explorer', description: 'Log a meal using AI photo recognition', icon: '🤖', category: 'ai', points: 20, requirement: { type: 'ai_photo_logs', count: 1 } },
    { name: 'Voice Virtuoso', description: 'Log 5 meals using voice', icon: '🎤', category: 'ai', points: 25, requirement: { type: 'voice_logs', count: 5 } },
    { name: 'Scanner Star', description: 'Scan 10 barcodes', icon: '📱', category: 'barcode', points: 30, requirement: { type: 'barcode_scans', count: 10 } },
    { name: 'Recipe Rookie', description: 'Save your first recipe', icon: '📖', category: 'recipes', points: 15, requirement: { type: 'saved_recipes', count: 1 } },
    { name: 'Goal Getter', description: 'Reach your target weight', icon: '🏆', category: 'weight', points: 500, requirement: { type: 'reach_goal', count: 1 } },
    { name: 'Century Club', description: 'Log 100 meals total', icon: '💯', category: 'logging', points: 100, requirement: { type: 'food_entries', count: 100 } },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { id: ach.name.toLowerCase().replace(/ /g, '_') },
      update: ach,
      create: { id: ach.name.toLowerCase().replace(/ /g, '_'), ...ach },
    });
  }

  // Seed recipes
  const recipes = [
    {
      title: 'High-Protein Greek Bowl',
      description: 'A protein-packed Mediterranean bowl with chicken, quinoa, and fresh vegetables.',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      calories: 520,
      protein: 45,
      carbs: 48,
      fat: 14,
      fiber: 8,
      servings: 2,
      prepTimeMinutes: 15,
      cookTimeMinutes: 25,
      ingredients: [
        '200g chicken breast',
        '1 cup quinoa',
        '1 cucumber, diced',
        '1 cup cherry tomatoes',
        '1/2 cup kalamata olives',
        '100g feta cheese',
        '2 tbsp olive oil',
        '1 lemon, juiced',
        'Fresh herbs (oregano, mint)',
      ],
      instructions: [
        'Cook quinoa according to package instructions.',
        'Season chicken with herbs, salt, pepper, and olive oil.',
        'Grill or pan-fry chicken for 6-7 minutes per side.',
        'Let chicken rest, then slice.',
        'Arrange quinoa in bowls, top with chicken and vegetables.',
        'Drizzle with lemon juice and olive oil.',
        'Crumble feta on top and serve.',
      ],
      tags: ['high-protein', 'mediterranean', 'meal-prep', 'gluten-free'],
      dietaryTags: ['gluten-free', 'high-protein'],
      cuisine: 'Mediterranean',
      difficulty: 'easy',
      isVerified: true,
    },
    {
      title: 'Keto Avocado Egg Bake',
      description: 'A creamy, satisfying keto breakfast baked in avocado halves.',
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
      calories: 380,
      protein: 18,
      carbs: 8,
      fat: 32,
      fiber: 7,
      servings: 2,
      prepTimeMinutes: 5,
      cookTimeMinutes: 15,
      ingredients: [
        '2 ripe avocados',
        '4 large eggs',
        '2 strips bacon, cooked and crumbled',
        '2 tbsp cheddar cheese, shredded',
        'Salt, pepper to taste',
        'Fresh chives for garnish',
      ],
      instructions: [
        'Preheat oven to 425°F (220°C).',
        'Halve avocados and remove pits. Scoop out a little flesh to make room.',
        'Place avocados in a baking dish.',
        'Crack one egg into each avocado half.',
        'Top with bacon and cheese.',
        'Season with salt and pepper.',
        'Bake 12-15 minutes until whites are set.',
        'Garnish with chives and serve.',
      ],
      tags: ['keto', 'breakfast', 'quick', 'low-carb'],
      dietaryTags: ['keto', 'low-carb', 'gluten-free'],
      cuisine: 'American',
      difficulty: 'easy',
      isVerified: true,
    },
    {
      title: 'Vegan Lentil Power Soup',
      description: 'Hearty, nutrient-dense lentil soup with turmeric and warming spices.',
      imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
      calories: 290,
      protein: 18,
      carbs: 52,
      fat: 4,
      fiber: 16,
      servings: 4,
      prepTimeMinutes: 10,
      cookTimeMinutes: 35,
      ingredients: [
        '2 cups red lentils',
        '1 onion, diced',
        '3 garlic cloves, minced',
        '2 carrots, diced',
        '2 celery stalks, diced',
        '1 can diced tomatoes',
        '6 cups vegetable broth',
        '1 tsp turmeric',
        '1 tsp cumin',
        '1 tsp coriander',
        'Salt, pepper to taste',
        '2 tbsp olive oil',
        'Fresh lemon juice',
      ],
      instructions: [
        'Heat oil in a large pot over medium heat.',
        'Sauté onion and garlic until softened, about 5 minutes.',
        'Add carrots and celery, cook 3 minutes.',
        'Add spices and stir for 1 minute.',
        'Add lentils, tomatoes, and broth. Bring to boil.',
        'Reduce heat and simmer 25-30 minutes until lentils are tender.',
        'Blend half the soup for a creamy texture.',
        'Season and finish with lemon juice.',
      ],
      tags: ['vegan', 'high-fiber', 'meal-prep', 'budget-friendly'],
      dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'],
      cuisine: 'Middle Eastern',
      difficulty: 'easy',
      isVerified: true,
    },
    {
      title: 'Overnight Oats with Berries',
      description: 'Creamy, nutritious overnight oats ready in the morning.',
      imageUrl: 'https://images.unsplash.com/photo-1484723091739-30990dd1e567?w=800',
      calories: 340,
      protein: 14,
      carbs: 58,
      fat: 8,
      fiber: 9,
      servings: 1,
      prepTimeMinutes: 5,
      cookTimeMinutes: 0,
      ingredients: [
        '1/2 cup rolled oats',
        '1 cup almond milk',
        '1/2 cup Greek yogurt',
        '1 tbsp chia seeds',
        '1 tbsp honey',
        '1/2 cup mixed berries',
        '1 tbsp almond butter',
      ],
      instructions: [
        'Combine oats, almond milk, Greek yogurt, chia seeds, and honey in a jar.',
        'Stir well to combine.',
        'Cover and refrigerate overnight (at least 6 hours).',
        'In the morning, top with berries and almond butter.',
        'Add more liquid if too thick and enjoy.',
      ],
      tags: ['breakfast', 'meal-prep', 'no-cook', 'healthy'],
      dietaryTags: ['vegetarian', 'high-fiber'],
      cuisine: 'American',
      difficulty: 'easy',
      isVerified: true,
    },
    {
      title: 'Salmon with Roasted Vegetables',
      description: 'Omega-3 rich salmon fillet with colorful roasted seasonal vegetables.',
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
      calories: 480,
      protein: 42,
      carbs: 28,
      fat: 22,
      fiber: 7,
      servings: 2,
      prepTimeMinutes: 15,
      cookTimeMinutes: 25,
      ingredients: [
        '2 salmon fillets (150g each)',
        '2 cups broccoli florets',
        '1 red bell pepper, sliced',
        '1 zucchini, sliced',
        '1 cup cherry tomatoes',
        '3 tbsp olive oil',
        '2 garlic cloves, minced',
        '1 tsp herbs de Provence',
        'Salt, pepper, lemon slices',
      ],
      instructions: [
        'Preheat oven to 400°F (200°C).',
        'Toss vegetables with 2 tbsp olive oil, salt, and pepper.',
        'Spread on a baking sheet and roast 15 minutes.',
        'Push vegetables to sides, place salmon in center.',
        'Drizzle salmon with remaining oil, herbs, and garlic.',
        'Roast 12-15 more minutes until salmon flakes easily.',
        'Serve with lemon wedges.',
      ],
      tags: ['high-protein', 'omega-3', 'gluten-free', 'dinner'],
      dietaryTags: ['gluten-free', 'dairy-free', 'high-protein'],
      cuisine: 'European',
      difficulty: 'easy',
      isVerified: true,
    },
  ];

  for (const recipe of recipes) {
    await prisma.recipe.create({ data: recipe });
  }

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123456', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@nutritrack.ai' },
    update: {},
    create: {
      email: 'demo@nutritrack.ai',
      name: 'Alex Demo',
      password: hashedPassword,
      profile: {
        create: {
          age: 28,
          gender: Gender.MALE,
          heightCm: 178,
          startWeightKg: 82,
          currentWeightKg: 80,
          targetWeightKg: 75,
          activityLevel: ActivityLevel.MODERATELY_ACTIVE,
          goal: FitnessGoal.LOSE_WEIGHT,
          dietaryPrefs: ['high-protein', 'balanced'],
          dailyCalorieGoal: 2100,
          dailyProteinG: 160,
          dailyCarbsG: 210,
          dailyFatG: 70,
          dailyFiberG: 30,
          dailyWaterMl: 2500,
          bmr: 1850,
          tdee: 2450,
          bmi: 25.2,
          onboardingDone: true,
        },
      },
      streak: {
        create: {
          currentStreak: 7,
          longestStreak: 14,
          totalDaysLogged: 32,
          lastLoggedDate: new Date(),
        },
      },
    },
  });

  // Create sample food entries for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyLog = await prisma.dailyLog.upsert({
    where: { userId_date: { userId: demoUser.id, date: today } },
    update: {},
    create: {
      userId: demoUser.id,
      date: today,
      totalCalories: 1420,
      totalProtein: 98,
      totalCarbs: 165,
      totalFat: 42,
      totalFiber: 18,
      totalWaterMl: 1800,
      nutritionScore: 78,
    },
  });

  await prisma.foodEntry.createMany({
    data: [
      {
        userId: demoUser.id,
        dailyLogId: dailyLog.id,
        foodName: 'Greek Yogurt with Berries',
        mealType: MealType.BREAKFAST,
        servingSize: 1,
        servingUnit: 'cup',
        calories: 180,
        protein: 15,
        carbs: 25,
        fat: 3,
        fiber: 3,
        source: FoodSource.MANUAL,
        loggedAt: new Date(today.getTime() + 8 * 3600000),
      },
      {
        userId: demoUser.id,
        dailyLogId: dailyLog.id,
        foodName: 'Chicken Caesar Salad',
        mealType: MealType.LUNCH,
        servingSize: 1,
        servingUnit: 'large',
        calories: 520,
        protein: 42,
        carbs: 22,
        fat: 28,
        fiber: 5,
        source: FoodSource.MANUAL,
        loggedAt: new Date(today.getTime() + 13 * 3600000),
      },
      {
        userId: demoUser.id,
        dailyLogId: dailyLog.id,
        foodName: 'Protein Bar',
        brand: 'Quest',
        mealType: MealType.SNACK,
        servingSize: 1,
        servingUnit: 'bar',
        calories: 200,
        protein: 21,
        carbs: 22,
        fat: 7,
        fiber: 12,
        source: FoodSource.BARCODE,
        loggedAt: new Date(today.getTime() + 16 * 3600000),
      },
    ],
    skipDuplicates: true,
  });

  // Weight logs for the past 30 days
  const weightLogs = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    weightLogs.push({
      userId: demoUser.id,
      weightKg: 82 - (29 - i) * 0.07 + (Math.random() - 0.5) * 0.3,
      loggedAt: date,
    });
  }
  await prisma.weightLog.createMany({ data: weightLogs, skipDuplicates: true });

  console.log('✅ Database seeded successfully!');
  console.log('Demo user: demo@nutritrack.ai / demo123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
