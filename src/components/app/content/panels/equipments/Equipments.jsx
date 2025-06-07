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
import { db } from "../../../../../firebase/FirebaseDatabase";
import EquipmentForm from "./EquipmentForm";
import "./Equipments.css";

const Equipments = () => {
  const [Equipments, setEquipments] = useState([]); // Estado para los datos cargados
  const [lastDoc, setLastDoc] = useState(null); // Estado para el último documento cargado
  const [Equipment, setEquipment] = useState(null); // Estado para el Equipment seleccionado
  const [loading, setLoading] = useState(false); // Estado de carga
  const [hasMore, setHasMore] = useState(true); // Para evitar más cargas si ya no hay datos
  const [lastVisible, setLastVisible] = useState(null);
  const centerRef = useRef(null);

  // Function to load initial data
  const loadEquipments = async (initial = false) => {
    if (loading) return;

    setLoading(true);
    const equipmentsCollection = collection(db, "equipments");
    let q;

    if (initial) {
      q = query(equipmentsCollection, orderBy("name", "asc"), limit(20));
    } else {
      q = query(
        equipmentsCollection,
        orderBy("name", "asc"),
        startAfter(lastVisible),
        limit(32)
      );
    }
    onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const newEquipments = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Incluye el ID del documento para evitar duplicados
          ...doc.data(),
        }));

        setEquipments((prev) => {
          const mergedEquipments = [...prev, ...newEquipments];
          // Eliminar duplicados basados en el ID
          const uniqueEquipments = mergedEquipments.filter(
            (Equipment, index, self) =>
              index === self.findIndex((c) => c.id === Equipment.id)
          );
          return initial ? newEquipments : uniqueEquipments;
        });

        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
      setLoading(false);
    });
  };

  // Hook para cargar los datos iniciales
  useEffect(() => {
    loadEquipments(true);
  }, []);

  useEffect(() => {
    centerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [Equipments]);

  // Manejo del scroll
  const handleScroll = () => {
    const container = centerRef.current;

    if (
      container.scrollTop + container.EquipmentHeight >=
      container.scrollHeight - 10
    ) {
      loadEquipments(); // Cargar más contactos al llegar al final
    }
  };

  useEffect(() => {
    const centerDiv = centerRef.current;
    if (centerDiv) {
      centerDiv.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (centerDiv) {
        centerDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, [lastVisible]);

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
          {loading && <div className="loading">Cargando...</div>}
        </div>
      </div>
      {Equipment && (
        <EquipmentForm equipment={Equipment} onClose={handleUnSelect} />
      )}
    </div>
  );
};

export default Equipments;
