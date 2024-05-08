import prisma from "../prisma";
import { config } from "../config";

export async function getHospitals() {
  let hospitals = await prisma.hospital.findMany({}); // select: {

  hospitals = hospitals.map((hospital) => {
    let imagePath = config.baseUrl + "/uploads/hospital/" + hospital.image;
    hospital.image = imagePath;
    return hospital;
  });

  return hospitals;
}

export async function getHospitalById(id: number) {
  let hospital = await prisma.hospital.findUnique({
    where: {
      id,
    },
  });

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  let imagePath = config.baseUrl + "/uploads/hospital/" + hospital.image;
  hospital.image = imagePath;

  return hospital;
}

export async function createHospital(
  name: string,
  description: string,
  address: string,
  phone: string,
  image: string
) {
  let hospital = await prisma.hospital.create({
    data: {
      name,
      address,
      phone,
      description,
      image,
    },
  });

  if (!hospital) {
    throw new Error("Something went wrong");
  }

  let imagePath = config.baseUrl + "/uploads/hospital/" + hospital.image;
  hospital.image = imagePath;

  return hospital;
}

export async function updateHospital(
  id: number,
  name: string,
  description: string,
  address: string,
  phone: string
) {
  let hospital = await prisma.hospital.update({
    where: {
      id,
    },
    data: {
      name,
      description,
      address,
      phone,
    },
  });

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  let imagePath = config.baseUrl + "/uploads/hospital/" + hospital.image;
  hospital.image = imagePath;

  return hospital;
}

export async function updateHospitalImage(id: number, image: string) {
  let hospital = await prisma.hospital.update({
    where: {
      id,
    },
    data: {
      image,
    },
  });

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  let imagePath = config.baseUrl + "/uploads/hospital/" + hospital.image;
  hospital.image = imagePath;

  return hospital;
}

export async function deleteHospital(id: number) {
  let hospital = await prisma.hospital.delete({
    where: {
      id,
    },
  });

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  return hospital;
}
