/**
 * This class uses a plain substring to generate a pin from user uid.
 * It should be subclassed with a secure implementation.
 */
export default abstract class PinGenerator {
  abstract async generatePin(uid: string): Promise<string>;

  abstract async generateExpiringPin(uid: string, minutes: number): Promise<string>;
}
