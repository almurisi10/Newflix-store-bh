import React, { createContext, useContext, useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';

interface EditModeContextType {
  editMode: boolean;
  toggleEditMode: () => void;
  canEdit: boolean;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const { isAdminAuthenticated } = useAdminAuth();

  const toggleEditMode = () => {
    if (isAdminAuthenticated) {
      setEditMode(prev => !prev);
    }
  };

  return (
    <EditModeContext.Provider value={{ editMode: editMode && isAdminAuthenticated, toggleEditMode, canEdit: isAdminAuthenticated }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) throw new Error('useEditMode must be used within EditModeProvider');
  return context;
}
