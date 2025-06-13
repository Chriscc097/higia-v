import { CircleCheckBig } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import FirebaseAuth from "../../firebase/FirebaseAuth";
import "./LogIn.css";

const LogIn = () => {
  const [isSignInMode, setSignInMode] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { username, password, passwordConfirm, displayName } =
      Object.fromEntries(formData);

    if (!username) {
      toast.warn("Escribe un Correo");
      setLoading(false);
      return;
    }
    if (!password) {
      toast.warn("Escribe una contraseña");
      setLoading(false);
      return;
    }
    if (isSignInMode) {
      if (!displayName) {
        toast.warn("Escribe un nombre de usuario");
        setLoading(false);
        return;
      }
      if (!passwordConfirm) {
        toast.warn("Confirma tu contraseña");
        setLoading(false);
        return;
      }
      if (password !== passwordConfirm) {
        toast.warn("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignInMode) {
        await FirebaseAuth.createUserWithusernameAndPassword(
          username,
          password,
          displayName
        );
        toast.success("Cuenta creada con éxito");
      } else {
        await FirebaseAuth.signInWithEmailAndPassword(username, password);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginContainer">
      <div className="loginframe">
        <CircleCheckBig size={30} color="#4ECDC4" />
        <h1>Higia V</h1>
        <form className="loginForm" onSubmit={handleSubmit}>
          {isSignInMode && (
            <input
              type="text"
              name="displayName"
              placeholder="Nombre de usuario"
              disabled={isLoading}
            />
          )}
          <input
            type="text"
            placeholder="Correo Electrónico"
            name="username"
            autoComplete="username"
            disabled={isLoading}
          />
          <input
            type="password"
            name="password"
            autoComplete={isSignInMode ? "new-password" : "current-password"}
            placeholder="Contraseña"
            disabled={isLoading}
          />
          {isSignInMode && (
            <input
              type="password"
              name="passwordConfirm"
              autoComplete="new-password"
              placeholder="Confirmar contraseña"
              disabled={isLoading}
            />
          )}
          <button type="submit" disabled={isLoading}>
            {isLoading
              ? "Cargando"
              : isSignInMode
              ? "Solicitar Registro"
              : "Iniciar Sesión"}
          </button>
        </form>
        <p className="signin" onClick={() => setSignInMode(!isSignInMode)}>
          {isSignInMode ? "Inicia sesión" : "Regístrate"}
        </p>
      </div>
    </div>
  );
};

export default LogIn;
