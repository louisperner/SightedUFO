const functions = require('firebase-functions');
const admin = require('firebase-admin')
const geofirestore = require('geofirestore');   

admin.initializeApp();

const defaultFirestore = admin.firestore(); 
const geoFirestore = new geofirestore.GeoFirestore(defaultFirestore); 
const geoCollection = geoFirestore.collection('Users'); 

exports.createSight = functions.firestore
    .document('COLLECTION_NAME/{userId}')
    .onCreate((snap, context) => {
        const location = snap.get("coordinate");

        // Create a GeoQuery based on a location
        const query = geoCollection.near({ center: new admin.firestore.GeoPoint(location["latitude"], location["longitude"]), radius: 500 });

        // Get query (as Promise)
        query.get().then((value) => {
            value.forEach((doc) => {
                const payload = {
                    token: doc.id,
                    notification: {
                        title: 'Sigthed',
                        body: 'Look up at the Sky... 🛸'
                    },
                    data: {
                        body: 'Look up at the Sky... 🛸',
                    }
                };
        
                admin.messaging().send(payload).then((response) => {
                    // Response
                    console.log('Successfully sent message:', response);
                    return { success: true };
                }).catch((error) => {
                    return { error: error.code };
                });
            });
        })
    });
