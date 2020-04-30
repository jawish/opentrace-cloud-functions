import * as functions from "firebase-functions";

import config from "../../config";
import getEncryptionKey from "../../utils/getEncryptionKey";
import CustomEncrypter from "../../utils/CustomEncrypter";
import formatTimestamp from "../../utils/formatTimestamp";

/**
 * Get upload token by passing in a secret string as `data`
 */
export const getUploadTokenHandler = async (data: any, context: functions.https.CallableContext) => {
  // Get the UID
  const uid = context.auth!.uid;

  console.log("getUploadToken:", "uid", uid, "data", data, "ip", context.rawRequest.ip);

  // Get current valid code for user
  const pinGenerator = config.upload.pinGenerator;
  let currentPin = await pinGenerator.generateExpiringPin(uid, config.upload.tokenValidityPeriod);

  // Detect test user upload calls.
  if (uid === "c3NbAbvhDGYyzSdkw4lTH9OfSGo2") {
    const handshakePin = await pinGenerator.generatePin(uid);

    console.log("getUploadCode:", "Test user detected. Setting code as pin.", uid, handshakePin);

    // Use pin as code for test user.
    currentPin = handshakePin;
  }

  if (data === currentPin) {
    // Set create date to now
    const createdAt = Date.now() / 1000;

    // Build payload
    const payload = Buffer.from(
      JSON.stringify({
        uid,
        createdAt,
        upload: data,
      })
    );
    console.log("getUploadToken:", "uid:", `${uid.substring(0, 8)}***`, "createdAt:", formatTimestamp(createdAt));

    // Prepare encrypter
    const encryptionKey = await getEncryptionKey();
    const customEncrypter = new CustomEncrypter(encryptionKey);

    // Encode payload
    const encryptedPayload = customEncrypter.encryptAndEncode(payload);
    console.log(`getUploadToken: Completed. Payload byte size: ${encryptedPayload.length}`);

    return {
      status: "SUCCESS",
      token: encryptedPayload.toString("base64"),
    };
  } else {
    console.log("getUploadToken:", `Invalid data: ${data}`);
    throw new functions.https.HttpsError("invalid-argument", `Invalid data: ${data}`);
  }
};
