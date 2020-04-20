import * as functions from "firebase-functions";

import type { ICallFunction } from "../../types/Call";
import { getHandshakePinHandler } from "./getHandshakePinHandler";
import { getTempIDsHandler } from "./getTempIDsHandler";
import { getUploadTokenHandler } from "./getUploadTokenHandler";

export const authenticate = (handler: any) => {
  return async (data: any, context: any) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    return handler(data, context);
  };
};

export const getHandshakePin: ICallFunction = (
  options = {
    regions: ["asia-east2"],
    runtime: { memory: "256MB", timeoutSeconds: 60 },
  }
) => {
  return functions
    .runWith(options.runtime)
    .region(...options.regions)
    .https.onCall(authenticate(getHandshakePinHandler));
};

export const getTempIDs: ICallFunction = (
  options = {
    regions: ["asia-east2"],
    runtime: { memory: "256MB", timeoutSeconds: 60 },
  }
) => {
  return functions
    .runWith(options.runtime)
    .region(...options.regions)
    .https.onCall(authenticate(getTempIDsHandler));
};

export const getUploadToken: ICallFunction = (
  options = {
    regions: ["asia-east2"],
    runtime: { memory: "256MB", timeoutSeconds: 60 },
  }
) => {
  return functions
    .runWith(options.runtime)
    .region(...options.regions)
    .https.onCall(authenticate(getUploadTokenHandler));
};
