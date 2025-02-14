import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseConfig } from "../../config/keys";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

const triggerFunction = async (functionName, payload) => {
    try {
        const myCallableFunction = httpsCallable(functions, functionName);
        let result;
        if (payload) {
            result = await myCallableFunction(payload);
        } else {
            result = await myCallableFunction();
        }
        if (result.data) {
            return result.data;
        }
        return result;
    } catch (error) {
        console.log(error);
        return { errorCode: "FUNCTION_ERROR", error };
    }
}

export { app, auth, triggerFunction };

