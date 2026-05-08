'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUserStore } from '@/store/useUserStore';
import toast from 'react-hot-toast';
import type { Gender, ActivityLevel, FitnessGoal } from '@/types/user';

const DIETARY_OPTIONS = ['High Protein', 'Keto', 'Vegan', 'Vegetarian', 'Low Carb', 'Gluten Free', 'Balanced', 'Mediterranean'];
const ALLERGY_OPTIONS = ['Gluten', 'Dairy', 'Nuts', 'Eggs', 'Fish', 'Shellfish', 'Soy', 'None'];

interface FormState {
  age: string;
  gender: Gender | '';
  heightCm: string;
  weightKg: string;
  targetWeightKg: string;
  activityLevel: ActivityLevel | '';
  goal: FitnessGoal | '';
  dietaryPrefs: string[];
  allergies: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const { setProfile, setGoals } = useUserStore();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    age: '', gender: '', heightCm: '', weightKg: '', targetWeightKg: '',
    activityLevel: '', goal: '', dietaryPrefs: [], allergies: [],
  });

  const steps = [
    { title: 'Tell us about yourself', subtitle: 'Basic info to personalize your experience' },
    { title: 'Your body stats', subtitle: 'We use this to calculate your ideal calorie intake' },
    { title: 'What\'s your goal?', subtitle: 'We\'ll tailor your plan accordingly' },
    { title: 'Dietary preferences', subtitle: 'Almost done!' },
  ];

  const current = steps[step];

  const toggle = (key: 'dietaryPrefs' | 'allergies', val: string) => {
    setForm((prev) => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(form.age),
          gender: form.gender,
          heightCm: parseFloat(form.heightCm),
          weightKg: parseFloat(form.weightKg),
          targetWeightKg: parseFloat(form.targetWeightKg),
          activityLevel: form.activityLevel,
          goal: form.goal,
          dietaryPrefs: form.dietaryPrefs.map((p) => p.toLowerCase().replace(/ /g, '-')),
          allergies: form.allergies.map((a) => a.toLowerCase()),
        }),
      });

      if (!res.ok) { toast.error('Failed to save profile'); return; }
      const data = await res.json() as { profile: Parameters<typeof setProfile>[0]; goals: Parameters<typeof setGoals>[0] };
      setProfile(data.profile);
      setGoals(data.goals);
      await update({ onboardingDone: true });
      router.push('/dashboard');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.age && form.gender;
    if (step === 1) return form.heightCm && form.weightKg && form.targetWeightKg;
    if (step === 2) return form.activityLevel && form.goal;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-brand-500' : 'bg-gray-200'
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-card p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{current.title}</h2>
            <p className="text-gray-500 mb-8">{current.subtitle}</p>

            {step === 0 && (
              <div className="space-y-5">
                <Input
                  label="Age"
                  type="number"
                  placeholder="25"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as Gender[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setForm({ ...form, gender: g })}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                          form.gender === g
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {g.replace('_', ' ').replace('PREFER NOT TO SAY', 'Prefer not to say')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <Input label="Height (cm)" type="number" placeholder="175" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} />
                <Input label="Current weight (kg)" type="number" placeholder="80" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
                <Input label="Target weight (kg)" type="number" placeholder="72" value={form.targetWeightKg} onChange={(e) => setForm({ ...form, targetWeightKg: e.target.value })} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Activity Level</label>
                  <div className="space-y-2">
                    {([
                      { value: 'SEDENTARY', label: 'Sedentary', desc: 'Office job, little exercise' },
                      { value: 'LIGHTLY_ACTIVE', label: 'Lightly Active', desc: '1-3 workouts/week' },
                      { value: 'MODERATELY_ACTIVE', label: 'Moderately Active', desc: '3-5 workouts/week' },
                      { value: 'VERY_ACTIVE', label: 'Very Active', desc: '6-7 hard workouts/week' },
                      { value: 'EXTRA_ACTIVE', label: 'Extra Active', desc: 'Athlete / physical job' },
                    ] as { value: ActivityLevel; label: string; desc: string }[]).map(({ value, label, desc }) => (
                      <button
                        key={value}
                        onClick={() => setForm({ ...form, activityLevel: value })}
                        className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border-2 text-left transition-all ${
                          form.activityLevel === value
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-800">{label}</span>
                        <span className="text-xs text-gray-400">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Your Goal</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: 'LOSE_WEIGHT', label: '🔥 Lose Weight' },
                      { value: 'MAINTAIN', label: '⚖️ Maintain' },
                      { value: 'GAIN_MUSCLE', label: '💪 Gain Muscle' },
                      { value: 'IMPROVE_HEALTH', label: '❤️ Improve Health' },
                    ] as { value: FitnessGoal; label: string }[]).map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setForm({ ...form, goal: value })}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                          form.goal === value
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Dietary Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => toggle('dietaryPrefs', opt)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          form.dietaryPrefs.includes(opt)
                            ? 'bg-brand-500 text-white border-brand-500'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-brand-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Allergies & Intolerances</label>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => toggle('allergies', opt)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          form.allergies.includes(opt)
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-red-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <Button variant="outline" size="lg" onClick={() => setStep((s) => s - 1)} className="flex-1">
                  Back
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button size="lg" onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="flex-1">
                  Continue
                </Button>
              ) : (
                <Button size="lg" onClick={handleSubmit} loading={isSubmitting} className="flex-1">
                  Complete Setup 🎉
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center mt-4 text-xs text-gray-400">Step {step + 1} of {steps.length}</p>
      </div>
    </div>
  );
}
