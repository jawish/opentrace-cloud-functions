# OpenTrace Cloud Functions for TraceEkee

Customized implementation of the `opentrace-community/opentrace-cloud-functions` project.
This is used as part of the supporting backend in the "TraceEkee" Covid-19 contact tracing project in the Maldives.

---

#### Changes from the original project:

- Added a HOTP-based PIN generator for use in the handshake.
- Implemented the processUploadData handler to transform and move the voluntary user uploaded movement data to our separate data management and analysis system.

#### Configuration:

The config file has been changed to support accepting values from environment variables. The following environment variables are required:

- `PROJECT_ID`: Firebase Project ID
- `ENCRYPTION_KEY_PATH`: Firebase encryption key path
- `UPLOAD_BUCKET`: Firebase bucket for uploads
- `UPLOAD_POSTDATA_STRATEGY`: Can be 'url' or 'content'. Url strategy calls the UPLOAD_POSTDATA_API_URL with a signed URL to download the JSON with the encrypted data. Content strategy includes the decrypted data as the JSON body of the call.
- `UPLOAD_POSTDATA_API_URL`: HTTP(S) endpoint to POST the uploaded data to
- `UPLOAD_POSTDATA_ADD_PHONE_NUMBER`: Set to 1 to enable adding user phone number in addition to UID in the data sent to management system.
- `UPLOAD_POSTDATA_WITH_EVENTS`: Set to 1 to enable including events log in the data sent to the management system.
