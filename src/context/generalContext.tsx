import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getRequest } from "../services/apiRequests";
// import axiosJWT from "../services/axiosInstance";
import { AuthContext } from "./authContext.tsx";
import { useContext } from "react";

interface GeneralContextValue {
  unreadNotificationCount: number;
  setUnreadNotificationCount: React.Dispatch<React.SetStateAction<number>>;
}

export const GeneralContext = createContext<GeneralContextValue | null>(null);

interface GeneralProviderProps {
  children: ReactNode;
}

export const GeneralProvider: React.FC<GeneralProviderProps> = ({ children }) => {
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  console.log(error);
  console.log(loading);

  const auth = useContext(AuthContext);

  if (!auth) {
    return;
  }


  useEffect(() => {
    const fetchCount = async () => {
      const response = await getRequest("/notifications/get-unread-count", auth.accessToken, setLoading, setError);
      
      setUnreadNotificationCount(response.count);
    }
    fetchCount();
  }, []);

  return (
    <GeneralContext.Provider
      value={{
        unreadNotificationCount,
        setUnreadNotificationCount
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};