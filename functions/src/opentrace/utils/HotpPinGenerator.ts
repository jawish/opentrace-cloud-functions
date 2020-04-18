import { hotp } from "otplib";

import PinGenerator from "./PinGenerator";

export default class HotpPinGenerator extends PinGenerator {
  /**
   * Generate PIN seeded by User's UID
   * 
   * @param uid User UID
   */
  async generatePin(uid: string): Promise<string> {
    // Generate static HOTP without counter since app only retrieves it on login
    return hotp.generate(uid, 0);
  }
}
