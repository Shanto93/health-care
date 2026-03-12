import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,

  bcrypt: {
    salt_rounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  },

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },

  jwt: {
    access_token_secret:
      process.env.JWT_ACCESS_TOKEN_SECRET || "your_access_token_secret",
    refresh_token_secret:
      process.env.JWT_REFRESH_TOKEN_SECRET || "your_refresh_token_secret",
    access_token_expiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || "1d",
    refresh_token_expiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || "90d",
  },
};
