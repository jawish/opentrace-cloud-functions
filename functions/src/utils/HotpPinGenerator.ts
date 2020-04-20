import { hotp } from "otplib";

import PinGenerator from "./PinGenerator";

export default class HotpPinGenerator extends PinGenerator {
  public salt: string = "";

  constructor(salt: string) {
    super();

    // Set salt
    this.salt = salt;
  }

  /**
   * Generate PIN seeded by User's UID
   *
   * @param uid User UID
   */
  public async generatePin(uid: string): Promise<string> {
    // Generate static HOTP without counter since app only retrieves it on login
    return hotp.generate(uid + this.salt, 0);
  }

  /**
   * Generate an expiring PIN seeded by User's UID, expiring in given minutes.
   *
   * @param uid User UID
   * @param minutes Expiry time-frame in minutes
   */
  public async generateExpiringPin(uid: string, minutes: number = 30): Promise<string> {
    const counter = this.roundDate(new Date(), minutes).getTime();

    // Generate HOTP with counter based on current time
    return hotp.generate(uid + this.salt, counter);
  }

  /**
   * Round up the given DateTime
   *
   * @param date Date to round up
   * @param minutes Number of minutes to round up from Date
   * @returns Date  Rounded up date
   */
  private roundDate(date: Date, minutes: number): Date {
    const coeff = 1000 * 60 * minutes;

    return new Date(Math.ceil(date.getTime() / coeff) * coeff);
  }
}
