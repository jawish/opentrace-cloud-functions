import * as admin from "firebase-admin";
import { Request, Response } from 'express';

import config from "../../../config";

/**
 * Get upload code for the given user phone number
 */
export async function getUploadCode(req: Request, res: Response, next: any) {
  console.log("getUploadCode:", "phone", req.body.phone);

  // Get the user by the given phone number
  const user = await admin.auth().getUserByPhoneNumber(req.body.phone);

  if (!user) {
    console.error("getUploadCode:", "User not found.");

    res
      .status(404)
      .json({
        message: "User not found.",
      })
      .end();
    
    return;
  }

  try {
    const pinGenerator = config.upload.pinGenerator;
    const pin = await pinGenerator.generatePin(user.uid);
    const code = await pinGenerator.generateExpiringPin(user.uid, config.upload.tokenValidityPeriod);

    res
      .status(200)
      .json({
        status: "SUCCESS",
        handshake_pin: pin,
        upload_code: code,
      })
      .end();
  } catch (error) {
    console.error("getUploadCode: Error while trying to generate upload code.", error);

    res
      .status(error.code)
      .json({
        message: "Error while trying to generate upload code.",
      })
      .end();
  }
}
