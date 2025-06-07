import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './FirebaseConfig';

const functions = getFunctions(app);
class FirebaseFunctions {
    static async trigger(functionName, data) {
        try {
            const backFunctions = httpsCallable(functions, "backFunctions");
            let result = await backFunctions({ functionName, data });
            if (result.error) {
                console.error("Error in function call: " + functionName, result.error);
                return { errorCode: "FUNCTION_ERROR", error: result.error };
            }
            return result?.data;
        } catch (error) {
            console.error(error);
            return { errorCode: "FUNCTION_ERROR", error };
        }
    }
}

export default FirebaseFunctions;