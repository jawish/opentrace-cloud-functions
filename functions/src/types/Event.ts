import type * as functions from "firebase-functions";

export interface IEventOptions {
  regions: Array<typeof functions.SUPPORTED_REGIONS[number]>;
  runtime: functions.RuntimeOptions;
}

export interface IStorageBucketEventFunction {
  (bucket: string, options?: IEventOptions): functions.CloudFunction<functions.storage.ObjectMetadata>;
}
