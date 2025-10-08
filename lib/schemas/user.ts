/** User interface to reuse in schemas **/ 
export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    // role: string;
    balance: string;
};

/** User State type to reuse in forms **/ 
export type UserState = {
    errors?: {
        email?: string[];
        password?: string[];
    };
    message?: string | null;
    formData?: {             // Add this property
        name?: string;
        email?: string;
        password?: string;
    };
};

/** Initial state for registration form validation and error handling */
export const initialUserState: UserState = { 
  message: null, 
  errors: {},
  formData: undefined 
};
  