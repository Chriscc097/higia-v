import React from "react";
import { usePanelStore } from "../../../../context/panelStore";
import Client from "../panels/clients/Client";
import Equipments from "../panels/equipments/Equipments";
import Loads from "../panels/loads/Loads";
import RoutesAndProcess from "../panels/routes/RoutesAndProcess";
import Stock from "../panels/stock/Stock";
import "./Content.css";

const Content = () => {
  const { currentPanel, changePanel } = usePanelStore();

  return <div className="mainContent">
    {currentPanel === "loads" && <Loads />}
    {currentPanel === "stock" && <Stock />}
    {currentPanel === "client" && <Client />}
    {currentPanel === "routes" && <RoutesAndProcess />}
    {currentPanel === "equipments" && <Equipments />}
  </div>;
};

export default Content;
