import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Define what user data looks like
interface UserData {
  fullName: string;
  email: string;
  uid: string;
}

// Define what the context provides
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  isLoading: boolean;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Props for the provider component
interface UserProviderProps {
  children: ReactNode;
}

// The provider component that wraps the app
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserData(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: UserContextType = {
    user,
    setUser,
    userData,
    setUserData,
    isLoading,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;