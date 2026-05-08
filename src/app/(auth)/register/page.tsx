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
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });

      if (!res.ok) {
        const d = await res.json() as { error?: string };
        toast.error(d.error ?? 'Registration failed');
        return;
      }

      await signIn('credentials', { email: data.email, password: data.password, redirect: false });
      router.push('/onboarding');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-green">
            <span className="text-white text-2xl font-bold">N</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Start tracking smarter with AI</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" placeholder="Alex Smith" leftIcon={<User className="w-4 h-4" />} error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail className="w-4 h-4" />} error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="Min. 8 characters" leftIcon={<Lock className="w-4 h-4" />} error={errors.password?.message} hint="At least 8 characters" {...register('password')} />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" leftIcon={<Lock className="w-4 h-4" />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            <Button type="submit" fullWidth size="lg" loading={isLoading}>
              Create Account
            </Button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
