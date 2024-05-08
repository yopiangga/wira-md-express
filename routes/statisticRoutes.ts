import express from "express";
import { Request, Response, NextFunction } from "express";
import * as statisticServices from "../services/statisticServices";
import { JWTRequest, jwtAuthMiddleware } from "../middleware/jwtAuth";

export const router = express.Router();

router.get(
  "/by-doctor/:idHospital",
  jwtAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const idDoctor = parseInt((req as JWTRequest).user.id);
    const idHospital = parseInt(req.params.idHospital);
    try {
      const statistics = await statisticServices.statisticByDoctor(
        idDoctor,
        idHospital
      );

      res.json({
        message: "Success",
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/by-operator/:idHospital",
  jwtAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const idOperator = parseInt((req as JWTRequest).user.id);
    const idHospital = parseInt(req.params.idHospital);
    try {
      const statistics = await statisticServices.statisticByOperator(
        idOperator,
        idHospital
      );

      res.json({
        message: "Success",
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }
);
