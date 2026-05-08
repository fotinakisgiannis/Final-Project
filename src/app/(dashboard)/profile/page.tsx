'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useUserStore } from '@/store/useUserStore';
import { formatWeight, getBMICategory } from '@/lib/utils';
import { calculateBMI } from '@/lib/nutrition';
import { Fingerprint, Scale, Target, Flame, Droplets, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { data: session } = useSession();
  const { profile, goals, stats, setWaterToday } = useUserStore();
  const [weightInput, setWeightInput] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.profile) useUserStore.getState().setProfile(d.profile);
      if (d.stats) useUserStore.getState().setStats(d.stats);
    }).catch(console.error);
  }, []);

  const logWeight = async () => {
    const kg = parseFloat(weightInput);
    if (isNaN(kg) || kg < 20 || kg > 300) { toast.error('Invalid weight'); return; }
    setIsLogging(true);
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weightKg: kg }),
      });
      if (!res.ok) throw new Error();
      toast.success('Weight logged!');
      setWeightInput('');
    } catch {
      toast.error('Failed to log weight');
    } finally {
      setIsLogging(false);
    }
  };

  const registerPasskey = async () => {
    setIsRegisteringPasskey(true);
    try {
      const { startRegistration } = await import('@simplewebauthn/browser');
      const optRes = await fetch('/api/webauthn/register');
      if (!optRes.ok) throw new Error('Failed to get options');
      const options = await optRes.json() as Parameters<typeof startRegistration>[0];
      const response = await startRegistration(options);
      const verifyRes = await fetch('/api/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });
      if (!verifyRes.ok) throw new Error('Registration failed');
      toast.success('Passkey registered! You can now use biometric login.');
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to register passkey');
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const bmi = profile?.currentWeightKg && profile?.heightCm
    ? calculateBMI(profile.currentWeightKg, profile.heightCm)
    : null;

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">Profile & Settings</h1>
      </div>

      {/* User info */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-accent-500 rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{session?.user?.name?.[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{session?.user?.name}</p>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>
            <div className="flex gap-2 mt-2">
              {profile?.goal && <Badge variant="green">{profile.goal.replace('_', ' ')}</Badge>}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Flame, label: 'Streak', value: `${stats?.currentStreak ?? 0}d`, color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: Trophy, label: 'Points', value: `${stats?.achievementPoints ?? 0}`, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { icon: Scale, label: 'Logged', value: `${stats?.totalDaysLogged ?? 0}d`, color: 'text-brand-500', bg: 'bg-brand-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} padding="sm" className="text-center">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </Card>
        ))}
      </div>

      {/* Body metrics */}
      {profile && (
        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-4">Body Metrics</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Height', value: profile.heightCm ? `${profile.heightCm} cm` : '--' },
              { label: 'Current Weight', value: profile.currentWeightKg ? formatWeight(profile.currentWeightKg) : '--' },
              { label: 'Target Weight', value: profile.targetWeightKg ? formatWeight(profile.targetWeightKg) : '--' },
              { label: 'BMI', value: bmi ? `${bmi} (${getBMICategory(bmi)})` : '--' },
              { label: 'BMR', value: profile.bmr ? `${Math.round(profile.bmr)} kcal` : '--' },
              { label: 'TDEE', value: profile.tdee ? `${Math.round(profile.tdee)} kcal` : '--' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Goals */}
      {goals && (
        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-4">Daily Goals</p>
          <div className="space-y-3">
            {[
              { icon: Flame, label: 'Calories', value: `${goals.calories} kcal`, color: 'text-orange-500' },
              { icon: Target, label: 'Protein', value: `${goals.protein}g`, color: 'text-blue-500' },
              { icon: Droplets, label: 'Water', value: `${(goals.water / 1000).toFixed(1)}L`, color: 'text-cyan-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Log weight */}
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-4">Log Today&apos;s Weight</p>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="e.g. 78.5"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            rightIcon={<span className="text-xs text-gray-400">kg</span>}
            className="flex-1"
          />
          <Button onClick={logWeight} loading={isLogging}>Log</Button>
        </div>
      </Card>

      {/* Biometric */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Fingerprint className="w-5 h-5 text-brand-500" />
          <p className="text-sm font-semibold text-gray-700">Passkey / Biometric Login</p>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Register a passkey to sign in with Face ID, Touch ID, or your device PIN.
        </p>
        <Button variant="outline" fullWidth onClick={registerPasskey} loading={isRegisteringPasskey}>
          <Fingerprint className="w-4 h-4" />
          Register Passkey
        </Button>
      </Card>
    </div>
  );
}
