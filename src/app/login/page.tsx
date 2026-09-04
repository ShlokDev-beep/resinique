'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema } from '@/lib/validations';
import { Sparkles } from 'lucide-react';

type LoginForm = { phone: string; password: string };
type RegisterForm = { name: string; phone: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    const result = await signIn('credentials', {
      redirect: false,
      phone: data.phone,
      password: data.password,
    });
    setLoading(false);
    if (result?.error) {
      setError('Invalid phone or password');
    } else {
      router.push('/admin');
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        const signInResult = await signIn('credentials', {
          redirect: false,
          phone: data.phone,
          password: data.password,
        });
        if (signInResult?.error) {
          setError('Account created but login failed. Please try logging in.');
        } else {
          router.push('/');
        }
      }
    } catch {
      setError('Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Sparkles className="w-10 h-10 text-amber-warm mx-auto mb-3" />
          <h1 className="text-2xl font-bold">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-charcoal-700/60 text-sm mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Join Resinique Creations'}
          </p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input {...loginForm.register('phone')} className="input-field" placeholder="+91 XXXXX XXXXX" />
                {loginForm.formState.errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input {...loginForm.register('password')} type="password" className="input-field" />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input {...registerForm.register('name')} className="input-field" placeholder="Your name" />
                {registerForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input {...registerForm.register('phone')} className="input-field" placeholder="+91 XXXXX XXXXX" />
                {registerForm.formState.errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input {...registerForm.register('password')} type="password" className="input-field" minLength={6} />
                {registerForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            {mode === 'login' ? (
              <p className="text-charcoal-700/60">
                Don&apos;t have an account?{' '}
                <button onClick={() => setMode('register')} className="text-amber-warm hover:underline">
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-charcoal-700/60">
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-amber-warm hover:underline">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
