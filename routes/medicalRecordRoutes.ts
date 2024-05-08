import express from "express";
import { Request, Response, NextFunction } from "express";
import * as medicalRecordServices from "../services/medicalRecordServices";
import { JWTRequest, jwtAuthMiddleware } from "../middleware/jwtAuth";
import * as userServices from "../services/userServices";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import { config } from "../config";

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
      const medicalRecords = await medicalRecordServices.getMedicalRecordById(
        id
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
