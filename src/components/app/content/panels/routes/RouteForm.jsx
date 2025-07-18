import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import FireStore, { db } from "../../../../../firebase/FireStore";
import BrandedButton from "../../../../utils/brandedButton/BrandedButton";
import LoadingPanel from "../../../../utils/loadingPanel/LoadingPanel";
import { useUserStore } from "./../../../../../context/userStore";
import ProcessForm from "./ProcessForm";
import "./RouteForm.css";

const RouteForm = ({ route, onClose }) => {
  const [routeData, setRouteData] = useState({ ...route });
  const { currentUser } = useUserStore();
  const [process, setProcess] = useState([]);
  const [processFormVisible, setProcessFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "process"), orderBy("name", "asc")),
      (snapshot) => {
        const processData = snapshot.docs.map((doc) => doc.data());
        setProcess(processData);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleAddProcess = (e) => {
    const processId = e.value;
    const routeProcess = routeData.process || [];
    if (routeProcess.some((processItem) => processItem.id === processId)) {
      toast.warn("El proceso ya ha sido agregado");
      return;
    }
    routeProcess.push(processId);

    setRouteData((prevRouteData) => ({
      ...prevRouteData,
      process: routeProcess,
    }));
  };

  const saveRoute = () => {
    if (
      !routeData.name ||
      !routeData.content ||
      !routeData.process ||
      routeData?.process?.length === 0
    ) {
      toast.warn("Todos los campos son obligatorios");
      return;
    }
    const idtoast = toast.loading("Guardando ruta...");

    setLoading(true);
    if (route?.id) {
      FireStore.update("routes", routeData)
        .then(() => {
          toast.update(idtoast, {
            render: "Ruta actualizada",
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });
          onClose();
        })
        .catch((error) => {
          toast.update(idtoast, {
            render: "Error al actualizar la ruta",
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
          console.error(error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      FireStore.save("routes", routeData)
        .then(() => {
          toast.update(idtoast, {
            render: "Ruta creada correctamente",
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });
          onClose();
        })
        .catch((error) => {
          toast.update(idtoast, {
            render: "Error al crear la ruta",
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  };

  const handleremoveProcess = (processItem) => {
    const routeProcess = routeData.process;
    const index = routeProcess.findIndex((pr) => pr.id === processItem);
    routeProcess.splice(index, 1);
    setRouteData((prevRouteData) => ({
      ...prevRouteData,
      process: routeProcess,
    }));
  };

  return (
    <div className="formContainer">
      <div className="routeForm">
        <div className="formHeader">
          <h3>{route?.id ? "Editar Ruta" : "Crea una Ruta"}</h3>
          <div className="buttonIconSection">
            <BrandedButton
              type="save"
              onClick={() => saveRoute()}
              isLoading={loading}
              label={"Guardar"}
            />
            <BrandedButton type="close" onClick={() => onClose()} />
          </div>
        </div>
        <div className="formContent">
          <div className="formRow">
            <div className="formItem">
              <input
                type="text"
                placeholder="Nombre"
                value={routeData.name}
                onChange={(e) =>
                  setRouteData({ ...routeData, name: e.target.value })
                }
              />
            </div>
            <div className="formItem">
              <input
                type="text"
                placeholder="Descripción"
                value={routeData.content}
                onChange={(e) =>
                  setRouteData({ ...routeData, content: e.target.value })
                }
              />
            </div>
          </div>
          <div className="formRow">
            <div className="formItem">
              <Select
                className="selector"
                onChange={handleAddProcess}
                options={process.map((processItem) => ({
                  value: processItem.id,
                  label: processItem.name,
                }))}
                placeholder="Proceso"
              />
            </div>
            <BrandedButton
              type="add"
              isLoading={loading}
              onClick={() => setProcessFormVisible(true)}
              label="Agregar Proceso"
            />
            <div className="formItem long">
              <h4>Usuario</h4>
              <p>{currentUser.username}</p>
            </div>
          </div>
          <div className="formRow">
            <div className="formItem">
              <h4>Procesos</h4>
            </div>
          </div>
          <div className="formTable">
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {routeData.process
                    ?.sort((a, b) => a.index - b.index)
                    .map((processItem, index) => {
                      const pr = process.find((pr) => pr.id === processItem);
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{pr?.name}</td>
                          <td>
                            {pr?.content.length > 60
                              ? pr?.content.slice(0, 60) + "..."
                              : pr?.content}
                          </td>
                          <td>
                            <span>
                              <BrandedButton
                                type="delete"
                                isLoading={loading}
                                onClick={() => handleremoveProcess(processItem)}
                              />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {loading && <LoadingPanel />}
            </div>
          </div>
        </div>
      </div>
      {processFormVisible && (
        <ProcessForm onClose={() => setProcessFormVisible(false)} />
      )}
    </div>
  );
};

export default RouteForm;
