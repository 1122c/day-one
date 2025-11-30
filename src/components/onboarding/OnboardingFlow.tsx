import { useState } from 'react';
import { useForm, useFieldArray, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, UserValues, SocialProfile } from '@/types/user';
import { generateBioSuggestion, generateProfileCompletionSuggestions, generateValueInsights } from '@/services/profileEnhancementService';
import { FiLinkedin, FiTwitter, FiInstagram, FiMusic, FiX, FiEye, FiHeart, FiCheck, FiMapPin, FiCalendar, FiTarget, FiUsers, FiBookOpen, FiGlobe } from 'react-icons/fi';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { updateUserProfile } from '@/services/firebaseService';
import { useRouter } from 'next/router';
import ProfileReview from './ProfileReview';

const onboardingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  age: z.string().optional(),
  location: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  interests: z.array(z.string()).optional(),
  coreValues: z.array(z.string()).min(1, 'Select at least 1 core value'),
  personalGoals: z.array(z.string()).min(1, 'Select at least 1 personal goal'),
  preferredCommunication: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  preferredTimes: z.array(z.string()).optional(),
  availability: z.string().optional(),
  socialProfiles: z
    .array(
      z.object({
        platform: z.enum(['linkedin', 'twitter', 'instagram', 'tiktok', 'onlyfans', 'facebook', 'youtube', 'discord']),
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
  'Creativity',
  'Leadership',
  'Learning',
  'Community',
  'Adventure',
  'Stability',
  'Excellence',
  'Compassion',
  'Integrity',
  'Respect',
  'Trust',
  'Kindness',
  'Optimism',
  'Resilience',
  'Curiosity',
  'Independence',
  'Family',
  'Freedom',
  'Justice',
  'Equality',
  'Sustainability',
  'Wellness',
  'Spirituality',
  'Ambition',
  'Discipline',
  'Patience',
  'Humility',
  'Gratitude',
  'Loyalty',
  'Courage',
  'Wisdom',
  'Passion',
  'Service',
  'Tradition',
  'Progress',
  'Harmony',
  'Simplicity',
  'Achievement',
  'Security',
  'Fun',
  'Romance',
];

const personalGoalsOptions = [
  'Professional Networking',
  'Mentorship',
  'Friendship',
  'Collaboration',
  'Learning',
  'Support',
  'Career Growth',
  'Skill Development',
  'Business Partnership',
  'Creative Projects',
  'Personal Development',
  'Community Building',
  'Travel & Adventure',
  'Health & Wellness',
  'Financial Success',
  'Social Impact',
];

const communicationOptions = [
  'Video Calls',
  'Text Chat',
  'Voice Calls',
  'In-Person Meetings',
  'Email',
  'Social Media',
  'Group Chats',
  'Workshops',
  'Conferences',
  'Coffee Meetings',
];

const timeOptions = [
  'Early Morning (6-9 AM)',
  'Morning (9 AM-12 PM)',
  'Afternoon (12-5 PM)',
  'Evening (5-9 PM)',
  'Late Evening (9 PM-12 AM)',
  'Weekends',
  'Weekdays',
  'Flexible',
];

const availabilityOptions = [
  'Very Available (Multiple times per week)',
  'Moderately Available (Weekly)',
  'Occasionally Available (Bi-weekly)',
  'Limited Availability (Monthly)',
  'On-Demand',
];

const interestOptions = [
  'Technology',
  'Business',
  'Arts & Culture',
  'Sports & Fitness',
  'Travel',
  'Food & Cooking',
  'Music',
  'Reading',
  'Gaming',
  'Photography',
  'Writing',
  'Science',
  'History',
  'Languages',
  'Volunteering',
  'Environment',
  'Health & Wellness',
  'Fashion',
  'Automotive',
  'Finance',
  'Education',
  'Politics',
  'Philosophy',
  'Psychology',
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Healthcare',
  'Law',
  'Real Estate',
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
        { platform: 'onlyfans', username: '', url: '' },
        { platform: 'facebook', username: '', url: '' },
        { platform: 'youtube', username: '', url: '' },
        { platform: 'discord', username: '', url: '' },
      ],
      interests: [],
      age: '',
      location: '',
      occupation: '',
      education: '',
      availability: '',
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
      case 'facebook':
        return <FiUsers className="h-6 w-6 text-blue-500" />;
      case 'youtube':
        return <FiBookOpen className="h-6 w-6 text-red-600" />;
      case 'discord':
        return <FiGlobe className="h-6 w-6 text-indigo-500" />;
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
      case 'facebook':
        return 'bg-blue-50';
      case 'youtube':
        return 'bg-red-50';
      case 'discord':
        return 'bg-indigo-50';
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
      case 'facebook':
        return `https://facebook.com/${username}`;
      case 'youtube':
        return `https://youtube.com/@${username}`;
      case 'discord':
        return `https://discord.gg/${username}`;
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
          preferredCommunication: data.preferredCommunication || [],
          availability: {
            timezone: data.timezone || '',
            preferredTimes: data.preferredTimes || [],
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await updateUserProfile(user.uid, userProfile);
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
                Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age (Optional)
              </label>
              <input
                type="number"
                id="age"
                {...register('age')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter your age"
                min="18"
                max="120"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location (Optional)
              </label>
              <div className="mt-1 relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  id="location"
                  {...register('location')}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="City, State/Country"
                />
              </div>
            </div>

            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                Occupation (Optional)
              </label>
              <input
                type="text"
                id="occupation"
                {...register('occupation')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Software Engineer, Teacher, Entrepreneur"
              />
            </div>

            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                Education (Optional)
              </label>
              <input
                type="text"
                id="education"
                {...register('education')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Bachelor's in Computer Science, Self-taught"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                rows={4}
                {...register('bio')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Tell us about yourself, your interests, and what you're looking for... (optional)"
              />
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
                  <button
                    type="button"
                    onClick={() => setValue('bio', '')}
                    className="mt-2 ml-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear bio
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
                Core Values *
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Select at least one core value that resonates with you.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {coreValuesOptions.map((value) => (
                  <label key={value} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={value}
                      checked={watch('coreValues')?.includes(value) || false}
                      onChange={(e) => {
                        const currentValues = watch('coreValues') || [];
                        if (e.target.checked) {
                          setValue('coreValues', [...currentValues, value]);
                        } else {
                          setValue('coreValues', currentValues.filter(v => v !== value));
                        }
                      }}
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
                Personal Goals *
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Select at least one personal goal that you're working towards.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {personalGoalsOptions.map((goal) => (
                  <label key={goal} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={goal}
                      checked={watch('personalGoals')?.includes(goal) || false}
                      onChange={(e) => {
                        const currentValues = watch('personalGoals') || [];
                        if (e.target.checked) {
                          setValue('personalGoals', [...currentValues, goal]);
                        } else {
                          setValue('personalGoals', currentValues.filter(v => v !== goal));
                        }
                      }}
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
                Preferred Communication (Optional)
              </label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {communicationOptions.map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      aria-label={option}
                      checked={watch('preferredCommunication')?.includes(option) || false}
                      onChange={(e) => {
                        const currentValues = watch('preferredCommunication') || [];
                        if (e.target.checked) {
                          setValue('preferredCommunication', [...currentValues, option]);
                        } else {
                          setValue('preferredCommunication', currentValues.filter(v => v !== option));
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Timezone (Optional)
              </label>
              <select
                id="timezone"
                {...register('timezone')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select timezone (optional)</option>
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
                <option value="CST">CST</option>
                <option value="MST">MST</option>
                <option value="GMT">GMT</option>
                <option value="CET">CET</option>
                <option value="JST">JST</option>
                <option value="AEST">AEST</option>
                {/* Add more timezones as needed */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Times (Optional)
              </label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {timeOptions.map((time) => (
                  <label key={time} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={time}
                      aria-label={time}
                      checked={watch('preferredTimes')?.includes(time) || false}
                      onChange={(e) => {
                        const currentValues = watch('preferredTimes') || [];
                        if (e.target.checked) {
                          setValue('preferredTimes', [...currentValues, time]);
                        } else {
                          setValue('preferredTimes', currentValues.filter(v => v !== time));
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                General Availability (Optional)
              </label>
              <select
                {...register('availability')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select your general availability</option>
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Interests & Hobbies (Optional)
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Select topics that interest you to help find like-minded connections.
              </p>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {interestOptions.map((interest) => (
                  <label key={interest} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={interest}
                      checked={watch('interests')?.includes(interest) || false}
                      onChange={(e) => {
                        const currentValues = watch('interests') || [];
                        if (e.target.checked) {
                          setValue('interests', [...currentValues, interest]);
                        } else {
                          setValue('interests', currentValues.filter(v => v !== interest));
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm">{interest}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 6:
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
                    if (currentProfiles.length < 8) {
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
      case 7:
        return (
          <ProfileReview
            profile={reviewData!}
            onEdit={() => setStep(6)}
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
        <h1 className="text-3xl font-bold text-gray-900">Welcome to WeNetwork</h1>
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
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <div
                  key={s}
                  className={`flex items-center ${s !== 7 ? 'flex-1' : ''
                    }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${s <= step
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {s}
                  </div>
                  {s !== 7 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${s < step ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {step === 1 && 'Basic Information'}
                {step === 2 && 'Core Values'}
                {step === 3 && 'Personal Goals'}
                {step === 4 && 'Communication & Availability (All Optional)'}
                {step === 5 && 'Interests & Hobbies'}
                {step === 6 && 'Social Profiles'}
                {step === 7 && 'Review & Complete'}
              </h2>
              <p className="text-gray-600 mt-2">
                {step === 1 && 'Tell us about yourself'}
                {step === 2 && 'What values drive you?'}
                {step === 3 && 'What are you looking to achieve?'}
                {step === 4 && 'How do you prefer to connect? (All fields optional)'}
                {step === 5 && 'What interests you?'}
                {step === 6 && 'Connect your social presence'}
                {step === 7 && 'Review your profile before saving'}
              </p>
            </div>

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

            {step < 7 && (
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
                      valid = await trigger(['name']);
                    } else if (step === 2) {
                      valid = await trigger(['coreValues']);
                    } else if (step === 3) {
                      valid = await trigger(['personalGoals']);
                    } else if (step === 4) {
                      valid = true; // All fields are optional in step 4
                    } else if (step === 5) {
                      valid = await trigger(['interests']);
                    } else if (step === 6) {
                      valid = await trigger(['socialProfiles']);
                      if (valid) {
                        // Prepare review data when moving from step 6 to step 7
                        const formData = watch();
                        setReviewData({
                          id: user?.uid,
                          email: user?.email || '',
                          name: formData.name,
                          bio: formData.bio || '',
                          age: formData.age || '',
                          location: formData.location || '',
                          occupation: formData.occupation || '',
                          education: formData.education || '',
                          interests: formData.interests || [],
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
                            preferredCommunication: formData.preferredCommunication || [],
                            availability: {
                              timezone: formData.timezone || '',
                              preferredTimes: formData.preferredTimes || [],
                              availability: formData.availability || '',
                            },
                          },
                        });
                      }
                    } else if (step === 7) {
                      // Review step is always valid
                      valid = true;
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