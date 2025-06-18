import { useState, useEffect } from 'react';
import { UserProfile } from '@/types/user';
import { FiEye, FiEyeOff, FiLock, FiUnlock, FiShield, FiSettings, FiInfo, FiMessageSquare } from 'react-icons/fi';

interface AdvancedPrivacyControlsProps {
  userProfile: UserProfile;
  onUpdatePrivacy: (privacy: UserProfile['privacy']) => void;
}

interface PrivacyCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  settings: PrivacySetting[];
}

interface PrivacySetting {
  id: keyof UserProfile['privacy'];
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'radio';
  options?: { value: string; label: string; description?: string }[];
  category: 'basic' | 'advanced' | 'communication';
}

export default function AdvancedPrivacyControls({
  userProfile,
  onUpdatePrivacy,
}: AdvancedPrivacyControlsProps) {
  const [privacy, setPrivacy] = useState(userProfile.privacy);
  const [activeCategory, setActiveCategory] = useState('profile');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const privacyCategories: PrivacyCategory[] = [
    {
      id: 'profile',
      title: 'Profile Visibility',
      description: 'Control who can see your profile information',
      icon: FiEye,
      settings: [
        {
          id: 'profileVisibility',
          label: 'Profile Visibility',
          description: 'Choose who can see your profile',
          type: 'select',
          options: [
            { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
            { value: 'matches', label: 'Matches Only', description: 'Only your matches can see your profile' },
            { value: 'private', label: 'Private', description: 'Only you can see your profile' },
          ],
          category: 'basic',
        },
        {
          id: 'showEmail',
          label: 'Show Email Address',
          description: 'Allow others to see your email address',
          type: 'toggle',
          category: 'basic',
        },
        {
          id: 'showSocialProfiles',
          label: 'Show Social Profiles',
          description: 'Display your social media links',
          type: 'toggle',
          category: 'basic',
        },
      ],
    },
    {
      id: 'communication',
      title: 'Communication Settings',
      description: 'Manage how others can interact with you',
      icon: FiMessageSquare,
      settings: [
        {
          id: 'allowMessaging',
          label: 'Allow Direct Messages',
          description: 'Let others send you messages',
          type: 'toggle',
          category: 'basic',
        },
        {
          id: 'showOnlineStatus',
          label: 'Show Online Status',
          description: 'Display when you are online',
          type: 'toggle',
          category: 'communication',
        },
      ],
    },
    {
      id: 'advanced',
      title: 'Advanced Privacy',
      description: 'Fine-tune your privacy settings',
      icon: FiShield,
      settings: [
        {
          id: 'showReadReceipts',
          label: 'Show Read Receipts',
          description: 'Let others know when you read their messages',
          type: 'toggle',
          category: 'advanced',
        },
        {
          id: 'showTypingIndicators',
          label: 'Show Typing Indicators',
          description: 'Display when you are typing',
          type: 'toggle',
          category: 'advanced',
        },
        {
          id: 'allowProfileViews',
          label: 'Allow Profile Views',
          description: 'Let others see when you view their profiles',
          type: 'toggle',
          category: 'advanced',
        },
      ],
    },
  ];

  useEffect(() => {
    setPrivacy(userProfile.privacy);
  }, [userProfile.privacy]);

  const handleSettingChange = (settingId: keyof UserProfile['privacy'], value: any) => {
    const newPrivacy = { ...privacy, [settingId]: value };
    setPrivacy(newPrivacy);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdatePrivacy(privacy);
    setHasChanges(false);
  };

  const handleReset = () => {
    setPrivacy(userProfile.privacy);
    setHasChanges(false);
  };

  const getCurrentCategory = () => {
    return privacyCategories.find(cat => cat.id === activeCategory) || privacyCategories[0];
  };

  const getFilteredSettings = () => {
    const category = getCurrentCategory();
    return category.settings.filter(setting => 
      showAdvanced || setting.category === 'basic'
    );
  };

  const renderSetting = (setting: PrivacySetting) => {
    const value = privacy[setting.id];

    switch (setting.type) {
      case 'toggle':
        return (
          <div key={setting.id} className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-900">{setting.label}</label>
                <button className="text-gray-400 hover:text-gray-600">
                  <FiInfo className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
            </div>
            <button
              onClick={() => handleSettingChange(setting.id, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                value ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        );

      case 'select':
        return (
          <div key={setting.id} className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <label className="text-sm font-medium text-gray-900">{setting.label}</label>
              <button className="text-gray-400 hover:text-gray-600">
                <FiInfo className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
            <div className="space-y-2">
              {setting.options?.map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={setting.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                    {option.description && (
                      <p className="text-xs text-gray-500">{option.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiSettings className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {privacyCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeCategory === category.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {getCurrentCategory().title}
          </h4>
          <p className="text-sm text-gray-600">
            {getCurrentCategory().description}
          </p>
        </div>

        <div className="space-y-2">
          {getFilteredSettings().map(renderSetting)}
        </div>

        {getFilteredSettings().length === 0 && (
          <div className="text-center py-8">
            <FiShield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No advanced settings</h3>
            <p className="mt-2 text-gray-600">
              Enable advanced settings to see more privacy options.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">You have unsaved changes</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Tips */}
      <div className="px-6 py-4 bg-blue-50 border-t border-blue-200">
        <div className="flex items-start space-x-3">
          <FiInfo className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Privacy Tips</h4>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Start with more restrictive settings and gradually open up as you build trust</li>
              <li>• Regularly review your privacy settings to ensure they match your comfort level</li>
              <li>• Consider your goals - more visibility can lead to more connections</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 