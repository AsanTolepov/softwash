// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Agar analytics kerak bo'lsa, keyin qo'shamiz:
// import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase config – bu yerga Firebase konsoldagi objectni to'liq qo'ying
// Siz ko'rsatgan snippetdagi firebaseConfig'ni shu yerga nusxa ko'chirasiz
const firebaseConfig = {
    apiKey: "AIzaSyAkvuL9cfS83bdzG_fw9-tA1dDAVmlCs8c",
    authDomain: "softwash-80751.firebaseapp.com",
    projectId: "softwash-80751",
    storageBucket: "softwash-80751.firebasestorage.app",
    messagingSenderId: "342752897832",
    appId: "1:342752897832:web:86163c283a069e029cfe1d",
    measurementId: "G-YVLCFHYDVM"
  };

// Firebase ilovasini ishga tushiramiz
export const app = initializeApp(firebaseConfig);

// Firestore instansiyasini olib chiqamiz
export const db = getFirestore(app);

// Agar analytics kerak bo'lsa (ixtiyoriy):
// export const analyticsPromise =
//   typeof window !== "undefined"
//     ? isSupported().then((supported) =>
//         supported ? getAnalytics(app) : null
//       )
//     : Promise.resolve(null);