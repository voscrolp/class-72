import firebase from 'firebase'
require('@firebase/firestore')

const firebaseConfig = {
  apiKey: "AIzaSyDN5nairUhgjIJTjIt8wGMJQr7dvr5LrcI",
  authDomain: "willy-app-4348a.firebaseapp.com",
  projectId: "willy-app-4348a",
  storageBucket: "willy-app-4348a.appspot.com",
  messagingSenderId: "380465739249",
  appId: "1:380465739249:web:f6f27325828d7be1de0050"
};

//if(!firebase.app.length){
    firebase.initializeApp(firebaseConfig)
//}
export default firebase.firestore();