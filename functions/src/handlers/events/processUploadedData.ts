import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as moment from "moment";
import { ObjectMetadata } from "firebase-functions/lib/providers/storage";
import fetch from "node-fetch";

import config from "../../config";
import CustomEncrypter from "../../utils/CustomEncrypter";
import getEncryptionKey from "../../utils/getEncryptionKey";
import { TEMPID_SIZE, IV_SIZE, AUTHTAG_SIZE, UID_SIZE, TIME_SIZE } from "../../constants";

interface IBaseEvent {
  id: number;
  timestamp: number;
}

interface IEvent extends IBaseEvent {
  msg: string;
}

interface IEventDecrypted extends IEvent {
  msg: "S" | "E";
}

interface IBaseRecord {
  id: number;
  modelC: string;
  modelP: string;
  org: string;
  rssi: number;
  timestamp: number;
  v: number;
}

interface IRecord extends IBaseRecord {
  msg: string;
}

interface IMsgDecrypted {
  uid: string;
  phone: string | null;
  startTime: number;
  expiryTime: number;
}

interface IRecordDecrypted extends IBaseRecord {
  msg: IMsgDecrypted;
}

type IToken = string;

interface ITokenDecrypted {
  uid: string;
  phone: string | null;
  createdAt: number;
  upload: string;
}

interface IData {
  token: IToken;
  events: IEvent[];
  records: IRecord[];
}

interface IDataDecrypted {
  token: ITokenDecrypted;
  events: IEventDecrypted[];
  records: IRecordDecrypted[];
}

export const processUploadedData = async (object: ObjectMetadata) => {
  const fileBucket = object.bucket;
  const filePath = object.name;
  const { postDataApiLoginUrl, postDataApiUploadUrl, postDataStrategy, postDataWithEvents, postDataAddPhoneNumber } = config.upload;

  // Throw error if filePath is empty
  if (!filePath) {
    console.log("processUploadedData:", `Invalid or empty filePath: ${filePath}`);
    throw new functions.https.HttpsError("internal", `Uploaded file not accessible.`);
  }

  // Throw error is postData API URL is not configured or empty
  if (!postDataApiUploadUrl || !postDataApiLoginUrl) {
    throw new Error("Post data remote API URLs not defined!");
  }

  // Get the uploaded file object from the object
  const file = admin.storage().bucket(fileBucket).file(filePath);
  try {
    // Download the file for processing
    const data = await file.download();
    const dataJson: IData = JSON.parse(data[0].toString("utf8"));

    // Get the encryption key
    const encryptionKey = await getEncryptionKey();

    // Decrypt all the encrypted values in the data
    const transformedData: IDataDecrypted = await transformData(
      dataJson,
      encryptionKey,
      postDataWithEvents,
      postDataAddPhoneNumber
    );

    const decryptedData = JSON.stringify(transformedData);

    // Save decrypted data to archive bucket
    const archiveBucket = config.upload.bucketForArchive;
    const archiveFile = await admin.storage().bucket(archiveBucket).file(filePath);
    await archiveFile.save(decryptedData);

    if (postDataStrategy === "url") {
      // Create a signed URL with 10 minutes expiry
      const signedUrl = await archiveFile.getSignedUrl({
        action: "read",
        expires: moment().add(10, "minutes").toDate(),
      });

      // Send signed URL to file to remote API
      await postData(JSON.stringify({ url: signedUrl[0] }));
    } else if (postDataStrategy === "content") {
      // Send actual contents to remote API
      await postData(decryptedData);
    }
  } catch (error) {
    console.error("processUploadedData: Error while trying to post data to remote URL.", error);
    throw new functions.https.HttpsError("internal", "Internal Server Error.");
  }
};

/**
 * Dooes a POST call to the remote URL with the given data
 */
export const postData = async (data: string | ArrayBuffer): Promise<any> => {
  const { postDataApiLoginUrl, postDataApiUploadUrl, postDataApiUsername, postDataApiPassword, postDataApiClientId } = config.upload;

  const loginBody = {
    "email": postDataApiUsername,
    "password": postDataApiPassword,
    "clientId": postDataApiClientId
  };

  // Login to remote API
  const authResponse = await fetch(postDataApiLoginUrl, {
    method: "post",
    body: JSON.stringify(loginBody),
    headers: { "Content-Type": "application/json" },
  });
  const authJson = await authResponse.json();

  if (authJson.success === false) {
    console.error("processUploadedData: Login to remote API failed", authJson, loginBody);

    return;
  }

  // Post data to remote API
  const uploadResponse = await fetch(postDataApiUploadUrl, {
    method: "post",
    body: data,
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authJson.token}` },
  });

  if (uploadResponse.status === 200) {
    console.log("processUploadedData: Data successfully uploaded to remote API.");
  } else {
    console.log("processUploadedData: Data upload to remote API failed.");
  }
};

/**
 * Transform by decrypting encrypted elements and adding phone number if required.
 */
export const transformData = async (
  data: IData,
  encryptionKey: Buffer,
  includeEvents: boolean = false,
  includePhoneNumber: boolean = false
): Promise<IDataDecrypted> => {
  // Prepare encrypter
  const customEncrypter = new CustomEncrypter(encryptionKey);

  // Decrypt the token
  const rawToken = Buffer.from(data.token, "base64");
  const decryptedTokenB64 = customEncrypter.decodeAndDecrypt(rawToken, [rawToken.length - 32, 16, 16]);
  const decryptedToken: ITokenDecrypted = JSON.parse(Buffer.from(decryptedTokenB64, "base64").toString());
  const token = {
    ...decryptedToken,
    phone: includePhoneNumber ? await getUserPhone(decryptedToken.uid) : null,
  };

  // Decode records
  const records: IRecordDecrypted[] = await Promise.all(
    data.records.map(
      async (record: IRecord): Promise<IRecordDecrypted> => {
        // Decrypt the message
        const rawMsg = Buffer.from(record.msg, "base64");
        const decryptedMsgB64 = customEncrypter.decodeAndDecrypt(rawMsg, [TEMPID_SIZE, IV_SIZE, AUTHTAG_SIZE]);
        const decryptedMsg = Buffer.from(decryptedMsgB64, "base64");

        // Retrieve the UID from the msg
        const uid = decryptedMsg.toString("base64", 0, UID_SIZE);

        // Return the transformed record
        return {
          ...record,

          // Add the decrypted message components
          msg: {
            uid,
            phone: includePhoneNumber ? await getUserPhone(uid) : null,
            startTime: decryptedMsg.readInt32BE(UID_SIZE),
            expiryTime: decryptedMsg.readInt32BE(UID_SIZE + TIME_SIZE),
          },
        };
      }
    )
  );

  // Transform events
  const events: IEventDecrypted[] =
    includeEvents === false
      ? []
      : data.events.map(
          (event: IEvent): IEventDecrypted => {
            const { id, msg, timestamp }: IEvent = event;

            return {
              id,
              msg: msg.includes("Started") ? "S" : "E",
              timestamp,
            };
          }
        );

  return {
    events,
    records,
    token,
  };
};

// Cache UID => Phone lookups for speed
const userLookupCache = new Map<string, string>();

/**
 * Fetch the phone number of the user by the given uid.
 */
export const getUserPhone = async (uid: string): Promise<string> => {
  let phoneNumber: string = "";

  // Return from cache if uid exists in cache
  if (userLookupCache.has(uid)) {
    phoneNumber = userLookupCache.get(uid) || "";
  } else {
    // Lookup from firebase API
    const user = await admin.auth().getUser(uid);
    const value = user.phoneNumber;

    if (value) {
      // Cache for later
      userLookupCache.set(uid, value);
      phoneNumber = value;
    }
  }

  return phoneNumber;
};
