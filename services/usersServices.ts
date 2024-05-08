import prisma from "../prisma";
import { config } from "../config";
import { Role } from "@prisma/client";

export async function getUsers() {
  // buat agar password user tidak tampil
  let users = await prisma.user.findMany({
    include: {
      hospital: true,
    },
  });

  if (!users) {
    throw new Error("Users not found");
  }

  const newUsers = users.map((user) => {
    let imagePath = config.baseUrl + "/uploads/user/" + user.image;
    const tempUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      idHospital: user.idHospital,
      image: imagePath,
      hospital: user.hospital.name,
    };

    return tempUser;
  });

  return newUsers;
}

export async function getUserById(id: number) {
  let user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      idHospital: true,
      image: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let imagePath = config.baseUrl + "/uploads/user/" + user.image;
  user.image = imagePath;

  return user;
}

export async function getUserByEmail(email: string) {
  let user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      idHospital: true,
      image: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let imagePath = config.baseUrl + "/uploads/user/" + user.image;
  user.image = imagePath;

  return user;
}

export async function createUser(
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

  let imagePath = config.baseUrl + "/uploads/user/" + user.image;
  user.image = imagePath;

  return user;
}

export async function updateUser(
  id: number,
  email: string,
  password: string,
  name: string,
  role: Role,
  idHospital: number
) {
  let user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      email,
      password,
      name,
      role,
      idHospital,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let imagePath = config.baseUrl + "/uploads/user/" + user.image;
  user.image = imagePath;

  return user;
}

export async function updateUserImage(id: number, image: string) {
  let user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      image,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let imagePath = config.baseUrl + "/uploads/user/" + user.image;
  user.image = imagePath;

  return user;
}

export async function deleteUser(id: number) {
  let user = await prisma.user.delete({
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
