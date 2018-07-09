import firebase from 'firebase'
import { CONFIG } from '../config'
import { FirebaseState } from '../interfaces'
import { getPath } from './url'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: CONFIG.apiKey,
    authDomain: CONFIG.authDomain,
    databaseURL: CONFIG.databaseURL,
    projectId: CONFIG.projectId,
    storageBucket: CONFIG.storageBucket,
    messagingSenderId: CONFIG.messagingSenderId,
  })
}

const database = firebase.database()

export const updateFirebase = (props: FirebaseState) => {
  const path = getPath()
  if (!path) return Promise.reject(null)
  return database.ref(path).update(props || {})
}

export const subscribeToFirebase = (
  cb: (state: FirebaseState | null) => void
) => {
  const path = getPath()
  if (!path.length) return cb({ type: 'main-lobby' })

  database.ref(path).on('value', snapshot => {
    cb(snapshot && snapshot.val())
  })
}
