import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  dateToYYYYMMDD,
  getFirstDayOfMonth,
} from "../../../../../utils/dates-functions";
import BrandedButton from "../../../../utils/brandedButton/BrandedButton";
import BrandedPieChart from "../../../../utils/charts/PieChart";
import LoadingPanel from "../../../../utils/loadingPanel/LoadingPanel";
import useClientStore from "./../../../../../context/clientStore";
import FireStore, { db } from "./../../../../../firebase/FireStore";
import "./Dashboard.css";

const Dashboard = () => {
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const { clients } = useClientStore();

  const [activeclients, setActiveClients] = useState(0);

  const [totalCycles, setTotalCycles] = useState(0);
  const [stockCycles, setStockCycles] = useState(0);
  const [totalLoads, setTotalLoads] = useState(0);
  const [totalCancellations, setTotalCancellations] = useState(0);
  const [totalControls, setTotalControls] = useState(0);
  const [controlTypes, setControlTypes] = useState([]);

  const [loadsPerRoute, setLoadsPerRoute] = useState([]);
  const [cancellationTypes, setCancellationTypes] = useState([]);

  const [totalExits, setTotalExits] = useState(0);
  const [activeStock, setActiveStock] = useState(0);
  const [savedStock, setSavedStock] = useState(0);
  const [equipments, setEquipments] = useState(0);

  useEffect(() => {
    handleActualInfo();
    handleFilter();
  }, []);

  const handleActualInfo = async () => {
    setActiveClients(clients.filter((client) => client.status).length);

    const q = query(collection(db, "stock"));

    const snapshot = await getDocs(q);
    const stocks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setActiveStock(stocks.filter((stock) => !stock.exit).length);
    setSavedStock(stocks.filter((stock) => stock.status === "Almacén").length);
    setEquipments((await FireStore.getQuery("equipments", "status", "==", true)).length);
  };

  const handleFilter = async () => {
    if (isLoading) return;
    setIsLoading(true);

    let start = startDate;
    const end = endDate;

    if (start > end) {
      start = end;
      setStartDate(end);
    }

    start.setHours(0);
    start.setMinutes(0);
    end.setHours(23);
    end.setMinutes(59);

    const q = query(
      collection(db, "loads"),
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<=", Timestamp.fromDate(end))
    );

    const snapshot = await getDocs(q);
    const loads = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTotalLoads(loads.length);
    setTotalCancellations(loads.filter((load) => load.cancellation).length);
    setTotalControls(loads.filter((load) => load.controls).length);

    setTotalCycles(
      loads.reduce((sum, load) => {
        return sum + (load.cycles?.total || 0);
      }, 0)
    );
    setStockCycles(
      loads.reduce((sum, load) => {
        return sum + (load.cycles?.remaining || 0);
      }, 0)
    );
    setTotalExits(totalCycles - stockCycles);

    // Agrupar y contar por route.name
    const groupedByRoute = {};

    loads.forEach((load) => {
      const routeName = load.route?.name || "Sin ruta";
      groupedByRoute[routeName] = (groupedByRoute[routeName] || 0) + 1;
    });

    // Convertir a array para gráficas o tablas
    const loadsPerRoute = Object.entries(groupedByRoute).map(
      ([name, value]) => ({ name, value })
    );

    // Guardar en estado si quieres usarlo en el componente
    setLoadsPerRoute(loadsPerRoute);

    // Agrupar y contar por type
    const groupedByType = {};

    loads.forEach((load) => {
      const type = load.cancellation?.type || "Carga Éxitosa";
      groupedByType[type] = (groupedByType[type] || 0) + 1;
    });

    // Convertir a array para gráficas o tablas
    const cancelTypes = Object.entries(groupedByType).map(([name, value]) => ({
      name,
      value,
    }));

    // Guardar en estado si quieres usarlo en el componente
    setCancellationTypes(cancelTypes);

    const allControls = loads.flatMap((load) => load.controls || []);
    // Agrupar y contar por route.name
    const groupedByControlRes = {};

    allControls.forEach((control) => {
      const result = control?.result || "Carga Éxitosa";
      groupedByControlRes[result] = (groupedByControlRes[result] || 0) + 1;
    });

    // Guardar en estado si quieres usarlo en el componente
    setControlTypes(
      Object.entries(groupedByControlRes).map(([name, value]) => ({
        name,
        value,
      }))
    );

    setIsLoading(false);
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h2>Panel de Control</h2>
      </div>

      <div className="content">
        <div className="dashboard-grid">
          <div className="dashboard-grid-item">
            <h2>{isLoading ? <LoadingPanel label="" /> : savedStock.toLocaleString("es-CO")}</h2>
            <h5>Paquetes Almacén</h5>
          </div>
          <div className="dashboard-grid-item">
            <h2>{isLoading ? <LoadingPanel label="" /> : activeStock.toLocaleString("es-CO")}</h2>
            <h5>Total Inventario Terceros</h5>
          </div>
          <div className="dashboard-grid-item">
            <h2>
              {isLoading ? (
                <LoadingPanel label="" />
              ) : (
                activeclients.toLocaleString("es-CO")
              )}
            </h2>
            <h5>Profesionales Activos</h5>
          </div>
          <div className="dashboard-grid-item">
            <h2>
              {isLoading ? (
                <LoadingPanel label="" />
              ) : (
                equipments.toLocaleString("es-CO")
              )}
            </h2>
            <h5>Total Equipos Activos</h5>
          </div>
        </div>

        <div className="header">
          <h2>Informes</h2>
          <div className="leftHeader">
            <div className="formItem">
              <input
                value={dateToYYYYMMDD(startDate)}
                className="largeInput"
                type="date"
                name="startDate"
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </div>
            <div className="formItem">
              <input
                value={dateToYYYYMMDD(endDate)}
                className="largeInput"
                type="date"
                name="endDate"
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </div>
            <div className="buttonIcon">
              <BrandedButton type="update" onClick={handleFilter} />
            </div>
          </div>
        </div>
        <div className="dashboard-grid">
          <div className="dashboard-grid-item">
            <h2>
              {isLoading ? (
                <LoadingPanel label="" />
              ) : (
                totalCycles.toLocaleString("es-CO")
              )}
            </h2>
            <h5>Paquetes Procesados</h5>
          </div>
          <div className="dashboard-grid-item">
            <h2>
              {isLoading ? (
                <LoadingPanel label="" />
              ) : (
                stockCycles.toLocaleString("es-CO")
              )}
            </h2>
            <h5>Paquetes sin Utilizar</h5>
          </div>
          <div className="dashboard-grid-item">
            <h2>
              {isLoading ? (
                <LoadingPanel label="" />
              ) : (
                totalExits.toLocaleString("es-CO")
              )}
            </h2>
            <h5>Paquetes Utilizados</h5>
          </div>
          <div className="dashboard-grid-item">
            <h2>
              {isLoading ? (
                <LoadingPanel label="" />
              ) : (
                totalLoads.toLocaleString("es-CO")
              )}
            </h2>
            <h5>Cargas Realizadas</h5>
          </div>
          <div className="dashboard-grid-item">
            <h2>
              {isLoading ? (
                <LoadingPanel label="" />
              ) : (
                totalControls.toLocaleString("es-CO")
              )}
            </h2>
            <h5>Controles Realizados</h5>
          </div>
          <div className="dashboard-grid-item">
            <h2>
              {isLoading ? (
                <LoadingPanel label="" />
              ) : (
                totalCancellations.toLocaleString("es-CO")
              )}
            </h2>
            <h5>Cargas Canceladas</h5>
          </div>
        </div>

        <div className="dashboard-grid long">
          <div className="dashboard-grid-item">
            <h3>Rutas Realizadas</h3>
            {isLoading ? (
              <LoadingPanel />
            ) : (
              <BrandedPieChart data={loadsPerRoute} />
            )}
          </div>
          <div className="dashboard-grid-item">
            <h3>Motivos de Cancelación</h3>
            {isLoading ? (
              <LoadingPanel />
            ) : (
              <BrandedPieChart data={cancellationTypes} />
            )}
          </div>
          <div className="dashboard-grid-item">
            <h3>Resultados de los Controles</h3>
            {isLoading ? (
              <LoadingPanel />
            ) : (
              <BrandedPieChart data={controlTypes} />
            )}
          </div>
        </div>
      </div>

      <div className="content"></div>
    </div>
  );
};
export default Dashboard;
