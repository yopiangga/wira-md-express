import prisma from "../prisma";
import { Role } from "@prisma/client";

export async function statisticByDoctor(idDoctor: number, idHospital: number) {
  // dapatkan jumlah patient dari medical record yang dimiliki oleh doctor, jumlah tidak boleh menghitung medical record dari pasien yang sama

  const totalPatient = await prisma.medicalRecord.findMany({
    where: {
      idHospital,
    },
    select: {
      id: true,
      idPatient: true,
    },
    distinct: ["idPatient"],
  });

  //   dapatkan jumlah medical record yang normal, hemorrhagic, dan ischemic dari medical record yang dimiliki oleh doctor

  const totalNormal = await prisma.medicalRecord.findMany({
    where: {
      idDoctor,
      diagnosisDoctor: "normal",
    },
    select: {
      id: true,
      idPatient: true,
    },
    distinct: ["idPatient"],
  });

  const totalIschemic = await prisma.medicalRecord.findMany({
    where: {
      idDoctor,
      diagnosisDoctor: "ischemic",
    },
    select: {
      id: true,
      idPatient: true,
    },
    distinct: ["idPatient"],
  });

  const totalHemorrhagic = await prisma.medicalRecord.findMany({
    where: {
      idDoctor,
      diagnosisDoctor: "hemorrhagic",
    },
    select: {
      id: true,
      idPatient: true,
    },
    distinct: ["idPatient"],
  });

  //   dapatkan jumlah medical record yang sudah didiagnosa dokter dan yang belum didiagnosa dokter yang berada pada rs yang sama dengan dokter
  const totalDiagnosed = await prisma.medicalRecord.count({
    where: {
      idDoctor,
      idHospital,
      diagnosisDoctor: {
        not: null,
      },
    },
  });

  const totalUnDiagnosed = await prisma.medicalRecord.count({
    where: {
      idHospital,
      diagnosisDoctor: null,
    },
  });

  return {
    totalPatient: totalPatient.length,
    totalNormal: totalNormal.length,
    totalIschemic: totalIschemic.length,
    totalHemorrhagic: totalHemorrhagic.length,
    totalDiagnosed,
    totalUnDiagnosed,
  };
}

export async function statisticByOperator(
  idOperator: number,
  idHospital: number
) {
  // dapatkan jumlah patient dari medical record yang dimiliki oleh operator, jumlah tidak boleh menghitung medical record dari pasien yang sama
  const totalPatient = await prisma.medicalRecord.findMany({
    where: {
      idHospital,
    },
    select: {
      id: true,
      idPatient: true,
    },
    distinct: ["idPatient"],
  });

  //   dapatkan jumlah medical record yang sudah didiagnosa operator dan yang belum didiagnosa operator yang berada pada rs yang sama dengan operator
  const totalDiagnosed = await prisma.medicalRecord.count({
    where: {
      idOperator,
      idHospital,
      diagnosisDoctor: {
        not: null,
      },
    },
  });

  const totalUnDiagnosed = await prisma.medicalRecord.count({
    where: {
      idHospital,
      diagnosisDoctor: null,
    },
  });

  const totalMedicalRecord = totalDiagnosed + totalUnDiagnosed;

  return {
    totalPatient: totalPatient.length,
    totalDiagnosed,
    totalUnDiagnosed,
    totalMedicalRecord,
  };
}
