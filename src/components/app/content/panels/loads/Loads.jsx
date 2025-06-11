import {
  collection,
  limit,
  onSnapshot,
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
import PageIndex from "../../../../utils/pageIndex/PageIndex";
import Activation from "../activations/Activation";
import ExitForm from "./exit/ExitForm";
import LoadForm from "./form/LoadForm";
import "./Loads.css";

const Loads = () => {
  const [loads, setLoads] = useState([]); // Estado para los datos cargados
  const [lastDoc, setLastDoc] = useState(null); // Estado para el último documento cargado
  const [loading, setLoading] = useState(false); // Estado de carga
  // Para evitar más cargas si ya no hay datos
  const [selectedLoad, setSelectedLoad] = useState(null); // Estado para la carga seleccionada
  const [activationsVisible, setActivationsVisible] = useState(false);
  const [exitFormVisible, setExitFormVisible] = useState(false);

  const [pageIndex, setPageIndex] = useState(1);
  const [pageLength, setPageLength] = useState(30);
  const [hasMore, setHasMore] = useState(true);
 useEffect(() => {
  setLoading(true);
  const loadCollection = collection(db, "loads");
  const queryOrder = orderBy("date", "desc");
  const queryLimit = limit(pageLength);

  const q = lastDoc
    ? query(loadCollection, queryOrder, startAfter(lastDoc), queryLimit)
    : query(loadCollection, queryOrder, queryLimit);

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setLoads(data);
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
         <PageIndex currentIndex={pageIndex} onChange={(i)=> setPageIndex(i)} hasMore={hasMore}/>
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
