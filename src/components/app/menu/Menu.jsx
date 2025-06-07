import { signOut } from "firebase/auth";
import { CircleCheck, CircleUserRound, LogOut, Package2, Route, Settings, Wrench } from "lucide-react";
import { usePanelStore } from "../../../context/panelStore";
import { auth } from "./../../../firebase/FirebaseAuth";
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
          <CircleCheck color="#292F36" size={20}/>
          <p>Cargas</p>
        </div>
        <div className="menuOption" onClick={() => changePanel("routes")}>
          <Route color="#292F36" size={20}/>
          <p>Rutas</p>
        </div>
        <div className="menuOption" onClick={() => changePanel("stock")}>
           <Package2 color="#292F36" size={20}/>
          <p>Paquetes</p>
        </div>
        <div className="menuOption" onClick={() => changePanel("equipments")}>
           <Wrench color="#292F36" size={20}/>
          <p>Equipos</p>
        </div>
        <div className="menuOption" onClick={() => changePanel("client")}>
          <CircleUserRound color="#292F36" size={20}/>
          <p>Profesionales</p>
        </div>
      </div>

      <div className="footer">
        <div
          className="menuOption config"
          onClick={() => changePanel("config")}
        >
          <Settings color="#292F36" size={20}/>
          <p>Configuración</p>
        </div>
        <div className="menuOption logOut" onClick={() => handleLogout()}>
           <LogOut color="#292F36" size={20}/>
          <p>Cerrar Sesión</p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
