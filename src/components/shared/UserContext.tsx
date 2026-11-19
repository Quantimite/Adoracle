'use client';

import React, { createContext, useContext } from 'react';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

const UserContext = createContext<CurrentUser>({ id: '', name: 'Guest', email: '' });

export function UserProvider({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useCurrentUser = () => useContext(UserContext);

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function firstNameOf(name: string) {
  return name.trim().split(/\s+/)[0] || 'there';
}
