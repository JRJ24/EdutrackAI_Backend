import jwt, { JwtPayload } from "jsonwebtoken";

type AuthTokenPayload = {
  userId: string;
  email: string;
  role: string;
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }

  return secret;
};

export const signAuthToken = (payload: AuthTokenPayload) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "1d" });
};

export const verifyAuthToken = (token: string) => {
  return jwt.verify(token, getJwtSecret()) as JwtPayload & AuthTokenPayload;
};
