importScripts('https://www.gstatic.com/firebasejs/7.20.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.20.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyDSsiYwuqo_pa7jrdUAKLAMwZTVMzQcDpg",
  authDomain: "callforride.firebaseapp.com",
  databaseURL: "https://callforride.firebaseio.com",
  projectId: "callforride",
  storageBucket: "callforride.appspot.com",
  messagingSenderId: "284481416771",
  appId: "1:284481416771:web:d91677758d61121f512ef6"
  });
  
  const messaging = firebase.messaging();