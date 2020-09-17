const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const config = {
  apiKey: "AIzaSyC6QwKdpc7svuhGCb34vhndjOtqfANGg_M",
  authDomain: "twitter-clone-d5988.firebaseapp.com",
  databaseURL: "https://twitter-clone-d5988.firebaseio.com",
  projectId: "twitter-clone-d5988",
  storageBucket: "twitter-clone-d5988.appspot.com",
  messagingSenderId: "65011136112",
  appId: "1:65011136112:web:71b52f83d3d1bc4bf926b5",
  measurementId: "G-X2YMX33R4J"
};
const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

app.get('/screams', (req, res) => {
  db.collection('screams').get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams)
    })
    .catch((err) => console.log(err))
})

app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .add(newScream)
    .then(doc => {
      res.json({
        message: `document ${doc.id} created successfully`
      })
    })
    .catch(err => {
      res.status(500).json({
        error: "There was an error"
      });
      console.log(`Could not retrieve screams error: ${err}`)
    })
});

//Signup Route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  //TODO: validate data
  db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({
          handle: "this handle already exists"
        });
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({
        token
      });
    })
    .catch(err => {
      console.log(err);
      if(err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: `Email already in use.`})
      } else {
      return res.status(500).json({
        error: err.code
      });
      }
    })
});



exports.api = functions.https.onRequest(app);