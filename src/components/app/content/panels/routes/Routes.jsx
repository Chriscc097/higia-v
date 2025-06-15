import {
  collection,
  orderBy,
  query
} from "firebase/firestore";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { db } from "../../../../../firebase/FireStore";
import LoadingPanel from "../../../../utils/loadingPanel/LoadingPanel";
import PageIndex from "../../../../utils/pageIndex/PageIndex";
import Process from "./Process";
import RouteForm from "./RouteForm";
import "./Routes.css";

const Routes = () => {
  const [routes, setRoutes] = useState([]); // Estado para los datos cargados
  const [loading, setLoading] = useState(false); // Estado de carga
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [processVisible, setProcessVisible] = useState(false);

  const myQueryBuilder = () => {
    return query(collection(db, "routes"), orderBy("name", "asc"));
  };

  const handleDataChange = (data) => {
    setRoutes(data)
  };

  return (
    <div className="routes">
      <div className="header">
        <h2 className="title">Rutas</h2>
        <div className="leftHeader">
          <div className="buttons">
            <div
              className="imgbutton secondary"
              onClick={() => setProcessVisible(true)}
            >
              <p>Procesos</p>
            </div>
            <div className="imgbutton" onClick={() => setSelectedRoute({})}>
              <CirclePlus size={20} color="white" />
              <p>Nueva Ruta</p>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ruta</th>
                <th>Descripción</th>
                <th>Procesos</th>
              </tr>
            </thead>
            <tbody>
              {routes?.map((route, index) => {
                return (
                  <tr key={index} onClick={() => setSelectedRoute(route)}>
                    <td>{index + 1}</td>
                    <td>{route.name}</td>
                    <td>
                      {route.content.length > 60
                        ? route.content.slice(0, 60) + "..."
                        : route.content}
                    </td>
                    <td>{route.process.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && <LoadingPanel />}
        </div>
        <PageIndex
           queryBuilder={myQueryBuilder}
            onDataChange={handleDataChange}
            pageSize={14}
          />
      </div>
      {selectedRoute && (
        <RouteForm
          onClose={() => setSelectedRoute(null)}
          route={selectedRoute}
        />
      )}
      {processVisible && <Process onClose={() => setProcessVisible(false)} />}
    </div>
  );
};

export default Routes;
