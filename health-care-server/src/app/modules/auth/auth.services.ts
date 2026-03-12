import { IAuthInfo } from "./auth.interfaces";

const login = (payload: IAuthInfo) => {
  console.log(payload);
};

export const AuthServices = {
  login,
};
