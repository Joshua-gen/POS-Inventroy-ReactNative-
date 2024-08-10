import firebase  from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage'; 

const firebaseConfig = {
    apiKey: "AIzaSyB4PzQPEvU70I6anQIBszAlLZL3F97I1Ps",
    authDomain: "mable-pos.firebaseapp.com",
    projectId: "mable-pos",
    storageBucket: "mable-pos.appspot.com",
    messagingSenderId: "754642632802",
    appId: "1:754642632802:web:b640dee04fb50125eb913b",
    measurementId: "G-WX2BCQL7LL"
  };

  if (!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
  }
  
  export { firebase };