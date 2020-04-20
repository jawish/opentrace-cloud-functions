import Authenticator from "../utils/Authenticator";
import PinGenerator from "../utils/PinGenerator";

// SUPPORTED_REGIONS from function-configuration.d.ts
export type SUPPORTED_REGIONS =
  | "us-central1"
  | "us-east1"
  | "us-east4"
  | "europe-west1"
  | "europe-west2"
  | "asia-east2"
  | "asia-northeast1";

export type UPLOAD_POSTDATA_STRATEGY = "url" | "content";

interface FunctionConfig {
  projectId: string; // Firebase Project ID
  regions: SUPPORTED_REGIONS[];
  utcOffset: number | string;
  authenticator: Authenticator;
  encryption: {
    defaultAlgorithm: string;
    keyPath: string;
    defaultVersion: number;
  };
  tempID: {
    validityPeriod: number; // in hours
    refreshInterval: number; // in hours
    batchSize: number; // number of tempIDs to generate in 1 batch
  };
  upload: {
    pinGenerator: PinGenerator;
    bucket: string;
    recordsDir: string;
    testsDir: string;
    tokenValidityPeriod: number; // in minutes
    bucketForArchive: string;
    postDataApiUrl: string; // Remote server URL to post uploaded JSON to
    postDataStrategy: UPLOAD_POSTDATA_STRATEGY;
    postDataWithEvents?: boolean;
    postDataAddPhoneNumber?: boolean;
  };
  api: {
    key: string;
  }
}

export default FunctionConfig;
