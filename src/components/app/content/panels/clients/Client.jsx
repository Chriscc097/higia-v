import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../../../../../controllers/Firebase/Firestore";
import "./Client.css";
import ClientForm from "./ClientForm";

const Client = () => {
  const [clients, setClients] = useState([]); // Estado para los datos cargados
  const [lastDoc, setLastDoc] = useState(null); // Estado para el último documento cargado
  const [client, setClient] = useState(null); // Estado para el cliente seleccionado
  const [loading, setLoading] = useState(false); // Estado de carga
  const [hasMore, setHasMore] = useState(true); // Para evitar más cargas si ya no hay datos
  const [isClientFormSeen, setClientFormSeen] = useState(false); // Para evitar más cargas si ya no hay datos
  const [lastVisible, setLastVisible] = useState(null);
  const centerRef = useRef(null);

  // Function to load initial data
  const loadClients = async (initial = false) => {
    if (loading) return;

    setLoading(true);
    const clientsCollection = collection(db, "clients");
    let q;

    if (initial) {
      q = query(clientsCollection, orderBy("businessName", "asc"), limit(20));
    } else {
      q = query(
        clientsCollection,
        orderBy("businessName", "asc"),
        startAfter(lastVisible),
        limit(32)
      );
    }
    onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const newClients = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Incluye el ID del documento para evitar duplicados
          ...doc.data(),
        }));

        setClients((prev) => {
          const mergedClients = [...prev, ...newClients];
          // Eliminar duplicados basados en el ID
          const uniqueClients = mergedClients.filter(
            (client, index, self) =>
              index === self.findIndex((c) => c.id === client.id)
          );
          return initial ? newClients : uniqueClients;
        });

        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
      setLoading(false);
    });
  };

  // Hook para cargar los datos iniciales
  useEffect(() => {
    loadClients(true);
  }, []);

  useEffect(() => {
    centerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [clients]);

  // Manejo del scroll
  const handleScroll = () => {
    const container = centerRef.current;

    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 10
    ) {
      loadClients(); // Cargar más contactos al llegar al final
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

  const handleSelect = async (client) => {
    setClient(client);
    setClientFormSeen(true);
  };

  const handleUnSelect = async () => {
    setClient(null);
    setClientFormSeen(false);
  };

  const handleNew = async () => {
    setClient(null);
    setClientFormSeen(true);
  };

  return (
    <div className="clients">
      <div className="header">
        <h2 className="title">Lonchera</h2>
        <div className="leftHeader">
          <div className="buttons">
            <div className="imgbutton" onClick={handleNew}>
              <img src="/add_white.png" alt="Nueva Carga" />
              <p>Nueva Lonchera</p>
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
                <th>RUT</th>
                <th>Razón Social</th>
                <th>Paquetes</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => {
                const clientName = client?.businessName || "N/A";
                const clientRut = client?.nit || "N/A";
                const totalPackages = client?.packages || 0;
                return (
                  <tr
                    key={client.id || index}
                    onClick={() => handleSelect(client)}
                  >
                    <td>
                      <span
                        className={
                          client.status
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                      >
                        {client.status ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>{clientRut}</td>
                    <td>{clientName}</td>
                    <td>{totalPackages}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && <div className="loading">Cargando...</div>}
        </div>
      </div>
      {isClientFormSeen && (
        <ClientForm client={client} onClose={handleUnSelect} />
      )}
    </div>
  );
};

export default Client;
