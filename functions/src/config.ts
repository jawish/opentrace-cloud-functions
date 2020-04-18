import FunctionConfig, { UPLOAD_POSTDATA_STRATEGY } from "./opentrace/types/FunctionConfig";
import Authenticator from "./opentrace/utils/Authenticator";
import HotpPinGenerator from "./opentrace/utils/HotpPinGenerator";

const config: FunctionConfig = {
  projectId: process.env.PROJECT_ID as string,
  regions: ['asia-east2'],
  utcOffset: 0,
  authenticator: new Authenticator(),
  encryption: {
    defaultAlgorithm: "aes-256-gcm",
    keyPath: process.env.ENCRYPTION_KEY_PATH!,
    defaultVersion: 1,
  },
  tempID: {
    validityPeriod: 0.25, // in hours
    refreshInterval: 12,  // in hours
    batchSize: 100, // sufficient for 24h+
  },
  upload: {
    pinGenerator: new HotpPinGenerator(),
    bucket: process.env.UPLOAD_BUCKET as string,
    recordsDir: "records",
    testsDir: "tests",
    tokenValidityPeriod: 2, // in hours
    bucketForArchive: "archive-bucket", // Unused
    postDataStrategy: process.env.UPLOAD_POSTDATA_STRATEGY! as UPLOAD_POSTDATA_STRATEGY, // Can be 'url' | 'content'
    postDataApiUrl: process.env.UPLOAD_POSTDATA_API_URL as string,   // Endpoint URL to POST data
    postDataWithEvents: !!process.env.UPLOAD_POSTDATA_WITH_EVENTS,
    postDataAddPhoneNumber: !!process.env.UPLOAD_POSTDATA_ADD_PHONE_NUMBER,
  },
};

export default config;
