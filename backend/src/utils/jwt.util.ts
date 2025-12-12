import jwt from "jsonwebtoken";
import { UserRole } from "../models/user.model";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

const getAccessSecret = () => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET not set");
  }
  return process.env.JWT_ACCESS_SECRET;
};

const getRefreshSecret = () => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET not set");
  }
  return process.env.JWT_REFRESH_SECRET;
};

export interface JwtPayload {
  sub: string; // userId
  role: UserRole;
  type: "access" | "refresh";
}

export const signAccessToken = (userId: string, role: UserRole): string => {
  const payload: JwtPayload = { sub: userId, role, type: "access" };
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const signRefreshToken = (userId: string, role: UserRole): string => {
  const payload: JwtPayload = { sub: userId, role, type: "refresh" };
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, getAccessSecret()) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, getRefreshSecret()) as JwtPayload;
};
