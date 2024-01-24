// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "andhika-blog.firebaseapp.com",
  projectId: "andhika-blog",
  storageBucket: "andhika-blog.appspot.com",
  messagingSenderId: "570386518491",
  appId: "1:570386518491:web:b47b0fd5895b1d298197fe"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
