import express from "express";
import { Request, Response, NextFunction } from "express";
import * as userServices from "../services/userServices";
import { JWTRequest, jwtAuthMiddleware } from "../middleware/jwtAuth";
import multer from "multer";
import fs from "fs";
import { config } from "../config";

export const router = express.Router();

var upload = multer({
  dest: "uploads/",
  storage: multer.memoryStorage(),
});

router.get(
  "/me",
  jwtAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userServices.myProfile(
        parseInt((req as JWTRequest).user.id)
      );

      res.json({
        message: "Success",
        data: users,
      });
    } catch (error: any) {
      next(error);
    }
  }
);

router.put("/me", jwtAuthMiddleware, async (req, res, next) => {
  const { name } = req.body;
  const id = (req as JWTRequest).user.id;

  try {
    const user = await userServices.updateProfile(parseInt(id), name);

    res.json({
      message: "Success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.put(
  "/me/image",
  jwtAuthMiddleware,
  upload.single("image"),
  async (req, res, next) => {
    const id = (req as JWTRequest).user.id;

    const image = req.file;
    const extention = image!.originalname.split(".")[1];
    const nameImage = id + "." + extention;
    const imageBuffer = image!.buffer;

    const filePath = config.path + "/uploads/user/" + nameImage;

    fs.writeFileSync(filePath, imageBuffer);

    try {
      const user = await userServices.updateProfileImage(
        parseInt(id),
        nameImage
      );

      res.json({
        message: "Success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);
