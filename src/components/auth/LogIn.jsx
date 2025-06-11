import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { CircleCheckBig } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { auth } from "../../firebase/FirebaseAuth";
import "./LogIn.css";

const LogIn = () => {
  const [isSignInMode, setSignInMode] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    if (!email) {
      toast.warn("Escribe un email");
      setLoading(false);
      return;
    }

    if (!password) {
      toast.warn("Escribe una contraseña");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const { email, password, passwordConfirm } = Object.fromEntries(formData);
    if (!email) {
      toast.warn("Escribe un email");
      setLoading(false);
      return;
    }

    if (!password) {
      toast.warn("Escribe una contraseña");
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

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Cuenta creada con éxito");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="loginContainer">
      <div className="loginframe">
        <CircleCheckBig size={30} color="#4ECDC4" />
        <h1>Higia V</h1>
        <form
          className="loginForm"
          onSubmit={!isSignInMode ? handleLogin : handleRegister}
        >
          <input
            type="email"
            placeholder="Correo Electrónico"
            name="email"
            disabled={isLoading}
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            disabled={isLoading}
          />
          {isSignInMode && (
            <input
              type="password"
              name="passwordConfirm"
              placeholder="Contraseña"
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
        <p
          className="signin"
          onClick={() => setSignInMode((isSignInMode) => !isSignInMode)}
        >
          {isSignInMode ? "Inicia sesión" : "Regístrate"}
        </p>
      </div>
    </div>
  );
};

export default LogIn;
