import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

const storage = getStorage();

class FirebaseStorage {

    static async uploadFile(file, filePath) {
        console.log(file);
        const path = `${filePath}/${uuidv4()}_${file.name}`;
        const storageRef = ref(storage, path);
        const metadata = {
            contentType: file.type
        }

        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log("Upload is " + progress + "% done");
                },
                (error) => {
                    reject("Something went wrong!" + error.code);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    }
}

export default FirebaseStorage;