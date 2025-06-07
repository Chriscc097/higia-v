
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, initializeFirestore, query, setDoc, updateDoc, where } from "firebase/firestore";
import { app } from "./FirebaseConfig.js";

const db = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
});

class FirebaseDataBase {

    static async save(collectionName, data) {
        try {
            if (data.id) {
                const docRef = doc(db, collectionName, data.id);
                await setDoc(docRef, data);
                return data;
            } else {
                const docRef = await addDoc(collection(db, collectionName), data);
                data.id = docRef.id; // Asigna el id del documento creado
                return this.update(collectionName, data);
            }
        } catch (error) {
            console.error("Error saving document: ", error);
        }
    }

    static async get(collectionName, id) {
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                let docData = docSnap.data();
                docData.id = docSnap.id; // Asegúrate de que el id esté en los datos
                return docData;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error getting document: ", error);
        }
    }

    static async update(collectionName, data) {
        if (!data.id) {
            throw new Error("El documento debe tener un id para actualizar");
        }
        try {
            const docRef = doc(db, collectionName, data.id);
            await updateDoc(docRef, data);
            return data;
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    }

    static async delete(collectionName, id) {
        try {
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    }

    static async getQuery(collectionName, fieldName, operator, searchValue) {
        if (!collectionName || !fieldName || !operator || !searchValue) throw new Error("FirebaseDataBase.getQuery: Missing data")
        const queryRef = query(collection(db, collectionName), where(fieldName, operator, searchValue));
        const querySnapshot = await getDocs(queryRef);
        let results = new Set();
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                results.add(doc.data());
            })
        }
        return Array.from(results);
    }
}

export default FirebaseDataBase;
export { db };
