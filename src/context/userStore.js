import { create } from "zustand";
import FirebaseAuth from "../firebase/FirebaseAuth";

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (user, isLoading) => {
    if(!user){
      await FirebaseAuth.signOut();
    } 
    return set ({currentUser : user, isLoading : isLoading});
  },
}));
