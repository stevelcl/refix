import React, { createContext, useContext, useState, useEffect } from "react";

const SiteContext = createContext();

const CREATOR_PASS = "refix-internal";

export function SiteProvider({ children }) {
  const [isCreatorAuthed, setIsCreatorAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("creatorAuthed") === "true") {
      setIsCreatorAuthed(true);
    }
  }, []);

  const loginAsCreator = (password) => {
    if (password === CREATOR_PASS) {
      sessionStorage.setItem("creatorAuthed", "true");
      setIsCreatorAuthed(true);
      return true;
    }
    return false;
  };

  const logoutCreator = () => {
    sessionStorage.removeItem("creatorAuthed");
    setIsCreatorAuthed(false);
  };

  return (
    <SiteContext.Provider value={{ isCreatorAuthed, loginAsCreator, logoutCreator }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  return useContext(SiteContext);
}


