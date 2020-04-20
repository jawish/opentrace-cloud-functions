import type * as functions from "firebase-functions";

export interface IRequestOptions {
  regions: Array<typeof functions.SUPPORTED_REGIONS[number]>;
  runtime: functions.RuntimeOptions;
}

export interface IRequestFunction {
  (options?: IRequestOptions): functions.HttpsFunction;
}
