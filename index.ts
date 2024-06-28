import express, { Application, Response, Request, NextFunction } from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { router as authRouter } from "./routes/authRoutes";
import { router as userRoutes } from "./routes/userRoutes";
import { router as usersRoutes } from "./routes/usersRoutes";
import { router as hospitalRoutes } from "./routes/hospitalRoutes";
import { router as patientRoutes } from "./routes/patientRoutes";
import { router as medicalRecordRoutes } from "./routes/medicalRecordRoutes";
import { router as statisticRoutes } from "./routes/statisticRoutes";
import { config } from "./config";
import multer from "multer";
import fs from "fs";
import { mailTransporter } from "./utils/MailService";

dotenv.config();

const app: Application = express();

app.use(helmet());
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var upload = multer({
  dest: "uploads/",
  storage: multer.memoryStorage(),
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

app.use("/auth", authRouter);
app.use("/user", userRoutes);
app.use("/users", usersRoutes);
app.use("/hospitals", hospitalRoutes);
app.use("/patients", patientRoutes);
app.use("/medical-records", medicalRecordRoutes);
app.use("/statistics", statisticRoutes);

app.use("/uploads", upload.single("image"),  (req, res) => {
  const image = req.file;
  const nameImage = new Date().getTime();
  const imageBuffer = image!.buffer;

  const filePath = "uploads/" + nameImage;
  fs.writeFileSync(filePath, imageBuffer);

  res.status(200).json({
    message: "Success",
    data: {
      filePath,
    },
  })

})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message,
  });
});

app.listen(config.port, () => {
  console.log("Server is running on port " + config.port);
});
