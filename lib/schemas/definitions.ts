// This file contains type definitions for  data.
// should be migrated to each schema

export interface Category {
    createdAt?: string;
    id: string;
    name: string;
    updatedAt?: string;
    userId: string;
  };
  
export interface Tag {
    createdAt?: string;
    id?: string;
    categoryId: string;
    name: string;
    updatedAt?: string;
    userId: string;
  };
  