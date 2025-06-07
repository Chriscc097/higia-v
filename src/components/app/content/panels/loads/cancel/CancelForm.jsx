import { Timestamp } from "firebase/firestore";
import { Trash2, X } from "lucide-react";
import { useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { useUserStore } from "../../../../../../context/userStore";
import { CycleManager } from "../../../../../../model/CycleManager";
import { ExitManager } from "../../../../../../model/ExitManager";
import { LoadManager } from "../../../../../../model/LoadManager";
import "./CancelForm.css";

const CancelForm = ({ onSummit, onClose, load }) => {
  const [cancellation, setCancellation] = useState({});
  const { currentUser } = useUserStore();

  const types = [
    { name: "Corte de suministro de energía", id: 1 },
    { name: "Proceso Incompleto", id: 2 },
    { name: "Paquetes Húmedos", id: 3 },
    { name: "Paquetes Quemados", id: 4 },
    { name: "Control no Conforme", id: 5 },
    { name: "Otros", id: 6 },
  ];

  const handleChangeField = (e) => {
    const { name, value } = e.target;
    const newCancellation = {
      ...cancellation,
      [name]: value,
    };
    setCancellation(newCancellation);
  };

  const createCancellation = async () => {
    if (!cancellation.type) {
      toast.warn("Selecciona primero una razón");
      return;
    }

    if (!cancellation.comments || cancellation.comments === "") {
      toast.warn("Selecciona debes escribir un comentario u observación");
      return;
    }

    const cycles = await CycleManager.getByLoad(load.id);

    const newCancellation = {
      ...cancellation,
      timestamp: Timestamp.fromDate(new Date()),
      user: {
        id: currentUser.id,
        username: currentUser.username,
      },
    };

    const newLoad = {
      id: load.id,
      status: "Cancelada",
      cancellation: newCancellation,
    };

    const toastId = toast.loading("Cancelando carga...");

    try {
      const savedLoad = await LoadManager.update(newLoad);
      const exit = await ExitManager.create(
        new Date(),
        cycles,
        currentUser,
        true
      );

      if (!exit || !savedLoad) {
        toast.update(toastId, {
          render: "No se pudo crear la cancelación",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        return;
      }

      toast.update(toastId, {
        render: "Carga Cancelada",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
      onSummit(load);
      onClose();
    } catch (error) {
      toast.update(toastId, {
        render: "No se pudo crear la cancelación",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      console.log(error);
    }
  };
  return (
    <div className="formContainer">
      <div className="cancelForm">
        <div className="formHeader">
          <h3>{"Cancelación Carga #" + load.id}</h3>
          <div className="buttonIconSection">
            <div className="buttonIcon close" onClick={() => onClose()}>
              <X size={15} color="white" />
            </div>
          </div>
        </div>
        <div className="formRow">
          <div className="formItem">
            <h5>Motivo de la Cancelación</h5>
            <Select
              className="selector"
              isDisabled={load?.cancellation}
              value={types.find((type) => type.name === cancellation.type)}
              options={types?.map((type) => ({
                value: type.id,
                label: type.name,
              }))}
              placeholder="Selecciona"
              name="type"
              onChange={(e) =>
                handleChangeField({
                  target: { name: "type", value: e.label },
                })
              }
            />
          </div>
        </div>
        <div className="formRow">
          <div className="formItem">
            <h5>Observaciones</h5>
            <input
              type="text"
              onChange={handleChangeField}
              multiple
              name="comments"
            />
          </div>
        </div>
        <div className="formHeader">
          <div className="buttonIconSection">
            <div
              className="buttonIcon unblock"
              onClick={() => createCancellation()}
            >
              <Trash2 size={20} color="white" />
              <p>Confirmar cancelación</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelForm;
