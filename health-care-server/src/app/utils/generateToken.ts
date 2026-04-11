import jwt, { Secret, SignOptions } from "jsonwebtoken";


export const generateToken = (payload: any, secret: Secret, expire: SignOptions["expiresIn"]) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: expire, 
  });

  return token; 
};

export const verifyToken = (token: string, secret: Secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  }
  catch (error) {
    throw new Error("Invalid token");
  }
};

