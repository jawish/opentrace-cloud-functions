import * as functions from "firebase-functions";

import config from "../../config";

/**
 * Get the handshake pin for a user.
 */
export const getHandshakePinHandler = async (_data: any, context: functions.https.CallableContext) => {
  // Get the UID
  const uid = context.auth!.uid;

  console.log("getHandshakePin:", "uid", uid);

  const pinGenerator = config.upload.pinGenerator;

  try {
    return {
      status: "SUCCESS",
      pin: await pinGenerator.generatePin(uid),
    };
  } catch (error) {
    console.error("getHandshakePin: Error while trying to generate handshake pin.", error);
    throw new functions.https.HttpsError("internal", "Internal Server Error.");
  }
};
