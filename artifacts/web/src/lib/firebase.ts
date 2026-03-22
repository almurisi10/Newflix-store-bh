import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQiWBcLbBVneGBSRmoTsFSsYJWUWX9_gQ",
  authDomain: "dukani-emq1m.firebaseapp.com",
  databaseURL: "https://dukani-emq1m-default-rtdb.firebaseio.com",
  projectId: "dukani-emq1m",
  storageBucket: "dukani-emq1m.firebasestorage.app",
  messagingSenderId: "389471028986",
  appId: "1:389471028986:web:cc567736d47ef97067eb43"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
