import * as functions from "firebase-functions";

import FunctionConfig from "./types/FunctionConfig";
import Authenticator from "./utils/Authenticator";
import HotpPinGenerator from "./utils/HotpPinGenerator";

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
    pinGenerator: new HotpPinGenerator(functions.config().opentrace.pinsalt),
    bucket: functions.config().opentrace.uploadbucket,
    recordsDir: "records",
    testsDir: "tests",
    tokenValidityPeriod: 30, // in minutes
    bucketForArchive: "archive-bucket", // Unused
    postDataStrategy: functions.config().opentrace.postdatastrategy, // Can be 'url' | 'content'
    postDataApiUrl: functions.config().opentrace.postdataapiurl,   // Endpoint URL to POST data
    postDataWithEvents: !!functions.config().opentrace.postdatawithevents,
    postDataAddPhoneNumber: !!functions.config().opentrace.postdataaddphonenumber,
  },
  api: {
    key: functions.config().opentrace.apikey,
  }
};

export default config;
