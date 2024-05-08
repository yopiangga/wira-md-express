import express from "express";
import { Request, Response, NextFunction } from "express";
import * as patientServices from "../services/patientServices";
import multer from "multer";
import fs from "fs";
import { config } from "../config";

export const router = express.Router();

var upload = multer({
  dest: "uploads/",
  storage: multer.memoryStorage(),
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patients = await patientServices.getPatients();

    res.json({
      message: "Success",
      data: patients,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const patient = await patientServices.getPatientById(parseInt(id));

    res.json({
      message: "Success",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, address, phone, nik, latitude, longitude } = req.body;

    const image = req.file;
    const extention = image!.originalname.split(".")[1];
    const nameImage = req.body.nik + "." + extention;
    const imageBuffer = image!.buffer;

    const filePath = config.path + "/uploads/patient/" + nameImage;
    fs.writeFileSync(filePath, imageBuffer);

    try {
      const patient = await patientServices.createPatient(
        nik,
        name,
        phone,
        address,
        nameImage,
        latitude,
        longitude
      );

      res.json({
        message: "Success",
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, address, phone, nik, latitude, longitude } = req.body;

  try {
    const patient = await patientServices.updatePatient(
      parseInt(id),
      nik,
      name,
      address,
      phone,
      latitude,
      longitude
    );

    res.json({
      message: "Success",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id/image",
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const image = req.file;
    const extention = image!.originalname.split(".")[1];
    const nameImage = id + "." + extention;
    const imageBuffer = image!.buffer;

    const filePath = config.path + "/uploads/patient/" + nameImage;
    fs.writeFileSync(filePath, imageBuffer);

    try {
      const patient = await patientServices.updatePatientImage(
        parseInt(id),
        nameImage
      );

      res.json({
        message: "Success",
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
      await patientServices.deletePatient(parseInt(id));

      res.json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  }
);
