import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USERS, ROLE_PERMISSIONS } from '../constants/users';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { logActivity } from '../lib/logger';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (type: 'admin' | 'page' | 'action', value?: string) => boolean;
  updateUser: (data: Partial<User>) => void | Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Monitor Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser && firebaseUser.email) {
        const email = firebaseUser.email.toLowerCase().trim();
        let roleId = 'engineer'; // Default fallback
        let username = firebaseUser.displayName || email.split('@')[0];
        let profilePicture = '';
        let fullName = '';
        let phone = '';
        let bio = '';
        let department = '';
        
        try {
          // Read from Firestore users collection
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            roleId = data.role_id || data.role || roleId;
            username = data.username || username;
            profilePicture = data.profile_picture || '';
            fullName = data.fullName || '';
            phone = data.phone || '';
            bio = data.bio || '';
            department = data.department || '';
          } else {
            // Document doesn't exist in Firestore yet - let's seed it using our pre-mapped users
            const mock = MOCK_USERS.find(u => u.email.toLowerCase() === email);
            if (mock) {
              roleId = mock.role;
              username = mock.username;
            }
            
            await setDoc(userDocRef, {
              email: email,
              username: username,
              role_id: roleId,
              created_at: new Date().toISOString()
            });
            console.log(`Seeded user profile for ${email} directly in Firestore users collection with role: ${roleId}`);
          }
        } catch (dbErr) {
          console.warn("Could not retrieve or create user role in Firestore, falling back to local settings", dbErr);
          // Fallback to local MOCK_USERS mapping
          const mock = MOCK_USERS.find(u => u.email.toLowerCase() === email);
          if (mock) {
            roleId = mock.role;
            username = mock.username;
          }
        }

        const customUser: User = {
          id: firebaseUser.uid,
          email: email,
          username: username,
          roleId: roleId,
          permissions: ROLE_PERMISSIONS[roleId] || ROLE_PERMISSIONS['engineer'],
          profile_picture: profilePicture,
          fullName: fullName,
          phone: phone,
          bio: bio,
          department: department
        };

        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        setUser(customUser);
        localStorage.setItem('auth_token', idToken);
        localStorage.setItem('auth_user', JSON.stringify(customUser));
        localStorage.removeItem('auth_user_fallback');
      } else {
        // Try to hydrate from local fallback state if Firebase did not authenticate any user
        const localFallback = localStorage.getItem('auth_user_fallback');
        if (localFallback) {
          try {
            const parsed = JSON.parse(localFallback);
            setUser(parsed);
            setToken('local-fallback-token');
          } catch (e) {
            setUser(null);
            setToken(null);
          }
        } else {
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    const presetUser = MOCK_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
    
    try {
      // 1. Attempt standard Firebase sign-in
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      
      const loggedUser = MOCK_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
      if (loggedUser) {
        logActivity(
          loggedUser.username, 
          normalizedEmail, 
          'تسجيل دخول آمن', 
          `تم الدخول بنجاح عبر Firebase Auth: ${loggedUser.username}`
        );
      }
      localStorage.removeItem('auth_user_fallback');
    } catch (error: any) {
      console.warn("Firebase sign-in failed, checking auto-registration fallback", error);
      const code = error.code || "";

      // Fallback Case A: If Email/Password authentication is disabled in Firebase ("operation-not-allowed")
      if (code === 'auth/operation-not-allowed') {
        if (presetUser && presetUser.password === password) {
          const localUser: User = {
            id: `local-uid-${presetUser.email}`,
            email: presetUser.email,
            username: presetUser.username,
            roleId: presetUser.role,
            permissions: ROLE_PERMISSIONS[presetUser.role]
          };
          setUser(localUser);
          setToken('local-fallback-token');
          localStorage.setItem('auth_user_fallback', JSON.stringify(localUser));
          logActivity(
            presetUser.username,
            normalizedEmail,
            'تسجيل دخول محلي بالكامل',
            'تم تسجيل الدخول محلياً بنجاح (وضع الحماية الاحتياطي لعدم تفعيل مزود الدخول بـ Firebase)'
          );
          return;
        } else {
          throw { code: 'auth/wrong-password', message: 'Wrong credentials for local auth' };
        }
      }

      // Fallback Case B: If user is one of our preset MOCK_USERS and does not exist in Firebase Auth yet, auto-register them!
      if (presetUser && presetUser.password === password) {
        try {
          await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          
          logActivity(
            presetUser.username, 
            normalizedEmail, 
            'تسجيل حساب تلقائي آمن', 
            `تم تسجيل وتفعيل الحساب التلقائي عبر Firebase`
          );
          localStorage.removeItem('auth_user_fallback');
          return;
        } catch (createErr: any) {
          const createCode = createErr.code || "";
          
          if (createCode === 'auth/operation-not-allowed') {
            const localUser: User = {
              id: `local-uid-${presetUser.email}`,
              email: presetUser.email,
              username: presetUser.username,
              roleId: presetUser.role,
              permissions: ROLE_PERMISSIONS[presetUser.role]
            };
            setUser(localUser);
            setToken('local-fallback-token');
            localStorage.setItem('auth_user_fallback', JSON.stringify(localUser));
            return;
          }

          if (createCode === 'auth/email-already-in-use') {
            // Already registered but login rejected previously because of an invalid/mismatched password
            throw { code: 'auth/wrong-password', message: 'Invalid credentials entered' };
          }

          throw createErr;
        }
      }
      
      // Safe fallback if Firebase reports user already exists in DB but we failed because of password mismatch
      if (code === 'auth/email-already-in-use' || code === 'auth/invalid-credential') {
        throw { code: 'auth/wrong-password', message: 'Invalid credentials entered' };
      }

      throw error;
    }
  };

  const logout = async () => {
    if (user) {
      logActivity(user.username, user.email, 'تسجيل خروج آمن', 'تم إنهاء الجلسة الآمنة وسحب الصلاحيات');
    }
    localStorage.removeItem('auth_user_fallback');
    await signOut(auth);
    setUser(null);
    setToken(null);
  };

  const hasPermission = (type: 'admin' | 'page' | 'action', value?: string) => {
    if (!user || !user.permissions) return false;
    const p = user.permissions;

    if (p.isAdmin) return true;
    if (type === 'admin') return false;

    if (type === 'page' && value) {
      return p.pageAccess?.includes(value) || false;
    }

    if (type === 'action' && value) {
      const actions = (p.actions || {}) as any;
      return !!actions[value];
    }

    return false;
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      if (localStorage.getItem('auth_user_fallback')) {
        localStorage.setItem('auth_user_fallback', JSON.stringify(updatedUser));
      }

      // 1. Write metadata/image details to Firestore "users" table
      try {
        const userDocRef = doc(db, 'users', user.id);
        await setDoc(userDocRef, { ...data }, { merge: true });
        console.log("Updated user details in Firestore successfully!");
      } catch (err) {
        console.warn("Could not save profile updates to Firestore:", err);
      }

      // 2. Also register image via Express background server so session logs are synced
      try {
        if (token && data.profile_picture) {
          const res = await fetch('/api/profile/image', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ imageUrl: data.profile_picture })
          });
          if (!res.ok) {
            console.warn("Express backend rejected profile image update:", await res.text());
          }
        }
      } catch (err) {
        console.warn("Could not save profile updates to API backend:", err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, hasPermission, updateUser }}>
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
