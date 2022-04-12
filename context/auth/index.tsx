import React, { useState, useEffect, useContext, createContext } from "react";
import nookies from "nookies";
import { auth } from "../../app-firebase";
import { API } from "../../models/api";
import axios from "axios";

const AuthContext = createContext<{ user: any | null; isLoading: boolean }>({
  user: null,
  isLoading: false,
});

export const verifyIdToken = async (token: string) => {
  const { data } = await axios.post(
    `${API.ENDPOINT}/auth/verifyIdToken`,
    {
      token,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadUserFromCookies() {
      setIsLoading(true);
      const { token } = nookies.get();
      if (token) {
        try {
          const data = await verifyIdToken(token);
          if (data) setUser(data);
        } catch (err) {
          console.log(err);
        }
      }
      setIsLoading(false);
    }
    loadUserFromCookies();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).nookies = nookies;
    }
    return auth.onIdTokenChanged(async (user) => {
      if (!user) {
        setUser(null);
        nookies.destroy(null, "token");
        nookies.set(null, "token", "", { path: "/" });
        return;
      }

      const token = await user.getIdToken();
      setUser(user);
      nookies.destroy(null, "token");
      nookies.set(null, "token", token, { path: "/" });
    });
  }, []);

  // force refresh the token every 10 minutes
  useEffect(() => {
    const handle = setInterval(async () => {
      const user = auth.currentUser;
      if (user) await user.getIdToken(true);
    }, 10 * 60 * 1000);
    return () => clearInterval(handle);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
