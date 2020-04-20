import type { Request, Response, NextFunction } from "express";

import config from "../../config";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.token;

    if (token !== config.api.key) {
      throw new Error(`Invalid API Key ${token}`);
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};
