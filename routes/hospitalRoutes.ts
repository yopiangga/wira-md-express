import express, { Request, Response } from "express";
import * as hospitalServices from "../services/hospitalServices";
import multer from "multer";
import fs from "fs";
import { config } from "../config";

export const router = express.Router();

var upload = multer({
  dest: "uploads/",
  storage: multer.memoryStorage(),
});

router.get("/", async (req, res, next) => {
  try {
    const hospitals = await hospitalServices.getHospitals();

    res.json({
      message: "Success",
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const hospital = await hospitalServices.getHospitalById(parseInt(id));

    res.json({
      message: "Success",
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", upload.single("image"), async (req, res, next) => {
  const { name, address, phone, description } = req.body;
  const image = req.file;
  const extention = image!.originalname.split(".")[1];
  const nameImage = new Date().getTime() + "_" + name + "." + extention;
  const imageBuffer = image!.buffer;

  const filePath = config.path + "/uploads/hospital/" + nameImage;
  fs.writeFileSync(filePath, imageBuffer);

  try {
    const hospital = await hospitalServices.createHospital(
      name,
      address,
      phone,
      description,
      nameImage
    );

    res.json({
      message: "Success",
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { name, address, phone, description } = req.body;

  try {
    const hospital = await hospitalServices.updateHospital(
      parseInt(id),
      name,
      description,
      address,
      phone
    );

    res.json({
      message: "Success",
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id/image", upload.single("image"), async (req, res, next) => {
  const { id } = req.params;
  const image = req.file;
  const extention = image!.originalname.split(".")[1];
  const nameImage = id + "." + extention;
  const imageBuffer = image!.buffer;

  const filePath = config.path + "/uploads/hospital/" + nameImage;
  fs.writeFileSync(filePath, imageBuffer);

  try {
    const hospital = await hospitalServices.updateHospitalImage(
      parseInt(id),
      nameImage
    );

    res.json({
      message: "Success",
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const hospital = await hospitalServices.deleteHospital(parseInt(id));

    res.json({
      message: "Success",
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
});
