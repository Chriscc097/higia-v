import { usePanelStore } from "../../../../context/panelStore";
import Client from "../panels/clients/Client";
import Equipments from "../panels/equipments/Equipments";
import Loads from "../panels/loads/Loads";
import Routes from "../panels/routes/Routes";
import Stock from "../panels/stock/Stock";
import "./Content.css";

const Content = () => {
  const { currentPanel } = usePanelStore();

  return (<div className="mainContent">
    {currentPanel === "loads" && <Loads />}
    {currentPanel === "stock" && <Stock />}
    {currentPanel === "client" && <Client />}
    {currentPanel === "routes" && <Routes />}
    {currentPanel === "equipments" && <Equipments />}
  </div>);
};

export default Content;
