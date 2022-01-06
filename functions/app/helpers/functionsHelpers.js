const admin   = require('firebase-admin');
const db      = admin.firestore()

exports.search = async function (collectionName) {
    try {
        const query = db.collection(collectionName);
        const querySnapshot = await query.get();
        const docs  = querySnapshot.docs;
        return docs
    } catch (error) {
        return false
    }
}

exports.delete = async function (collectionName, key){
    const today = new Date().toLocaleString()
    try {
        const document = db.collection(collectionName).doc(key)
        await document.delete()
        return  {
            status        : "success",
            description   : "Se ha eliminado el documento",
            requestTime   : today
       }
    } catch (error) {
        return {
            "status"     : "error",
            "requestTime": today,
            "description": error
            }
    }
}

exports.update = async function (collectionName,key,json){
    const today = new Date().toLocaleString()
    try {
        const document = db.collection(collectionName).doc(key)
        await document.update(json);
        return {
            status        : "success",
            description   : "Se ha actualizado el documento",
            requestTime   : today
       }
    } catch (error) {
        return  {
            "status"     : "error",
            "requestTime": today,
            "description": error
            }
    }
}