import { CircleArrowOutUpRight, CirclePlus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import useClientStore from "../../../../../../context/clientStore";
import { useUserStore } from "../../../../../../context/userStore";
import { CycleManager } from "../../../../../../model/CycleManager";
import { ExitManager } from "../../../../../../model/ExitManager";
import { LoadManager } from "../../../../../../model/LoadManager";
import {
  dateToDDMMYYYY,
  diffDays,
  getExpColor,
} from "../../../../../../utils/dates-functions";
import ConfirmPopUp from "../../../../../utils/ConfirmPopup";
import "./ExitForm.css";
const ExitForm = ({ onClose }) => {
  const [cycles, setCycles] = useState([]);
  const clients = useClientStore((state) => state.clients);
  const [code, setCode] = useState("");
  const { currentUser } = useUserStore();
  const [isConfirmSeen, setConfirmSeen] = useState(false);

  const handleRemoveCycle = (id) => {
    if (id === "" || !id) return;
    setCycles(cycles.filter((obj) => obj.id !== id));
  };

  const handleAddCycle = async () => {
    if (code === "" || !code) return;
    const toastId = toast.loading("Buscando...");

    if (cycles.some((obj) => obj.id === code)) {
      toast.update(toastId, {
        render: "El ciclo ya está en la lista de salida",
        type: "info",
        autoClose: 2000,
        isLoading: false,
      });
      setCode("");
      return;
    }

    let cycle;
    try {
      cycle = await CycleManager.get(
        code
          .toUpperCase()
          .replace(/[^a-zA-Z0-9]/g, "")
          .trim()
      );
      if (cycle.exitId) {
        toast.update(toastId, {
          render: "El ciclo con el código: " + code + " no está en el almacén",
          type: "warn",
          autoClose: 3000,
          isLoading: false,
        });
        cycle = null;
      }
    } catch (e) {
      toast.update(toastId, {
        render: "El ciclo con el código: " + code + " no existe",
        type: "warn",
        autoClose: 3000,
        isLoading: false,
      });
    }

    if (!cycle) {
      setCode("");
      return;
    }

    let load;
    try {
      load = await LoadManager.get(cycle.loadId);
      if (!load.cycles.remaining <= 0) {
        toast.update(toastId, {
          render: "La carga del ciclo no tiene existencias",
          type: "error",
          autoClose: 3000,
          isLoading: false,
        });
        load = null;
      }
    } catch (e) {
      toast.update(toastId, {
        render: "No hay una carga relacionada al ciclo",
        type: "warn",
        autoClose: 3000,
        isLoading: false,
      });
    }

    if (!load) {
      setCode("");
      return;
    }
    cycle.exp = load.exp;
    toast.update(toastId, {
      render: "Ciclo agregado",
      type: "success",
      autoClose: 1000,
      isLoading: false,
    });
    setCycles((prevCycles) => [...prevCycles, cycle]);
    setCode("");
  };
  const handleExit = () => {
    const toastId = toast.loading("Creando Salida...");
    if (!cycles || cycles?.length === 0) {
      toast.update(toastId, {
        render: "No hay ciclos por procesar",
        type: "warn",
        autoClose: 3000,
        isLoading: false,
      });
    }
    setCode("");
    ExitManager.create(new Date(), cycles, currentUser, false)
      .then(() => {
        toast.update(toastId, {
          render: "Salida creada",
          type: "success",
          autoClose: 3000,
          isLoading: false,
        });
        setCycles([]);
      })
      .catch((e) => {
        toast.update(toastId, {
          render: "No se pudo crear la salida",
          type: "error",
          autoClose: 3000,
          isLoading: false,
        });
        console.error(e);
      });
  };
  const handleClose = () => {
    if (cycles.length > 0) {
      setConfirmSeen(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="formContainer">
      <div className="exitForm">
        <div className="formHeader">
          <h3>Salidas del Almacén</h3>
          <div className="buttonIconSection">
            <div className="buttonIcon save" onClick={() => handleExit()}>
              <CircleArrowOutUpRight color="white" size={20} />
              <p>Generar Salida</p>
            </div>
            <div className="buttonIcon close" onClick={() => handleClose()}>
              <X color="white" size={15} />
            </div>
          </div>
        </div>
        <div className="formRow">
          <h5>Código del Ciclo</h5>
        </div>
        <div className="formRow long">
          <div className="formItem long">
            <input
              type="text"
              value={code}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddCycle();
                }
              }}
              onChange={(e) => {
                setCode(e.target.value);
              }}
            />
          </div>
          <div className="formItem">
            <div className="buttonIcon save" onClick={() => handleAddCycle()}>
              <CirclePlus color="white" size={20} />
            </div>
          </div>
        </div>
        <div className="formContent">
          <div className="formTable">
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Ciclo</th>
                    <th>Profesional</th>
                    <th>Paquete</th>
                    <th>Vencimiento</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cycles?.map((cycle, index) => {
                    const clientItem = clients.find(
                      (client) => client.id === cycle?.clientId
                    );
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{cycle.id}</td>
                        <td>{clientItem?.businessName}</td>
                        <td>{cycle.stockId + ": " + cycle?.name}</td>
                        <td>
                          <div className="expLabel">
                            {dateToDDMMYYYY(cycle.exp.toDate())}
                            <span
                              className={
                                "expColor " +
                                getExpColor(diffDays(cycle.exp.toDate()))
                              }
                            >
                              {diffDays(cycle.exp.toDate())}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span>
                            <div
                              className="buttonIcon delete"
                              onClick={() => handleRemoveCycle(cycle.id)}
                            >
                              <Trash2 color="white" size={20} />
                            </div>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {isConfirmSeen && (
          <ConfirmPopUp
            message={"Hay ciclos en la lista, ¿Deseas salir sin procesarlos?"}
            onClose={() => setConfirmSeen(false)}
            onConfirm={() => onClose()}
          />
        )}
      </div>
    </div>
  );
};

export default ExitForm;
