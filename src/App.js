import { onAuthStateChanged } from "firebase/auth";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import "./App.css";
import Content from "./components/app/content/main/Content";
import Menu from "./components/app/menu/Menu";
import LogIn from "./components/auth/LogIn";
import Notification from "./components/utils/Notification";
import useClientStore from "./context/clientStore";
import { useUserStore } from "./context/userStore";
import { auth } from "./firebase/FirebaseAuth";
import FirebaseDataBase from "./firebase/FirebaseDatabase";

export default function App() {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        fetchUserInfo(null, false);
        return;
      }

      let userProfile = await FirebaseDataBase.get("profiles", user.uid);

      if (!userProfile) {
        userProfile = await FirebaseDataBase.save("profiles", {
          id: user.uid,
          email: user.email,
          username: user.email,
        });
      }

      if (!userProfile.profile) {
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
      <div className="loading">
        <Loader size={20} color="#292F36" />
        <p>Cargando</p>
      </div>
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
};
