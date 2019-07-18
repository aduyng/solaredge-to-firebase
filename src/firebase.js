const admin = require("firebase-admin");
const path = require("path");

const {
  GOOGLE_SERVICE_ACCOUNT_FILE_NAME,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_APP_ID
} = process.env;

const serviceAccount = require(path.join(process.cwd(), GOOGLE_SERVICE_ACCOUNT_FILE_NAME)); //eslint-disable-line

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  authDomain: FIREBASE_AUTH_DOMAIN,
  apiKey: FIREBASE_API_KEY,
  projectId: FIREBASE_PROJECT_ID,
  appId: FIREBASE_APP_ID
});

module.exports = admin;
