import {
    collection,
    limit,
    onSnapshot,
    orderBy,
    query,
    startAfter,
} from "firebase/firestore";
import { CirclePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { db } from "../../../../../firebase/FireStore";
import LoadingPanel from "../../../../utils/loadingPanel/LoadingPanel";
import PageIndex from "../../../../utils/pageIndex/PageIndex";
import EquipmentForm from "./EquipmentForm";
import "./Equipments.css";

const Equipments = () => {
  const [Equipments, setEquipments] = useState([]); // Estado para los datos cargados
  const [lastDoc, setLastDoc] = useState(null); // Estado para el último documento cargado
  const [Equipment, setEquipment] = useState(null); // Estado para el Equipment seleccionado
  const [loading, setLoading] = useState(false); // Estado de carga
  const [lastVisible, setLastVisible] = useState(null);
  const centerRef = useRef(null);

  const [pageIndex, setPageIndex] = useState(1);
  const [pageLength, setPageLength] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    setLoading(true);
    const loadCollection = collection(db, "equipments");
    const queryOrder = orderBy("name", "asc");
    const queryLimit = limit(pageLength);

    const q = lastDoc
      ? query(loadCollection, queryOrder, startAfter(lastDoc), queryLimit)
      : query(loadCollection, queryOrder, queryLimit);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEquipments(data);
      setHasMore(snapshot.docs.length === pageLength);
      setLoading(false);
      // Guarda el último documento para la siguiente página
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    });

    return () => unsubscribe();
  }, [pageIndex]);

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
          {loading && <LoadingPanel/>}
        </div>
         <PageIndex
            currentIndex={pageIndex}
            onChange={(i) => setPageIndex(i)}
            hasMore={hasMore}
          />
      </div>
      {Equipment && (
        <EquipmentForm equipment={Equipment} onClose={handleUnSelect} />
      )}
    </div>
  );
};

export default Equipments;
