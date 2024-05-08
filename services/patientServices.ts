import prisma from "../prisma";
import { config } from "../config";

export async function getPatients() {
  let patients = await prisma.patient.findMany({});

  patients = patients.map((patient) => {
    let imagePath = config.baseUrl + "/uploads/patient/" + patient.image;
    patient.image = imagePath;
    return patient;
  });

  return patients;
}

export async function getPatientById(id: number) {
  let patient = await prisma.patient.findUnique({
    where: {
      id,
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  let imagePath = config.baseUrl + "/uploads/patient/" + patient.image;
  patient.image = imagePath;

  return patient;
}

export async function createPatient(
  nik: string,
  name: string,
  phone: string,
  address: string,
  image: string,
  latitude: string,
  longitude: string
) {
  let patient = await prisma.patient.create({
    data: {
      nik,
      name,
      phone,
      address,
      image,
      latitude,
      longitude,
    },
  });

  if (!patient) {
    throw new Error("Something went wrong");
  }

  let imagePath = config.baseUrl + "/uploads/patient/" + patient.image;
  patient.image = imagePath;

  return patient;
}

export async function updatePatient(
  id: number,
  nik: string,
  name: string,
  address: string,
  phone: string,
  latitude: string,
  longitude: string
) {
  let patient = await prisma.patient.update({
    where: {
      id,
    },
    data: {
      name,
      nik,
      address,
      phone,
      latitude,
      longitude,
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  let imagePath = config.baseUrl + "/uploads/patient/" + patient.image;
  patient.image = imagePath;

  return patient;
}

export async function updatePatientImage(id: number, image: string) {
  let patient = await prisma.patient.update({
    where: {
      id,
    },
    data: {
      image,
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  let imagePath = config.baseUrl + "/uploads/patient/" + patient.image;
  patient.image = imagePath;

  return patient;
}

export async function deletePatient(id: number) {
  let patient = await prisma.patient.delete({
    where: {
      id,
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  return patient;
}
