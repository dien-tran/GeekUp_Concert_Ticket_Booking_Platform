import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CategoryContextType {
  selectedCategoryId: string | null;
  selectedCategoryName: string | null;
  setSelectedCategory: (id: string | null, name: string | null) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  const setSelectedCategory = (id: string | null, name: string | null) => {
    setSelectedCategoryId(id);
    setSelectedCategoryName(name);
  };

  return (
    <CategoryContext.Provider value={{ selectedCategoryId, selectedCategoryName, setSelectedCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) throw new Error('useCategory must be used within a CategoryProvider');
  return context;
};
