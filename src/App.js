import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { toast } from "react-toastify";
import "./App.css";
import Content from "./components/app/content/main/Content";
import Menu from "./components/app/menu/Menu";
import LogIn from "./components/auth/LogIn";
import LoadingPanel from "./components/utils/loadingPanel/LoadingPanel";
import Notification from "./components/utils/Notification";
import useClientStore from "./context/clientStore";
import { useUserStore } from "./context/userStore";
import { auth } from "./firebase/FirebaseAuth";
import FireStore from "./firebase/FireStore";

export default function App() {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        fetchUserInfo(null, false);
        return;
      }

      const userProfile = await FireStore.get("profiles", user.uid);

      if (!userProfile?.profile) {
        toast.warn("No tienes un perfil asignado, contacta al administrador para poder usar esta aplicación");
        fetchUserInfo(null, false);
        return;
      }
      fetchUserInfo(userProfile, false);
      toast.success("Sesión iniciada");
    });

    return () => {
      unsubscribe();
    };
  }, [fetchUserInfo]);

  const loadClients = useClientStore((state) => state.loadClients);

  useEffect(() => {
    loadClients(); // Carga la lista de clientes al iniciar la app
  }, [loadClients]);

  if (isLoading) {
    return (
      <LoadingPanel />
    );
  }

  return (
    <div className="app">
      {currentUser ? (
        <>
          <Menu />
          <Content />
        </>
      ) : (
        <LogIn />
      )}
      <Notification />
    </div>
  );
}
