import * as functions from "firebase-functions";

import FunctionConfig from "./opentrace/types/FunctionConfig";
import Authenticator from "./opentrace/utils/Authenticator";
import HotpPinGenerator from "./opentrace/utils/HotpPinGenerator";

const config: FunctionConfig = {
  projectId: functions.config().opentrace.projectid,
  regions: ['asia-east2'],
  utcOffset: 0,
  authenticator: new Authenticator(),
  encryption: {
    defaultAlgorithm: "aes-256-gcm",
    keyPath: functions.config().opentrace.encryptionkeypath,
    defaultVersion: 1,
  },
  tempID: {
    validityPeriod: 0.25, // in hours
    refreshInterval: 12,  // in hours
    batchSize: 100, // sufficient for 24h+
  },
  upload: {
    pinGenerator: new HotpPinGenerator(),
    bucket: functions.config().opentrace.uploadbucket,
    recordsDir: "records",
    testsDir: "tests",
    tokenValidityPeriod: 2, // in hours
    bucketForArchive: "archive-bucket", // Unused
    postDataStrategy: functions.config().opentrace.postdatastrategy, // Can be 'url' | 'content'
    postDataApiUrl: functions.config().opentrace.postdataapiurl,   // Endpoint URL to POST data
    postDataWithEvents: !!functions.config().opentrace.postdatawithevents,
    postDataAddPhoneNumber: !!functions.config().opentrace.postdataaddphonenumber,
  },
};

export default config;
