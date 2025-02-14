import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../../../../controllers/Firebase/Firestore";
import { dateToYYYYMMDD } from "../../../../../utils/dates-functions";
import LoadForm from "./LoadForm";
import "./Loads.css";

const Loads = () => {
  const [loads, setLoads] = useState([]); // Estado para los datos cargados
  const [lastDoc, setLastDoc] = useState(null); // Estado para el último documento cargado
  const [loading, setLoading] = useState(false); // Estado de carga
  const [hasMore, setHasMore] = useState(true); // Para evitar más cargas si ya no hay datos
  const [selectedLoad, setSelectedLoad] = useState(null); // Estado para la carga seleccionada

  // Función para cargar los datos iniciales
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const initialQuery = query(
        collection(db, "loads"),
        orderBy("startedAt", "desc"),
        limit(20)
      );
      const snapshot = await getDocs(initialQuery);
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setLoads(data);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]); // Guarda el último documento para paginación
      setHasMore(snapshot.docs.length === 20); // Si hay menos de 20 documentos, no hay más datos
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  // Función para cargar más datos (scroll infinito)
  const loadMoreData = async () => {
    if (!hasMore || loading) return; // Evita cargar si no hay más datos o ya está cargando
    setLoading(true);
    try {
      const nextQuery = query(
        collection(db, "loads"),
        orderBy("startedAt", "desc"),
        startAfter(lastDoc),
        limit(10)
      );
      const snapshot = await getDocs(nextQuery);
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setLoads((prevLoads) => [...prevLoads, ...data]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]); // Actualiza el último documento
      setHasMore(snapshot.docs.length === 10); // Si hay menos de 10 documentos, no hay más datos
    } catch (error) {
      console.error("Error loading more data:", error);
    }
    setLoading(false);
  };

  // Hook para cargar los datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Detectar el scroll al final de la página
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 100 >=
      document.documentElement.offsetHeight
    ) {
      loadMoreData();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Limpia el evento al desmontar
  }, [lastDoc, hasMore, loading]);

  return (
    <div className="loads">
      <div className="header">
        <h2 className="title">Cargas</h2>
        <div className="leftHeader">
          <div className="buttons">
            <div className="imgbutton" onClick={() => setSelectedLoad({})}>
              <img src="/add_white.png" alt="Nueva Carga" />
              <p>Nueva carga</p>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Carga</th>
                <th>Responsable</th>
                <th>Ruta</th>
                <th>Exp</th>
                <th>Paquetes</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load, index) => {
                const lotNumber = load?.lot
                  ? `${load.lot}#${load.number || ""}`
                  : "N/A";
                const expDate = load.exp?.toDate
                  ? dateToYYYYMMDD(load.exp.toDate())
                  : "Sin fecha";
                const totalPackages = load.packages?.length || 0;
                const remainingPackages = load.packages
                  ? load.packages.filter((pkg) => !pkg.exited).length
                  : 0;

                return (
                  <tr key={load.id || index} onClick={() => setSelectedLoad(load)}>
                    <td>
                      <span
                        className={
                          load.status === "En proceso"
                            ? "status-badge active"
                            : load.status === "Terminada"
                            ? "status-badge ended"
                            : "status-badge aborted"
                        }
                      >
                        {load.status}
                      </span>
                    </td>
                    <td>{lotNumber}</td>
                    <td>{load?.user?.name || "Sin responsable"}</td>
                    <td>{load?.route?.name || "Sin Ruta"}</td>
                    <td>{expDate}</td>
                    <td>
                      {remainingPackages}/{totalPackages}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && <div className="loading">Cargando...</div>}
        </div>
        {selectedLoad && (<LoadForm onClose={() => setSelectedLoad(null)} load={selectedLoad} />)}
      </div>
    </div>
  );
};

export default Loads;
