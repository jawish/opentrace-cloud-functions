import * as functions from "firebase-functions";

import { IStorageBucketEventFunction } from "../../types/Event";
import { processUploadedData } from "./processUploadedData";

export const processUpload: IStorageBucketEventFunction = (
  bucket,
  options = {
    regions: ["asia-east2"],
    runtime: { memory: "256MB", timeoutSeconds: 60 },
  }
) => {
  return functions
    .runWith(options.runtime)
    .region(...options.regions)
    .storage.bucket(bucket)
    .object()
    .onFinalize(processUploadedData);
};
