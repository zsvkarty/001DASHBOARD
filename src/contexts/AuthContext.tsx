import React from 'react';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useAuth = () => {
  return {
    currentUser: null,
    loading: false,
    signInWithGoogle: async () => {},
    logout: async () => {}
  };
};

export default {};