import { signOut } from "firebase/auth";
import React from "react";
import { usePanelStore } from "../../../context/panelStore";
import { auth } from "./../../../controllers/Firebase/FirebaseConfig";
import "./Menu.css";

const Menu = () => {
  const { currentPanel, changePanel } = usePanelStore();

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="mainMenu">
      <div className="header">
        <h1>Higia V</h1>
      </div>

      <div className="menuOptions">
        <div className="menuOption" onClick={() => changePanel("loads")}>
          <img src="/check.png" alt="Cargas" />
          <p>Cargas</p>
        </div>
        <div className="menuOption" onClick={() => changePanel("routes")}>
          <img src="./routes.png" alt="Rutas" />
          <p>Rutas</p>
        </div>
        <div className="menuOption" onClick={() => changePanel("stock")}>
          <img src="/instrumentos.png" alt="Inventario" />
          <p>Inventario</p>
        </div>
        <div className="menuOption" onClick={() => changePanel("equipments")}>
          <img src="/autoclave.png" alt="Equipos" />
          <p>Equipos</p>
        </div>
        <div className="menuOption" onClick={() => changePanel("client")}>
          <img src="./contact.png" alt="Loncheras" />
          <p>Loncheras</p>
        </div>
      </div>

      <div className="footer">
        <div
          className="menuOption config"
          onClick={() => changePanel("config")}
        >
          <img src="" alt="" />
          <p>Configuración</p>
        </div>
        <div className="menuOption logOut" onClick={() => handleLogout()}>
          <img src="/logout.png" alt="Cerrar sesión" />
          <p>Cerrar Sesión</p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
