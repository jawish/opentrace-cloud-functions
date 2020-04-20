import type * as functions from "firebase-functions";

export interface ICallOptions {
  regions: Array<typeof functions.SUPPORTED_REGIONS[number]>;
  runtime: functions.RuntimeOptions;
}

export interface ICallFunction {
  (options?: ICallOptions): functions.HttpsFunction;
}
