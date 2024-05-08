import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";

export const router = express.Router();

import { signIn, signUp } from "../services/authServices";
import { config } from "../config";

var upload = multer({
  dest: "uploads/",
  storage: multer.memoryStorage(),
});

router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const { user, token } = await signIn(email, password);

    res.json({
      message: "Sign in success",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/signup", upload.single("image"), async (req, res, next) => {
  const { email, password, name, role, idHospital } = req.body;

  const image = req.file;
  const extention = image!.originalname.split(".")[1];
  const nameImage = email + "." + extention;
  const imageBuffer = image!.buffer;

  const filePath = config.path + "/uploads/user/" + nameImage;
  fs.writeFileSync(filePath, imageBuffer);

  try {
    const user = await signUp(
      email,
      password,
      name,
      role,
      parseInt(idHospital),
      nameImage
    );

    res.json({
      message: "Sign up success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});
