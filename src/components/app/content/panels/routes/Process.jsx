import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { Check, CirclePlus, Loader, X } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "../../../../../firebase/FirebaseDatabase";
import PageIndex from "../../../../utils/pageIndex/PageIndex";
import "./Process.css";
import ProcessForm from "./ProcessForm";

const Process = ({ onClose }) => {
  const [process, setProcess] = useState([]); // Estado para los datos cargados
  const [lastDoc, setLastDoc] = useState(null); // Estado para el último documento cargado
  const [loading, setLoading] = useState(false); // Estado de carga
  const [selectedProcess, setSelectedProcess] = useState(null);

  const [pageIndex, setPageIndex] = useState(1);
  const [pageLength, setPageLength] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    setLoading(true);
    const loadCollection = collection(db, "process");
    const queryOrder = orderBy("name", "asc");
    const queryLimit = limit(pageLength);

    const q = lastDoc
      ? query(loadCollection, queryOrder, startAfter(lastDoc), queryLimit)
      : query(loadCollection, queryOrder, queryLimit);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProcess(data);
      setHasMore(snapshot.docs.length === pageLength);
      setLoading(false);
      // Guarda el último documento para la siguiente página
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    });

    return () => unsubscribe();
  }, [pageIndex]);

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
                <X size={15} color="white" />
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
            {loading && (
              <div className="loading">
                <Loader size={20} color="#292F36" />
                <p>Cargando</p>
              </div>
            )}
          </div>
          <PageIndex
            currentIndex={pageIndex}
            onChange={(i) => setPageIndex(i)}
            hasMore={hasMore}
          />
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
