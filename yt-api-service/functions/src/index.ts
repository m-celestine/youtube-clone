import * as functions from "firebase-functions/v1";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import type {UserRecord} from "firebase-admin/auth";
import * as logger from "firebase-functions/logger";

initializeApp();

const firestore = new Firestore();

export const createUser = functions.auth.user().onCreate((user: UserRecord) => {
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photoURL: user.photoURL,
  };

  firestore.collection("users").doc(user.uid).set(userInfo);
  logger.info(`User Created: ${JSON.stringify(userInfo)}`);
  return;
});
