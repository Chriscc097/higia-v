import {
  collection,
  orderBy,
  query
} from "firebase/firestore";
import {
  CircleArrowOutUpRight,
  PlusCircle,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { db } from "../../../../../firebase/FireStore";
import {
  dateToYYYYMMDD,
  diffDays,
  getExpColor,
} from "../../../../../utils/dates-functions";
import LoadingPanel from "../../../../utils/loadingPanel/LoadingPanel";
import PageIndex from "../../../../utils/pageIndex/PageIndex";
import Activation from "../activations/Activation";
import ExitForm from "./exit/ExitForm";
import LoadForm from "./form/LoadForm";
import "./Loads.css";

const Loads = () => {
  const [loads, setLoads] = useState([]); // Estado para los datos cargados
  const [loading, setLoading] = useState(false); // Estado de carga
  // Para evitar más cargas si ya no hay datos
  const [selectedLoad, setSelectedLoad] = useState(null); // Estado para la carga seleccionada
  const [activationsVisible, setActivationsVisible] = useState(false);
  const [exitFormVisible, setExitFormVisible] = useState(false);

  const myQueryBuilder = () => {
    return query(collection(db, "loads"), orderBy("date", "desc"));
  };

  const handleDataChange = (data) => {
    setLoads(data)
  };

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
          {loading && <LoadingPanel />}
        </div>
        <PageIndex
          queryBuilder={myQueryBuilder}
          onDataChange={handleDataChange}
          pageSize={14}
        />
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
