import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/router';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export default function OnboardingPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  // If still loading auth state, show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // If no user is authenticated, redirect to signin
  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="text-2xl font-extrabold text-indigo-600 tracking-tight">
                WeNetwork
              </div>
              <div className="ml-4 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                Complete Your Profile
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Step 2 of 2: Profile Setup
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Content */}
      <div className="w-full py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Welcome to WeNetwork!
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Let's get to know you better so we can help you find meaningful connections. 
            This will only take a few minutes.
          </p>
        </div>
        
        <OnboardingFlow />
      </div>
    </div>
  );
}
