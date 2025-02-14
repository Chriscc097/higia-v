import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import "./App.css";
import Content from "./components/app/content/main/Content";
import Menu from "./components/app/menu/Menu";
import LogIn from "./components/auth/LogIn";
import Notification from "./components/utils/Notification";
import { useUserStore } from "./context/userStore";
import { auth } from "./controllers/Firebase/FirebaseConfig";
import Firestore from "./controllers/Firebase/Firestore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        fetchUserInfo(null, false);
        return;
      }

      let userProfile = await Firestore.get("profiles", user.uid);

      if (!userProfile) {
        userProfile = await Firestore.create("profiles", {
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

  if (isLoading) {
    return (
      <div className="loading">
        <img src="./assets/loading.gif" />
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
}

export default App;
