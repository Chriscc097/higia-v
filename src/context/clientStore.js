import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../firebase/FireStore";

const useClientStore = create((set) => {
  let unsubscribe = null;

  return {
    clients: [],
    loadClients: async () => {
      if (unsubscribe) unsubscribe();
      const q = query(collection(db, "clients"), orderBy("businessName", "asc"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const clientsData = snapshot.docs
          .map((doc) => doc.data());
        set({ clients: clientsData });
      });
    },
  };
});

export default useClientStore;
