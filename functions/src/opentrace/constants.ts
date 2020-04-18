export const UID_SIZE = 21;
export const TIME_SIZE = 4;

// 21 bytes for UID, 4 bytes each for creation and expiry timestamp
export const TEMPID_SIZE = UID_SIZE + TIME_SIZE * 2;
export const IV_SIZE = 16;
export const AUTHTAG_SIZE = 16;
