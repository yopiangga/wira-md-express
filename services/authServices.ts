import prisma from "../prisma";
import { generateToken } from "../helpers/jwtHelper";
import { Role } from "@prisma/client";

export async function signIn(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = user.password === password;

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user.id.toString(), user.email);

  return {
    user,
    token,
  };
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: Role,
  idHospital: number,
  image: string
) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("Email has been registered");
  }

  const user = await prisma.user.create({
    data: {
      email,
      password,
      name,
      role,
      idHospital,
      image,
    },
  });

  if (!user) {
    throw new Error("Something went wrong");
  }

  const token = generateToken(user.id.toString(), user.email);

  return {
    user,
    token,
  };
}
