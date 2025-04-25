import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, UserValues } from '@/types/user';

const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  coreValues: z.array(z.string()).min(3, 'Select at least 3 core values'),
  personalGoals: z.array(z.string()).min(2, 'Select at least 2 personal goals'),
  preferredCommunication: z.array(z.string()).min(1, 'Select at least 1 communication preference'),
  timezone: z.string(),
  preferredTimes: z.array(z.string()).min(1, 'Select at least 1 preferred time'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const coreValuesOptions = [
  'Authenticity',
  'Growth',
  'Connection',
  'Empathy',
  'Innovation',
  'Collaboration',
  'Balance',
  'Purpose',
];

const personalGoalsOptions = [
  'Professional Networking',
  'Mentorship',
  'Friendship',
  'Collaboration',
  'Learning',
  'Support',
];

const communicationOptions = [
  'Video Calls',
  'Text Chat',
  'Voice Calls',
  'In-Person Meetings',
];

const timeOptions = [
  'Morning',
  'Afternoon',
  'Evening',
  'Weekends',
];

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (data: OnboardingFormData) => {
    // TODO: Save user profile to Firebase
    console.log(data);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                {...register('bio')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.bio && (
                <p className="mt-2 text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Core Values
              </label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {coreValuesOptions.map((value) => (
                  <label key={value} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={value}
                      {...register('coreValues')}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">{value}</span>
                  </label>
                ))}
              </div>
              {errors.coreValues && (
                <p className="mt-2 text-sm text-red-600">{errors.coreValues.message}</p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Personal Goals
              </label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {personalGoalsOptions.map((goal) => (
                  <label key={goal} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={goal}
                      {...register('personalGoals')}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">{goal}</span>
                  </label>
                ))}
              </div>
              {errors.personalGoals && (
                <p className="mt-2 text-sm text-red-600">{errors.personalGoals.message}</p>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Communication
              </label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {communicationOptions.map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      {...register('preferredCommunication')}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
              {errors.preferredCommunication && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.preferredCommunication.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Timezone
              </label>
              <select
                id="timezone"
                {...register('timezone')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
                {/* Add more timezones as needed */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Times
              </label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {timeOptions.map((time) => (
                  <label key={time} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={time}
                      {...register('preferredTimes')}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">{time}</span>
                  </label>
                ))}
              </div>
              {errors.preferredTimes && (
                <p className="mt-2 text-sm text-red-600">{errors.preferredTimes.message}</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to ConnectMind</h1>
        <p className="mt-2 text-gray-600">
          Let's get to know you better to help create meaningful connections.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex items-center ${
                  s !== 4 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    s <= step
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s !== 4 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      s < step ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Previous
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Complete Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 