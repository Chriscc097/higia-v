import {
  collection,
  orderBy,
  query
} from "firebase/firestore";
import { Check } from "lucide-react";
import { useState } from "react";
import { db } from "../../../../../firebase/FireStore";
import BrandedButton from "../../../../utils/brandedButton/BrandedButton";
import LoadingPanel from "../../../../utils/loadingPanel/LoadingPanel";
import PageIndex from "../../../../utils/pageIndex/PageIndex";
import "./Process.css";
import ProcessForm from "./ProcessForm";

const Process = ({ onClose }) => {
  const [process, setProcess] = useState([]); // Estado para los datos cargados
  const [loading, setLoading] = useState(false); // Estado de carga
  const [selectedProcess, setSelectedProcess] = useState(null);

  const myQueryBuilder = () => {
    return query(collection(db, "process"), orderBy("name", "asc"));
  };

  const handleDataChange = (data) => {
    setProcess(data)
  };

  return (
    <div className="formContainer">
      <div className="process">
        <div className="header">
          <h2 className="title">Procesos</h2>
          <div className="leftHeader">
            <div className="buttons">
              <BrandedButton
                type="add"
                label={"Nuevo Proceso"}
                onClick={() => setSelectedProcess({})}
              />
              <div className="closeButtonColumn">
                <BrandedButton type="close" onClick={() => onClose()} />
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
                  <th>Tiempo</th>
                  <th>Temperatura</th>
                  <th>Presión</th>
                  <th>Activaciones</th>
                  <th>Insumos</th>
                  <th>Equipos</th>
                  <th>Adicionales</th>
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
                        {processItem.requirements.min && (
                          <div className="icon">
                            <Check size={20} color="white" />
                          </div>
                        )}
                      </td>
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
                      <td>
                        {processItem.requirements.others && (
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
            {loading && <LoadingPanel />}
          </div>
          <PageIndex
            queryBuilder={myQueryBuilder}
            onDataChange={handleDataChange}
            pageSize={14}
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
