import { useState, useEffect } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Send password reset email with custom redirect to login page
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/signin`,
        handleCodeInApp: false
      });
      setSuccess('Password reset email sent! Please check your inbox. After resetting your password, you will be redirected to the login page.');
      setCountdown(5); // Start 5 second countdown
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  // Countdown effect to redirect to login page
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          router.push('/auth/signin');
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-indigo-700 mb-2 text-center">Reset Password</h2>
        <p className="text-gray-600 mb-6 text-center">Enter your email address and we'll send you a link to reset your password.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200">
            <p className="font-medium mb-2">✅ Password reset email sent!</p>
            <p className="text-sm text-green-700 mb-3">
              Please check your inbox (and spam folder) and click the reset link. After setting your new password, 
              you'll be redirected to the login page where you can sign in with your new password.
            </p>
            {countdown > 0 && (
              <p className="text-sm text-green-600 font-medium">
                Redirecting to login page in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            )}
          </div>
        )}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
            disabled={loading || !email}
          >
            {loading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/auth/signin" className="text-indigo-600 hover:underline text-sm">Back to Sign In</Link>
          {success && (
            <div className="mt-3">
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm bg-indigo-50 px-3 py-1 rounded-md hover:bg-indigo-100 transition-colors"
              >
                Go to Login Page Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 