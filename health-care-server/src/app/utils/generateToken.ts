import jwt, { Secret, SignOptions } from "jsonwebtoken";

export const generateToken = (
  payload: any,
  secret: Secret,
  expire: SignOptions["expiresIn"],
) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: expire,
  });

  return token;
};

export const verifyToken = (token: string, secret: Secret) => {
  // ELITE FIX: Remove the try/catch.
  // If verification fails, it will natively throw 'TokenExpiredError' or 'JsonWebTokenError'
  // Your globalErrorHandler will catch these and automatically return a beautiful 401 JSON response!
  return jwt.verify(token, secret);
};

// import jwt, { Secret, SignOptions } from "jsonwebtoken";

// export const generateToken = (payload: any, secret: Secret, expire: SignOptions["expiresIn"]) => {
//   const token = jwt.sign(payload, secret, {
//     algorithm: "HS256",
//     expiresIn: expire,
//   });

//   return token;
// };

// export const verifyToken = (token: string, secret: Secret) => {
//   try {
//     const decoded = jwt.verify(token, secret);
//     return decoded;
//   }
//   catch (error) {
//     throw new Error("Invalid token");
//   }
// };
