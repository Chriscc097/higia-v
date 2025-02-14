import {
  collection,
  getDocs,
  limit,
  query,
  startAfter,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../../../../controllers/Firebase/Firestore";
import RouteForm from "./RouteForm";
import "./Routes.css";

const Routes = () => {
  const [routes, setRoutes] = useState([]); // Estado para los datos cargados
  const [lastDoc, setLastDoc] = useState(null); // Estado para el último documento cargado
  const [loading, setLoading] = useState(false); // Estado de carga
  const [hasMore, setHasMore] = useState(true); // Para evitar más cargas si ya no hay datos
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Función para cargar los datos iniciales
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const initialQuery = query(collection(db, "routes"), limit(20));
      const snapshot = await getDocs(initialQuery);
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setRoutes(data);
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
        collection(db, "routes"),
        startAfter(lastDoc),
        limit(10)
      );
      const snapshot = await getDocs(nextQuery);
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setRoutes((prevRoutes) => [...prevRoutes, ...data]);
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
    <div className="routes">
      <div className="header">
        <h2 className="title">Rutas</h2>
        <div className="leftHeader">
          <div className="buttons">
            <div className="imgbutton" onClick={() => setSelectedRoute({})}>
              <img src="/add_white.png" alt="Nueva Ruta" />
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
                    <td>{route.content}</td>
                    <td>{route.process.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && <div className="loading">Cargando...</div>}
        </div>
      </div>
      {selectedRoute && (
        <RouteForm
          onClose={() => setSelectedRoute(null)}
          route={selectedRoute}
        />
      )}
    </div>
  );
};

export default Routes;
