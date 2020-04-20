import * as functions from "firebase-functions";

import { app } from "./express";
import type { IRequestFunction } from "../../types/Request";

export const api: IRequestFunction = (
  options = {
    regions: ["asia-east2"],
    runtime: { memory: "256MB", timeoutSeconds: 60 },
  }
) => {
  return functions
    .runWith(options.runtime)
    .region(...options.regions)
    .https.onRequest(app);
};
