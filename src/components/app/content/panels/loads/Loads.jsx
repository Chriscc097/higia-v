import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import {
  CircleArrowOutUpRight,
  Loader,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "../../../../../firebase/FirebaseDatabase";
import {
  dateToYYYYMMDD,
  diffDays,
  getExpColor,
} from "../../../../../utils/dates-functions";
import Activation from "../activations/Activation";
import ExitForm from "./exit/ExitForm";
import LoadForm from "./form/LoadForm";
import "./Loads.css";

const Loads = () => {
  const [loads, setLoads] = useState([]); // Estado para los datos cargados
  const [lastDoc, setLastDoc] = useState(null); // Estado para el último documento cargado
  const [loading, setLoading] = useState(false); // Estado de carga
  const [hasMore, setHasMore] = useState(true); // Para evitar más cargas si ya no hay datos
  const [selectedLoad, setSelectedLoad] = useState(null); // Estado para la carga seleccionada
  const [activationsVisible, setActivationsVisible] = useState(false);
  const [exitFormVisible, setExitFormVisible] = useState(false);

  // Función para cargar los datos iniciales
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const initialQuery = query(
        collection(db, "loads"),
        orderBy("date", "desc"),
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
        orderBy("date", "desc"),
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
            <div
              className="imgbutton terciary"
              onClick={() => setExitFormVisible(true)}
            >
              <CircleArrowOutUpRight color="white" size={20} />
              <p>Salidas</p>
            </div>
            <div
              className="imgbutton secondary"
              onClick={() => setActivationsVisible(true)}
            >
              <ShieldCheck color="white" size={20} />
              <p>Activaciones</p>
            </div>
            <div className="imgbutton" onClick={() => setSelectedLoad({})}>
              <PlusCircle color="white" size={20} />
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
                <th>Vencimiento</th>
                <th>Paquetes</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load, index) => {
                const lotNumber = load?.id;
                const totalPackages = load.cycles.total;
                const remainingPackages = load.cycles.remaining;
                return (
                  <tr
                    key={load.id || index}
                    onClick={() => setSelectedLoad(load)}
                  >
                    <td>
                      <span
                        className={
                          load.status === "En Curso"
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
                    <td>{load?.user?.username}</td>
                    <td>{load?.route?.name}</td>
                    <td>
                      <div className="expLabel">
                        {dateToYYYYMMDD(load.exp.toDate())}
                        <span
                          className={
                            "expColor " +
                            getExpColor(diffDays(load.exp.toDate()))
                          }
                        >
                          {diffDays(load.exp.toDate())}
                        </span>
                      </div>
                    </td>
                    <td>
                      {remainingPackages}/{totalPackages}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && (
            <div className="loading">
              <Loader size={20} color="#292F36" />
              <p>Cargando</p>
            </div>
          )}
        </div>
        {selectedLoad && (
          <LoadForm onClose={() => setSelectedLoad(null)} load={selectedLoad} />
        )}
        {activationsVisible && (
          <Activation onClose={() => setActivationsVisible(false)} />
        )}
        {exitFormVisible && (
          <ExitForm onClose={() => setExitFormVisible(false)} />
        )}
      </div>
    </div>
  );
};

export default Loads;
