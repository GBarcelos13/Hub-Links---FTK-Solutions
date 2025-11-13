import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock credentials
const MOCK_USERS = {
  admin: { password: 'admin123', role: 'admin' as const },
  user: { password: 'user123', role: 'user' as const },
  'gabriel': { password: 'gabriel123', role: 'user' as const },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const mockUser = MOCK_USERS[username as keyof typeof MOCK_USERS];
    
    if (mockUser && mockUser.password === password) {
      setUser({ username, role: mockUser.role });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
