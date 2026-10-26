import { useState } from "react";
import { TokenContext } from "./tokenContext";

export const TokenProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
};



