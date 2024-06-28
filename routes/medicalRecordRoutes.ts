import express from "express";
import { Request, Response, NextFunction } from "express";
import * as medicalRecordServices from "../services/medicalRecordServices";
import { JWTRequest, jwtAuthMiddleware } from "../middleware/jwtAuth";
import * as userServices from "../services/userServices";
import * as usersServices from "../services/usersServices";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import { config } from "../config";
import { SMTP_USER, mailTransporter } from "../utils/MailService";

export const router = express.Router();

var upload = multer({
  dest: "uploads/",
  storage: multer.memoryStorage(),
});

router.get(
  "/",
  jwtAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const medicalRecords = await medicalRecordServices.getMedicalRecords();

      res.json({
        message: "Success",
        data: medicalRecords,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",
  jwtAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    try {
      const myMedicalRecord = await medicalRecordServices.getMedicalRecordById(
        id
      );
      const medicalRecords = await medicalRecordServices.getMedicalRecords();

      const neighbors = medicalRecords.filter((medicalRecord) => {
        return medicalRecord.idPatient !== myMedicalRecord.idPatient;
      });

      const temp = neighbors.map((neighbor) => {
        return {
          id: neighbor.id,
          distance: calculateDistance({
            lat1: parseFloat(myMedicalRecord.latitude),
            lon1: parseFloat(myMedicalRecord.longitude),
            lat2: parseFloat(neighbor.latitude),
            lon2: parseFloat(neighbor.longitude),
          }),
          diagnoseByAI: neighbor.diagnosisAI,
          diagnoseByDoctor: neighbor.diagnosisDoctor,
        };
      });

      res.json({
        message: "Success",
        data: {
          ...myMedicalRecord,
          neighbors: temp,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/patient/:id", jwtAuthMiddleware, async (req, res, next) => {
  const { id } = req.params;

  try {
    const medicalRecords =
      await medicalRecordServices.getMedicalRecordsByPatientId(parseInt(id));
    res.json({
      message: "Success",
      data: medicalRecords,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  jwtAuthMiddleware,
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    const idOperator = (req as JWTRequest).user.id;
    const { idPatient, description } = req.body;

    const resUser = await userServices.myProfile(parseInt(idOperator));
    const idHospital = resUser.idHospital;

    // get users doctor
    const resDoctor = await usersServices.getUsers();
    const doctors = resDoctor.filter((user) => user.role === "doctor" && user.idHospital === idHospital);

    if (doctors.length === 0) {
      res.status(400).json({
        message: "There is no doctor in this hospital",
      });
    }

    const html = `
      <p>Dear Doctor,</p>
      <p>There is a new medical record that needs to be diagnosed. Please check the medical record in the application.</p>
      <p>Thank you.</p>

      <p>Patient ID: ${idPatient}</p>
      <p>Description: ${description}</p>

      <p>Best Regards,</p>
      <p>Medical Record Application</p>
    `

    doctors.map((doctor) => {
      const mailData = {
        from: SMTP_USER,
        to: doctor.email,
        subject: "New Medical Record - Diagnosis",
        html: html,
      };

      mailTransporter.sendMail(mailData, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Email sent: " + info.response);
        }
      
      });
    })

    const image = req.file;
    const nameImage = new Date().getTime() + "_" + idPatient;
    const imageBuffer = image!.buffer;

    const imageBlob = new Blob([imageBuffer]);

    const formData = new FormData();
    formData.append("image", imageBlob, image!.originalname);
    formData.append("name", nameImage);

    try {
      const resFile = await axios.post(
        config.classificationServiceUrl + "/prediction",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const diagnosisAI = resFile.data;

      const filePath = config.path + "/uploads/medical-record/dcm/" + nameImage;
      fs.writeFileSync(filePath, imageBuffer);

      try {
        const medicalRecords = await medicalRecordServices.createMedicalRecord(
          parseInt(idPatient),
          nameImage,
          diagnosisAI,
          description,
          parseInt(idOperator),
          idHospital
        );

        res.json({
          message: "Success",
          data: medicalRecords,
        });
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/",
  jwtAuthMiddleware,
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { description, id } = req.body;

    const image = req.file;
    const nameImage = new Date().getTime() + "_" + id;
    const imageBuffer = image!.buffer;

    const imageBlob = new Blob([imageBuffer]);

    const formData = new FormData();
    formData.append("image", imageBlob, image!.originalname);
    formData.append("name", nameImage);

    try {
      const resFile = await axios.post(
        config.classificationServiceUrl + "/prediction",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      const diagnosisAI = resFile.data;
  
      const filePath = config.path + "/uploads/medical-record/dcm/" + nameImage;
      fs.writeFileSync(filePath, imageBuffer);
  
      try {
        const medicalRecords = await medicalRecordServices.updateMedicalRecord(
          parseInt(id),
          nameImage,
          description,
          diagnosisAI
        );
  
        res.json({
          message: "Success",
          data: medicalRecords,
        });
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/diagnosis-by-doctor",
  jwtAuthMiddleware,
  async (req, res, next) => {
    const { diagnosisDoctor, description, id } = req.body;
    const idDoctor = (req as JWTRequest).user.id;
    const diagnosisTime = new Date();

    try {
      const medicalRecords = await medicalRecordServices.diagnosisByDoctor(
        parseInt(id),
        {
          diagnosisDoctor,
          description,
          idDoctor: parseInt(idDoctor),
          diagnosisTime,
        }
      );
      res.json({
        message: "Success",
        data: medicalRecords,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", jwtAuthMiddleware, async (req, res, next) => {
  const id = parseInt(req.params.id);

  try {
    const medicalRecords = await medicalRecordServices.deleteMedicalRecord(id);
    res.json({
      message: "Success",
      data: medicalRecords,
    });
  } catch (error) {
    next(error);
  }
});


function calculateDistance({lat1, lon1, lat2, lon2}: {lat1: number, lon1: number, lat2: number, lon2: number}) {
  const lat1Rad = lat1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);
  const lon1Rad = lon1 * (Math.PI / 180);
  const lon2Rad = lon2 * (Math.PI / 180);

  const R = 6371;

  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance;
}
