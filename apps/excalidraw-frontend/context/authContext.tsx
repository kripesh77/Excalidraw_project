"use client";

import {
  createContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

type IAuth = {
  accessToken: string;
  setAccessToken: Dispatch<SetStateAction<string>>;
};

const AuthContext = createContext<IAuth | null>(null);

export const AuthProvider = ({
  children,
  token,
}: {
  children: ReactNode;
  token: string;
}) => {
  console.log(token);
  const [accessToken, setAccessToken] = useState<string>(token);

  const value = { accessToken, setAccessToken }; // ideally we needed to memoize the object, but now react v19+ compiler is taking care of memoization

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
