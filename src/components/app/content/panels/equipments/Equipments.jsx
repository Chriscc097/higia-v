import {
  collection,
  orderBy,
  query
} from "firebase/firestore";
import { CirclePlus } from "lucide-react";
import { useRef, useState } from "react";
import { db } from "../../../../../firebase/FireStore";
import LoadingPanel from "../../../../utils/loadingPanel/LoadingPanel";
import PageIndex from "../../../../utils/pageIndex/PageIndex";
import EquipmentForm from "./EquipmentForm";
import "./Equipments.css";

const Equipments = () => {
  const [Equipments, setEquipments] = useState([]); 
  const [Equipment, setEquipment] = useState(null); // Estado para el Equipment seleccionado
  const [loading, setLoading] = useState(false); 
  const centerRef = useRef(null);


  const myQueryBuilder = () => {
    return query(collection(db, "equipments"), orderBy("name", "asc"));
  };

  const handleDataChange = (data) => {
    setEquipments(data)
  };

  const handleSelect = async (Equipment) => {
    setEquipment(Equipment);
  };

  const handleUnSelect = async () => {
    setEquipment(null);
  };

  const handleNew = async () => {
    setEquipment({});
  };

  return (
    <div className="Equipments">
      <div className="header">
        <h2 className="title">Equipos</h2>
        <div className="leftHeader">
          <div className="buttons">
            <div className="imgbutton" onClick={handleNew}>
              <CirclePlus size={20} color="white" />
              <p>Nuevo Equipo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="table-container" ref={centerRef}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Nombre</th>
                <th>Serial</th>
                <th>Usos</th>
              </tr>
            </thead>
            <tbody>
              {Equipments.map((Equipment, index) => {
                return (
                  <tr
                    key={Equipment.id || index}
                    onClick={() => handleSelect(Equipment)}
                  >
                    <td>
                      <span
                        className={
                          Equipment.status
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                      >
                        {Equipment.status ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>{Equipment.name}</td>
                    <td>{Equipment.serial}</td>
                    <td>{Equipment.uses}</td>
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
      {Equipment && (
        <EquipmentForm equipment={Equipment} onClose={handleUnSelect} />
      )}
    </div>
  );
};

export default Equipments;
