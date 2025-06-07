import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { toast } from "react-toastify";
import { app } from "./FirebaseConfig";
import FirebaseDataBase from "./FirebaseDatabase";

const auth = getAuth(app);
const authGoogle = new GoogleAuthProvider(app);


class FirebaseAuth {
    static async signOut() {
        try {
            await signOut(auth);
            console.log("User signed out successfully");
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    }

    static async signInWithEmailAndPassword(email, password) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Sesión iniciada");
            return true;
        } catch (e) {
            console.error("Error signing in with email and password: ", e);
            toast.error(e.message);
        }
    }

    static async createUserWithEmailAndPassword(email, password, username) {
        const userRef = await createUserWithEmailAndPassword(auth, email, password);
        const user = userRef?.user;
        updateProfile(user, {
            displayName: username,
        });
        await FirebaseDataBase.save("profiles", { id: user.uid, username, email })
        toast.success("Usuario creado");
        return true;
    }

    static async signInWithGoogle() {
        const result = await auth.signInWithPopup(authGoogle);
        const user = result.user;
        const profile = await FirebaseDataBase.get("profiles", user.uid);
        if (!profile) await FirebaseDataBase.save("profiles", { id: user.uid, username: user.username, email: user.email })
        return true;
    }
}

export default FirebaseAuth;
export { auth, authGoogle };
