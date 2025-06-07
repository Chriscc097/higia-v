import {
  collection,
  getDocs,
  limit,
  query,
  startAfter,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../../../firebase/FirebaseDatabase";
import "./Process.css";
import ProcessForm from "./ProcessForm";
import { Check, Loader, X, CirclePlus } from "lucide-react";

const Process = ({ onClose }) => {
  const [process, setProcess] = useState([]); // Estado para los datos cargados
  const [lastDoc, setLastDoc] = useState(null); // Estado para el último documento cargado
  const [loading, setLoading] = useState(false); // Estado de carga
  const [hasMore, setHasMore] = useState(true); // Para evitar más cargas si ya no hay datos
  const [selectedProcess, setSelectedProcess] = useState(null);

  // Función para cargar los datos iniciales
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const initialQuery = query(collection(db, "process"), limit(20));
      const snapshot = await getDocs(initialQuery);
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setProcess(data);
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
        collection(db, "process"),
        startAfter(lastDoc),
        limit(10)
      );
      const snapshot = await getDocs(nextQuery);
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setProcess((prevProcess) => [...prevProcess, ...data]);
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
    <div className="formContainer">
      <div className="process">
        <div className="header">
          <h2 className="title">Procesos</h2>
          <div className="leftHeader">
            <div className="buttons">
              <div className="imgbutton" onClick={() => setSelectedProcess({})}>
                <CirclePlus size={20} color="white" />
                <p>Nuevo Proceso</p>
              </div>
            </div>
            <div className="closeButtonColumn">
              <div className="buttonIcon close" onClick={() => onClose()}>
                <X size={15} color="white"/>
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
                  <th>Proceso</th>
                  <th>Temperatura</th>
                  <th>Presión</th>
                  <th>Tiempo</th>
                  <th>Activaciones</th>
                  <th>Insumos</th>
                  <th>Equipos</th>
                </tr>
              </thead>
              <tbody>
                {process?.map((processItem, index) => {
                  return (
                    <tr
                      key={index}
                      onClick={() => setSelectedProcess(processItem)}
                    >
                      <td>{index + 1}</td>
                      <td>{processItem.name}</td>
                      <td>
                        {processItem.requirements.temp && (
                          <div className="icon">
                            <Check size={20} color="white" />
                          </div>
                        )}
                      </td>
                      <td>
                        {processItem.requirements.psi && (
                          <div className="icon">
                            <Check size={20} color="white" />
                          </div>
                        )}
                      </td>
                      <td>
                        {processItem.requirements.min && (
                          <div className="icon">
                            <Check size={20} color="white" />
                          </div>
                        )}
                      </td>
                      <td>
                        {" "}
                        {processItem.requirements.act && (
                          <div className="icon">
                            <Check size={20} color="white" />
                          </div>
                        )}
                      </td>
                      <td>
                        {" "}
                        {processItem.requirements.supplies && (
                          <div className="icon">
                            <Check size={20} color="white" />
                          </div>
                        )}
                      </td>
                      <td>
                        {processItem.requirements.equipments && (
                          <div className="icon">
                            <Check size={20} color="white" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {loading && <div className="loading"><Loader size={20} color="#292F36" /><p>Cargando</p></div>}
          </div>
        </div>
        {selectedProcess && (
          <ProcessForm
            onClose={() => setSelectedProcess(null)}
            process={selectedProcess}
          />
        )}
      </div>
    </div>
  );
};

export default Process;
