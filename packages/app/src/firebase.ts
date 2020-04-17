import firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyD1DSW9WV42VJiIso2HV8yhf4Jo6tt10iA",
  authDomain: "movie-voting-d2f6e.firebaseapp.com",
  databaseURL: "https://movie-voting-d2f6e.firebaseio.com",
  projectId: "movie-voting-d2f6e",
  storageBucket: "movie-voting-d2f6e.appspot.com",
  messagingSenderId: "436596132520",
  appId: "1:436596132520:web:504bd76ea29e5711f6d09d"
};

firebase.initializeApp(firebaseConfig);

export default firebase;