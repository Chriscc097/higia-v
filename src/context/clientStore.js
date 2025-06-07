import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../firebase/FirebaseDatabase";

const useClientStore = create((set) => {
  let unsubscribe = null;

  return {
    clients: [],
    loadClients: () => {
      if (unsubscribe) unsubscribe(); // Si ya hay un listener activo, lo eliminamos

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
