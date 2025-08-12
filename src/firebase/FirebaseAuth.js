import { getToken } from "firebase/app-check";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { toast } from "react-toastify";
import { appCheck, auth, authGoogle } from "./FirebaseConfig";
import FireStore from "./FireStore";

class FirebaseAuth {
    static async signOut() {
        await getToken(appCheck, true);
        await signOut(auth);
    }

    static async signInWithEmailAndPassword(email, password) {
        try {
            await getToken(appCheck, true);
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Sesión iniciada");
            return true;
        } catch (e) {
            console.error("Error signing in with email and password: ", e);
            toast.error(e.message);
        }
    }

    static async createUserWithEmailAndPassword(email, password, displayName) {
        await getToken(appCheck, true);
        const userRef = await createUserWithEmailAndPassword(auth, email, password);
        const user = userRef?.user;
        updateProfile(user, {
            displayName,
        });
        await FireStore.save("profiles", { id: user.uid, displayName, email })
        toast.success("Usuario creado");
        return true;
    }

    static async signInWithGoogle() {
        await getToken(appCheck, true);
        const result = await auth.signInWithPopup(authGoogle);
        const user = result.user;
        const profile = await FireStore.get("profiles", user.uid);
        if (!profile) await FireStore.save("profiles", { id: user.uid, username: user.username, email: user.email })
        return true;
    }
}

export default FirebaseAuth;
export { auth, authGoogle };
