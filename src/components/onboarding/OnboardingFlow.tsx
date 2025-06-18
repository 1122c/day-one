import { useState } from 'react';
import { useForm, useFieldArray, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, UserValues, SocialProfile } from '@/types/user';
import { generateBioSuggestion, generateProfileCompletionSuggestions, generateValueInsights } from '@/services/profileEnhancementService';
import { FiLinkedin, FiTwitter, FiInstagram, FiMusic, FiX, FiEye, FiHeart, FiCheck } from 'react-icons/fi';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { saveUserProfile } from '@/services/firebaseService';
import { useRouter } from 'next/router';
import ProfileReview from './ProfileReview';

const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  coreValues: z.array(z.string()).min(3, 'Select at least 3 core values'),
  personalGoals: z.array(z.string()).min(2, 'Select at least 2 personal goals'),
  preferredCommunication: z.array(z.string()).min(1, 'Select at least 1 communication preference'),
  timezone: z.string(),
  preferredTimes: z.array(z.string()).min(1, 'Select at least 1 preferred time'),
  socialProfiles: z
    .array(
      z.object({
        platform: z.enum(['linkedin', 'twitter', 'instagram', 'tiktok', 'onlyfans']),
        url: z.string().optional(),
        username: z.string().optional(),
      })
    )
    .optional()
    .transform((profiles) => 
      profiles?.filter(profile => profile.username && profile.username.trim().length > 0) || []
    ),
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
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    bio?: string;
    insights?: string;
    suggestions?: string[];
  }>({});
  const [previewProfile, setPreviewProfile] = useState<number | null>(null);
  const [reviewData, setReviewData] = useState<Partial<UserProfile> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
    trigger,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      socialProfiles: [
        { platform: 'linkedin', username: '', url: '' },
        { platform: 'twitter', username: '', url: '' },
        { platform: 'instagram', username: '', url: '' },
        { platform: 'tiktok', username: '', url: '' },
      ],
    },
  });

  const { fields, remove } = useFieldArray({
    control,
    name: 'socialProfiles',
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <FiLinkedin className="h-6 w-6 text-blue-600" />;
      case 'twitter':
        return <FiTwitter className="h-6 w-6 text-sky-600" />;
      case 'instagram':
        return <FiInstagram className="h-6 w-6 text-pink-600" />;
      case 'tiktok':
        return <FiMusic className="h-6 w-6 text-black" />;
      case 'onlyfans':
        return <FiHeart className="h-6 w-6 text-pink-500" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return 'bg-blue-100';
      case 'twitter':
        return 'bg-sky-100';
      case 'instagram':
        return 'bg-pink-100';
      case 'tiktok':
        return 'bg-gray-100';
      case 'onlyfans':
        return 'bg-pink-50';
      default:
        return 'bg-gray-100';
    }
  };

  const getPlatformUrl = (platform: string, username: string) => {
    switch (platform) {
      case 'linkedin':
        return `https://linkedin.com/in/${username}`;
      case 'twitter':
        return `https://twitter.com/${username}`;
      case 'instagram':
        return `https://instagram.com/${username}`;
      case 'tiktok':
        return `https://tiktok.com/@${username}`;
      case 'onlyfans':
        return `https://onlyfans.com/${username}`;
      default:
        return '';
    }
  };

  const generateSuggestions = async (data: Partial<OnboardingFormData>) => {
    setIsGenerating(true);
    try {
      if (data.coreValues && data.personalGoals && data.preferredCommunication) {
        const values: UserValues = {
          coreValues: data.coreValues,
          personalGoals: data.personalGoals,
          preferredCommunication: data.preferredCommunication,
          availability: {
            timezone: data.timezone || 'UTC',
            preferredTimes: data.preferredTimes || [],
          },
        };

        const [bioSuggestion, insights] = await Promise.all([
          generateBioSuggestion(values),
          generateValueInsights(values),
        ]);

        setAiSuggestions({
          bio: bioSuggestion,
          insights,
        });
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) {
      setSubmitError('You must be logged in to save your profile');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const userProfile: Partial<UserProfile> = {
        id: user.uid,
        email: user.email || '',
        name: data.name,
        bio: data.bio,
        socialProfiles: data.socialProfiles
          ?.filter(profile => profile.username && profile.username.length > 0)
          .map(profile => ({
            ...profile,
            username: profile.username as string,
            url: profile.url || getPlatformUrl(profile.platform, profile.username as string),
          })),
        values: {
          coreValues: data.coreValues,
          personalGoals: data.personalGoals,
          preferredCommunication: data.preferredCommunication,
          availability: {
            timezone: data.timezone,
            preferredTimes: data.preferredTimes,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await saveUserProfile(user.uid, userProfile);
      setSubmitSuccess(true);
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSubmitError('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (reviewData) {
      // Convert reviewData to the format expected by onSubmit
      const formData: OnboardingFormData = {
        name: reviewData.name || '',
        bio: reviewData.bio || '',
        coreValues: reviewData.values?.coreValues || [],
        personalGoals: reviewData.values?.personalGoals || [],
        preferredCommunication: reviewData.values?.preferredCommunication || [],
        timezone: reviewData.values?.availability?.timezone || 'UTC',
        preferredTimes: reviewData.values?.availability?.preferredTimes || [],
        socialProfiles: reviewData.socialProfiles || [],
      };
      
      await onSubmit(formData);
    }
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
              {aiSuggestions.bio && (
                <div className="mt-2 p-4 bg-indigo-50 rounded-md">
                  <p className="text-sm text-indigo-700 font-medium mb-2">AI Suggestion:</p>
                  <p className="text-sm text-indigo-600">{aiSuggestions.bio}</p>
                  <button
                    type="button"
                    onClick={() => setValue('bio', aiSuggestions.bio || '')}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Use this suggestion
                  </button>
                </div>
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
                      aria-label={option}
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
                      aria-label={time}
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
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Social Profiles (Optional)</h3>
              <p className="text-sm text-gray-600 mb-6">
                Add your social profiles to help others connect with you.
              </p>
              
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="relative">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${getPlatformColor(field.platform)}`}>
                        {getPlatformIcon(field.platform)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700 capitalize">
                            {field.platform} Profile
                          </label>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => setPreviewProfile(index)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Preview Profile"
                            >
                              <FiEye className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-gray-400 hover:text-red-600"
                              title="Remove Profile"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Username"
                            {...register(`socialProfiles.${index}.username`)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <input
                            type="url"
                            placeholder="Profile URL (optional)"
                            {...register(`socialProfiles.${index}.url`)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preview Modal */}
                    {previewProfile === index && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 capitalize">
                              {field.platform} Profile Preview
                            </h3>
                            <button
                              onClick={() => setPreviewProfile(null)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getPlatformColor(field.platform)}`}>
                                {getPlatformIcon(field.platform)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  @{watch(`socialProfiles.${index}.username`)}
                                </p>
                                <a
                                  href={getPlatformUrl(field.platform, watch(`socialProfiles.${index}.username`) || '')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                  View Profile
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const currentProfiles = watch('socialProfiles') || [];
                    if (currentProfiles.length < 4) {
                      setValue('socialProfiles', [
                        ...currentProfiles,
                        { platform: 'linkedin', username: '', url: '' },
                      ]);
                    }
                  }}
                  className="mt-4 w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                >
                  Add Another Profile
                </button>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <ProfileReview
            profile={reviewData!}
            onEdit={() => setStep(5)}
            onSubmit={handleReviewSubmit}
            isSubmitting={isSubmitting}
            error={submitError}
          />
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

      {submitSuccess ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <FiCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile Created Successfully!</h2>
          <p className="text-gray-600">Redirecting you to the home page...</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={`flex items-center ${
                    s !== 6 ? 'flex-1' : ''
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
                  {s !== 6 && (
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {step < 6 && (
              <div className="flex justify-between">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    let valid = false;
                    if (step === 1) {
                      valid = await trigger(['name', 'bio']);
                    } else if (step === 2) {
                      valid = await trigger(['coreValues']);
                    } else if (step === 3) {
                      valid = await trigger(['personalGoals']);
                    } else if (step === 4) {
                      valid = await trigger(['preferredCommunication', 'timezone', 'preferredTimes']);
                    } else if (step === 5) {
                      valid = await trigger(['socialProfiles']);
                      if (valid) {
                        const formData = watch();
                        setReviewData({
                          id: user?.uid,
                          email: user?.email || '',
                          name: formData.name,
                          bio: formData.bio,
                          socialProfiles: formData.socialProfiles
                            ?.filter(profile => profile.username && profile.username.length > 0)
                            .map(profile => ({
                              ...profile,
                              username: profile.username as string,
                              url: profile.url || getPlatformUrl(profile.platform, profile.username as string),
                            })),
                          values: {
                            coreValues: formData.coreValues,
                            personalGoals: formData.personalGoals,
                            preferredCommunication: formData.preferredCommunication,
                            availability: {
                              timezone: formData.timezone,
                              preferredTimes: formData.preferredTimes,
                            },
                          },
                        });
                      }
                    }
                    if (valid) {
                      if (step === 2) {
                        generateSuggestions(watch());
                      }
                      setStep(step + 1);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  disabled={isSubmitting}
                >
                  Next
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {(isGenerating || isSubmitting) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
            <p className="mt-2 text-sm text-gray-600">
              {isGenerating ? 'Generating suggestions...' : 'Saving your profile...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 