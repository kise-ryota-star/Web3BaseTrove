// External Modules
import React, { createContext, useState } from "react";

interface NotificationContextType {
  message: string;
  showNotification: (msg: string) => void;
  hideNotification: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string>("");

  const showNotification = (msg: string) => {
    setMessage(msg);
  };

  const hideNotification = () => {
    setMessage("");
  };

  return (
    <NotificationContext.Provider value={{ message, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
