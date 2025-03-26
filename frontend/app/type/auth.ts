  export interface User {
    token: string;
    email?: string;
    name?: string;
  }
  
  export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
  }