import React, { useState } from 'react';
import { User } from '../../types';

interface SecuritySectionProps {
  user: User;
  onAccountDelete: () => Promise<void>;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({ user, onAccountDelete }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await onAccountDelete();
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Neznámé';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Account Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Informace o účtu
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Způsob přihlášení:
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔐</span>
              <span className="text-sm text-gray-900 dark:text-white">
                Google Sign-In
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {user.email}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Účet vytvořen:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {formatDate(null)} {/* Firebase creationTime would go here */}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Poslední přihlášení:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {formatDate(null)} {/* Firebase lastSignInTime would go here */}
            </span>
          </div>
        </div>
      </div>

      {/* Password Management */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Správa hesla
        </h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-xl mt-0.5">ℹ️</span>
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Heslo spravuje Google
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Protože používáte Google Sign-In, vaše heslo je spravováno přímo Googlem. 
                Pro změnu hesla navštivte nastavení vašeho Google účtu.
              </p>
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
              >
                Otevřít nastavení Google účtu
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Account Deletion */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Smazání účtu
        </h3>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-red-500 text-xl mt-0.5">⚠️</span>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900 dark:text-red-100">
                Trvalé smazání účtu
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Smazání účtu je nevratné. Všechna vaše data, včetně pokroku ve studiu, 
                odznaků a nastavení budou trvale odstraněna.
              </p>
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Smazat účet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDeleteConfirmation(false)}
            />

            {/* Modal */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                  <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Smazat účet
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Opravdu chcete smazat svůj účet? Tato akce je nevratná a všechna vaše data budou trvale odstraněna.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Pro potvrzení budete přesměrováni na Google pro reauthentizaci.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    isDeleting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {isDeleting ? 'Mazání...' : 'Smazat účet'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmation(false)}
                  disabled={isDeleting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Zrušit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySection;