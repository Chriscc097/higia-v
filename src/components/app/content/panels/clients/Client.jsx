import { CirclePlus, Loader } from "lucide-react";
import { useRef, useState } from "react";
import useClientStore from "../../../../../context/clientStore";
import "./Client.css";
import ClientForm from "./ClientForm";

const Client = () => {
  const [client, setClient] = useState(null); // Estado para el cliente seleccionado
  const [loading, setLoading] = useState(false);
  const [isClientFormSeen, setClientFormSeen] = useState(false); 
  const centerRef = useRef(null);
  const clients = useClientStore((state) => state.clients);

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
        <h2 className="title">Cliente</h2>
        <div className="leftHeader">
          <div className="buttons">
            <div className="imgbutton" onClick={handleNew}>
              <CirclePlus size={20} color="white"/>
              <p>Nuevo Cliente</p>
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
          {loading && <div className="loading"><Loader size={20} color="#292F36" /><p>Cargando</p></div>}
        </div>
      </div>
      {isClientFormSeen && (
        <ClientForm client={client} onClose={handleUnSelect} />
      )}
    </div>
  );
};

export default Client;
