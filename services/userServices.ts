import prisma from "../prisma";
import path from "path";
import { config } from "../config";

export async function myProfile(id: number) {
  let user = await prisma.user.findUnique({
    where: {
      id,
    },
    include:{
      hospital:{
        select:{
          id:true,
          name:true,
        }
      
      }
    }
  });

  if (!user) {
    throw new Error("User not found");
  }

  let imagePath = config.baseUrl + "/uploads/user/" + user.image;

  user.image = imagePath;
  delete (user as { password?: string }).password;

  return user;
}

export async function updateProfile(id: number, name: string) {
  let user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let imagePath = config.baseUrl + "/uploads/user/" + user.image;

  user.image = imagePath;
  delete (user as { password?: string }).password;

  return user;
}

export async function updateProfileImage(id: number, image: string) {
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
  delete (user as { password?: string }).password;

  return user;
}
