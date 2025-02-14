import React from "react";
import Process from "./Process";
import Routes from "./Routes";
import "./RoutesAndProcess.css";

const RoutesAndProcess = () => {
    return (
        <div className="routesAndProcess">
            <Routes/>
            <div className="separator">Hola</div>
            <Process/>
        </div>
    );
}

export default RoutesAndProcess;