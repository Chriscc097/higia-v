import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, initializeFirestore, limit, query, setDoc, updateDoc, where } from "firebase/firestore";
import { app } from "./FirebaseConfig";

const db = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
});

class Firestore {

    async getDataBase() {
        return db;
    }

    async get(collectionName, id) {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    }

    async create(collectionName, data) {
        try {
            if (data.id) {
                const docRef = doc(db, collectionName, data.id);
                await setDoc(docRef, data);
                return data;
            } else {
                const docRef = await addDoc(collection(db, collectionName), data);
                data.id = docRef.id;
                return await this.update(collectionName, data);
            }
        } catch (error) {
            console.error("Error saving document: ", error);
        }
    }

    async update(collectionName, data) {
        if (!data.id) {
            throw new Error("El documento debe tener un id para actualizar");
        }
        const docRef = doc(db, collectionName, data.id);
        await updateDoc(docRef, data);
        return data;
    }

    async delete(collectionName, id) {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        return true;
    }

    async getSimpleQuery(collectionName, field, operator, value) {
        const querySnapshot = await getDocs(query(collection(db, collectionName, where(field, operator, value))));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    }

    async getFirstQuery(collectionName, field, operator, value) {
        const querySnapshot = await getDocs(query(collection(db, collectionName, where(field, operator, value), limit(1))));
        if (querySnapshot.empty) {
            return null;
        }
        return querySnapshot.docs[0].data();
    }
}

export default new Firestore();
export { db };
