import { initializeApp } from "firebase-admin";

import config from "./config";
import { api } from "./handlers/requests";
import { processUpload } from "./handlers/events";
import { getHandshakePin, getTempIDs, getUploadToken } from "./handlers/calls";

initializeApp();

export = {
  getHandshakePin: getHandshakePin(),
  getTempIDs: getTempIDs(),
  getUploadToken: getUploadToken(),
  processUploadedData: processUpload(config.upload.bucket),
  api: api(),
};
