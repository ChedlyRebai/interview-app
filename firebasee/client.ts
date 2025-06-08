// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzhohCz05mdCEHiksD3oKY9q-XJJ03-AM",
  authDomain: "vapi-7f631.firebaseapp.com",
  projectId: "vapi-7f631",
  storageBucket: "vapi-7f631.firebasestorage.app",
  messagingSenderId: "805344309802",
  appId: "1:805344309802:web:ad2362c0c716ebc6c44953",
  measurementId: "G-2QL7D0VTNZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);