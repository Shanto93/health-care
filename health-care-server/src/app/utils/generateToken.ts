import jwt, { Secret, SignOptions } from "jsonwebtoken";

const generateToken = (payload: any, secret: Secret, expire: SignOptions["expiresIn"]) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: expire, 
  });

  return token; 
};

export default generateToken;