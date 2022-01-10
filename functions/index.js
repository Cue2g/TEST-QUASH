const functions = require("firebase-functions");
const admin = require("firebase-admin");
const router = require("./app/routes.js");
const express = require("express");
const app = express();
require("dotenv").config();

const serviceAccount = require(process.env.KEY_BD);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://test-quash-default-rtdb.firebaseio.com",
});
router(app);
exports.app = functions.https.onRequest(app);
