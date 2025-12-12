import { User } from "../models/user.model";
import { hashPassword, comparePassword } from "../utils/password.util";
import { signAccessToken, signRefreshToken } from "../utils/jwt.util";
import { StudentProfile } from "../models/studentProfile.model";


interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "student" ;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (input: RegisterInput) => {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: "student",
  });

  // 🔹 Auto-create profile
  await StudentProfile.create({ userId: user._id });
  const accessToken = signAccessToken(user._id.toString(), user.role);
  const refreshToken = signRefreshToken(user._id.toString(), user.role);

  return { user, accessToken, refreshToken };
};

export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.status !== "active") {
    throw new Error("Account is not active");
  }

  const isMatch = await comparePassword(input.password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const accessToken = signAccessToken(user._id.toString(), user.role);
  const refreshToken = signRefreshToken(user._id.toString(), user.role);

  return { user, accessToken, refreshToken };
};
