import { signOut } from "firebase/auth";
import { create } from "zustand";
import { auth } from "../firebase/FirebaseAuth";

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (user, isLoading) => {
    if(!user){
      await signOut(auth);
    } 
    return set ({currentUser : user, isLoading : isLoading});
  },
}));
