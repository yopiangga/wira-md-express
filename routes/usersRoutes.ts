import express from "express";
import { Request, Response, NextFunction } from "express";
import * as usersServices from "../services/usersServices";
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
  "/",
  jwtAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await usersServices.getUsers();

      res.json({
        message: "Success",
        data: users,
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
      const users = await usersServices.getUserById(id);

      res.json({
        message: "Success",
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  jwtAuthMiddleware,
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role, idHospital } = req.body;

    const image = req.file;
    const extention = image!.originalname.split(".")[1];
    const nameImage = email + "." + extention;
    const imageBuffer = image!.buffer;

    const filePath = config.path + "/uploads/user/" + nameImage;
    fs.writeFileSync(filePath, imageBuffer);

    try {
      const user = await usersServices.createUser(
        email,
        password,
        name,
        role,
        parseInt(idHospital),
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

router.put(
  "/:id",
  jwtAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const { name, email, password, role, idHospital } = req.body;

    try {
      const user = await usersServices.updateUser(
        id,
        email,
        password,
        name,
        role,
        parseInt(idHospital)
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

router.put(
  "/:id/image",
  jwtAuthMiddleware,
  upload.single("image"),
  async (req, res, next) => {
    const id = parseInt(req.params.id);

    const image = req.file;
    const extention = image!.originalname.split(".")[1];
    const nameImage = id + "." + extention;
    const imageBuffer = image!.buffer;

    const filePath = config.path + "/uploads/user/" + nameImage;
    fs.writeFileSync(filePath, imageBuffer);

    try {
      const user = await usersServices.updateUserImage(id, nameImage);

      res.json({
        message: "Success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", jwtAuthMiddleware, async (req, res, next) => {
  const id = parseInt(req.params.id);

  try {
    await usersServices.deleteUser(id);

    res.json({
      message: "Success",
    });
  } catch (error) {
    next(error);
  }
});
