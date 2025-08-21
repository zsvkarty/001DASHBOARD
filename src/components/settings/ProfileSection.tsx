import React, { useState } from 'react';
import { User } from '../../types';
import FormField from './FormField';
import { ProfileData } from '../../services/profileService';

interface ProfileSectionProps {
  user: User;
  onProfileUpdate: (data: Partial<ProfileData>) => Promise<void>;
}



const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onProfileUpdate }) => {
  const [formData, setFormData] = useState<ProfileData>({
    displayName: user.name,
    email: user.email,
    photoURL: user.avatar,
    studyGoals: {
      dailyFlashcards: user.studyGoals.dailyFlashcards,
      weeklyHours: user.studyGoals.weeklyHours
    }
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData | 'dailyFlashcards' | 'weeklyHours', string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate display name
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Jméno je povinné';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Jméno musí mít alespoň 2 znaky';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email je povinný';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Neplatný formát emailu';
    }

    // Validate study goals
    if (formData.studyGoals.dailyFlashcards < 1 || formData.studyGoals.dailyFlashcards > 100) {
      newErrors.dailyFlashcards = 'Počet karet musí být mezi 1 a 100';
    }

    if (formData.studyGoals.weeklyHours < 1 || formData.studyGoals.weeklyHours > 50) {
      newErrors.weeklyHours = 'Počet hodin musí být mezi 1 a 50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      await onProfileUpdate(formData);
      setSuccessMessage('Profil byl úspěšně aktualizován');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ displayName: 'Nepodařilo se aktualizovat profil. Zkuste to znovu.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll just create a preview URL
      // In a real app, you'd upload to Firebase Storage
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            photoURL: event.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
        </div>
      )}

      {/* Profile Picture */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-200 dark:ring-gray-700"
            src={formData.photoURL}
            alt="Profile"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName)}&background=3b82f6&color=fff`;
            }}
          />
          <label
            htmlFor="profile-photo"
            className="absolute inset-0 w-20 h-20 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <span className="text-white text-sm">Změnit</span>
          </label>
          <input
            id="profile-photo"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="sr-only"
          />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profilová fotka</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Klikněte na obrázek pro změnu fotky
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Jméno"
          id="displayName"
          value={formData.displayName}
          onChange={(value) => setFormData(prev => ({ ...prev, displayName: value }))}
          error={errors.displayName}
          required
          placeholder="Vaše jméno"
        />

        <FormField
          label="Email"
          id="email"
          type="email"
          value={formData.email}
          onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
          error={errors.email}
          required
          placeholder="vas@email.cz"
          helpText="Email nelze změnit u Google účtů"
          disabled={true} // Email is managed by Google
        />
      </div>

      {/* Study Goals */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Studijní cíle</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Denní cíl - flashkarty"
            id="dailyFlashcards"
            type="number"
            value={formData.studyGoals.dailyFlashcards}
            onChange={(value) => setFormData(prev => ({
              ...prev,
              studyGoals: { ...prev.studyGoals, dailyFlashcards: parseInt(value) || 0 }
            }))}
            error={errors.dailyFlashcards}
            placeholder="20"
            helpText="Kolik karet chcete studovat denně"
          />

          <FormField
            label="Týdenní cíl - hodiny"
            id="weeklyHours"
            type="number"
            value={formData.studyGoals.weeklyHours}
            onChange={(value) => setFormData(prev => ({
              ...prev,
              studyGoals: { ...prev.studyGoals, weeklyHours: parseInt(value) || 0 }
            }))}
            error={errors.weeklyHours}
            placeholder="5"
            helpText="Kolik hodin chcete studovat týdně"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`
            px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            ${isLoading
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {isLoading ? 'Ukládám...' : 'Uložit změny'}
        </button>
      </div>
    </form>
  );
};

export default ProfileSection;