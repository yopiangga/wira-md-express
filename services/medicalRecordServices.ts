import prisma from "../prisma";
import { config } from "../config";
import { DiagnosisResult } from "@prisma/client";

export async function getMedicalRecords() {
  let medicalRecords = await prisma.medicalRecord.findMany({
    include: {
      Patient: true,
      Doctor: true,
      Operator: true,
      Hospital: true,
    },
  });

  const tempMedicalRecords = medicalRecords.map((medicalRecord) => {
    let imagePath =
      config.baseUrl + "/uploads/medical-record/jpg/" + medicalRecord.image + ".jpg";
    medicalRecord.image = imagePath;

    const tempMedicalRecord = {
      id: medicalRecord.id,
      idPatient: medicalRecord.idPatient,
      image: medicalRecord.image,
      diagnosisAI: medicalRecord.diagnosisAI,
      diagnosisDoctor: medicalRecord.diagnosisDoctor,
      description: medicalRecord.description,
      idDoctor: medicalRecord.idDoctor,
      idOperator: medicalRecord.idOperator,
      idHospital: medicalRecord.idHospital,
      createdAt: medicalRecord.createdAt,
      updatedAt: medicalRecord.updatedAt,

      patient: medicalRecord.Patient.name,
      nikPatient: medicalRecord.Patient.nik,
      doctor: medicalRecord.Doctor?.name,
      operator: medicalRecord.Operator.name,
      hospital: medicalRecord.Hospital.name,
    };

    return tempMedicalRecord;
  });

  return tempMedicalRecords;
}

export async function getMedicalRecordById(id: number) {
  let medicalRecord = await prisma.medicalRecord.findUnique({
    where: {
      id,
    },
    include: {
      Patient: true,
      Doctor: true,
      Operator: true,
      Hospital: true,
    },
  });

  if (!medicalRecord) {
    throw new Error("Medical Record not found");
  }

  let imagePath =
    config.baseUrl + "/uploads/medical-record/" + "jpg/" + medicalRecord.image + ".jpg";
    
  let imagePath2 = config.baseUrl + "/uploads/medical-record/segmented/" + medicalRecord.image + ".jpg";
    
  medicalRecord.image = imagePath;

  const tempMedicalRecord = {
    id: medicalRecord.id,
    idPatient: medicalRecord.idPatient,
    image: medicalRecord.image,
    segmented: imagePath2,
    diagnosisAI: medicalRecord.diagnosisAI,
    diagnosisDoctor: medicalRecord.diagnosisDoctor,
    description: medicalRecord.description,
    idDoctor: medicalRecord.idDoctor,
    idOperator: medicalRecord.idOperator,
    idHospital: medicalRecord.idHospital,
    createdAt: medicalRecord.createdAt,
    updatedAt: medicalRecord.updatedAt,

    patient: medicalRecord.Patient.name,
    nikPatient: medicalRecord.Patient.nik,
    doctor: medicalRecord.Doctor?.name,
    operator: medicalRecord.Operator.name,
    hospital: medicalRecord.Hospital.name,
  };

  return tempMedicalRecord;
}

export async function getMedicalRecordsByPatientId(id: number) {
  let medicalRecords = await prisma.medicalRecord.findMany({
    where: {
      idPatient: id,
    },
    include: {
      Patient: true,
      Doctor: true,
      Operator: true,
      Hospital: true,
    },
  });

  const tempMedicalRecords = medicalRecords.map((medicalRecord) => {
    let imagePath =
      config.baseUrl + "/uploads/medical-record/jpg/" + medicalRecord.image + ".jpg";
    medicalRecord.image = imagePath;

    const tempMedicalRecord = {
      id: medicalRecord.id,
      idPatient: medicalRecord.idPatient,
      image: medicalRecord.image,
      diagnosisAI: medicalRecord.diagnosisAI,
      diagnosisDoctor: medicalRecord.diagnosisDoctor,
      description: medicalRecord.description,
      idDoctor: medicalRecord.idDoctor,
      idOperator: medicalRecord.idOperator,
      idHospital: medicalRecord.idHospital,
      createdAt: medicalRecord.createdAt,
      updatedAt: medicalRecord.updatedAt,

      patient: medicalRecord.Patient.name,
      nikPatient: medicalRecord.Patient.nik,
      doctor: medicalRecord.Doctor?.name,
      operator: medicalRecord.Operator.name,
      hospital: medicalRecord.Hospital.name,
    };

    return tempMedicalRecord;
  });

  return tempMedicalRecords;
}

export async function createMedicalRecord(
  idPatient: number,
  image: string,
  diagnosisAI: DiagnosisResult,
  description: string,
  idOperator: number,
  idHospital: number
) {
  let medicalRecord = await prisma.medicalRecord.create({
    data: {
      idPatient,
      image,
      diagnosisAI,
      description,
      idOperator,
      idHospital,
    },
  });

  return medicalRecord;
}

export async function updateMedicalRecord(
  id: number,
  image: string,
  description: string,
  diagnosisAI: DiagnosisResult
) {
  let medicalRecord = await prisma.medicalRecord.update({
    where: {
      id: id,
    },
    data: {
      image,
      description,
      diagnosisAI,
    },
  });

  return medicalRecord;
}

export async function diagnosisByDoctor(id: number, diagnosis: any) {
  let medicalRecord = await prisma.medicalRecord.update({
    where: {
      id,
    },
    data: {
      diagnosisDoctor: diagnosis.diagnosisDoctor,
      description: diagnosis.description,
      idDoctor: parseInt(diagnosis.idDoctor),
      diagnosisTime: diagnosis.diagnosisTime,
    },
  });

  return medicalRecord;
}

export async function deleteMedicalRecord(id: number) {
  let medicalRecord = await prisma.medicalRecord.delete({
    where: {
      id,
    },
  });

  return medicalRecord;
}
