
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  useUser,
  useAuth as useFirebaseAuth,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import {
  initiateEmailSignIn,
  initiateEmailSignUp,
} from '@/firebase/non-blocking-login';
import { User, onIdTokenChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User as AppUser, UserRole } from '@/lib/types';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => void;
  signup: (
    email: string,
    pass: string,
    name: string,
    designation: string,
    department: string,
    role: UserRole
  ) => void;
  signInWithGoogle: (role?: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      return;
    }
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          setUser(userData);
        } else {
          // This can happen if a user signs in with Google for the first time
          // The creation logic is handled in signInWithGoogle
           console.log("User exists in Auth, but not in Firestore. They might be signing up.");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [auth, firestore]);

  const login = (email: string, pass: string) => {
    initiateEmailSignIn(auth, email, pass);
  };

  const signup = (
    email: string,
    pass: string,
    name: string,
    designation: string,
    department: string,
    role: UserRole
  ) => {
    initiateEmailSignUp(auth, email, pass).then(async (userCredential) => {
       if (userCredential && userCredential.user) {
         const user = userCredential.user;
         const newUser: AppUser = {
            id: user.uid,
            name,
            email,
            designation,
            department,
            role,
            avatar: `https://i.pravatar.cc/150?u=${user.uid}`,
            dateOfJoining: new Date().toISOString(),
            salary: 0,
            status: 'Active',
         };
         await setDoc(doc(firestore, "users", user.uid), newUser);
         setUser(newUser);
       }
    })
  };

   const signInWithGoogle = async (role: UserRole = 'employee') => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // New user, create a document for them
        const newUser: AppUser = {
          id: user.uid,
          name: user.displayName || 'New User',
          email: user.email || '',
          role: role, // Assign role from signup form, default to employee
          avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
          dateOfJoining: new Date().toISOString(),
          salary: 0,
          status: 'Active',
          designation: role === 'admin' ? 'Administrator' : '',
          department: role === 'admin' ? 'IT' : '',
        };
        await setDoc(userDocRef, newUser);
        setUser(newUser);
      } else {
        setUser(userDoc.data() as AppUser);
      }
       router.push('/dashboard');
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  const logout = () => {
    auth.signOut();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
