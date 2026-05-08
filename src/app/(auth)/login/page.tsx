'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometric, setIsBiometric] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometric = async () => {
    const email = (document.getElementById('biometric-email') as HTMLInputElement)?.value;
    if (!email) { toast.error('Enter your email first'); return; }

    setIsBiometric(true);
    try {
      const { startAuthentication } = await import('@simplewebauthn/browser');
      const optRes = await fetch('/api/webauthn/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'options', email }),
      });
      if (!optRes.ok) throw new Error('No passkey found');
      const { options, sessionId } = await optRes.json() as { options: Parameters<typeof startAuthentication>[0]; sessionId: string };

      const response = await startAuthentication(options);
      const verifyRes = await fetch('/api/webauthn/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', response, sessionId }),
      });

      if (!verifyRes.ok) throw new Error('Biometric verification failed');

      await signIn('credentials', { email, password: '__passkey__', redirect: false });
      router.push('/dashboard');
    } catch (err) {
      toast.error((err as Error).message ?? 'Biometric login failed');
    } finally {
      setIsBiometric(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-green">
            <span className="text-white text-2xl font-bold">N</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your NutriTrack AI account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="biometric-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" fullWidth size="lg" loading={isLoading}>
              Sign in
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="px-4 bg-white text-sm text-gray-400">or</span></div>
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            size="lg"
            onClick={handleBiometric}
            loading={isBiometric}
          >
            <Fingerprint className="w-5 h-5" />
            Sign in with Passkey
          </Button>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-600 font-semibold hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
