import { Timestamp } from "firebase/firestore";
import { CircleCheck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import FirebaseDataBase from "../../../../../firebase/FirebaseDatabase";
import { useUserStore } from "./../../../../../context/userStore";
import {
  addTimeToDate,
  dateToDDMMYYYY,
  formatDateHour,
} from "./../../../../../utils/dates-functions";
import "./ActivationForm.css";

const ActivationForm = ({ inputActivation, onClose }) => {
  const { currentUser } = useUserStore();
  const [activation, setActivation] = useState({
    ...inputActivation,
    active: inputActivation?.active || true,
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const newActivationData = {
      ...activation,
      [name]: value,
      entry: {
        ...(activation.entry || {}),
      },
    };
    if (name === "date") {
      newActivationData.entry.date = Timestamp.fromDate(new Date(value));
      delete newActivationData.date;
    }

    newActivationData.exp = Timestamp.fromDate(
      addTimeToDate(
        newActivationData?.entry?.date?.toDate() || new Date(),
        parseInt(newActivationData?.life || 1),
        "d"
      )
    );
    setActivation(newActivationData);
  };

  const handleSubmit = () => {
    // Handle form submission

    if (
      activation?.entry?.date?.toDate() >= new Date() ||
      !activation?.entry?.date
    ) {
      toast.warn("Selecciona una fecha y hora válida");
      return;
    }

    if (activation?.life < 1 || !activation?.life) {
      toast.warn("La vida útil válida mayor o igual a 1 día");
      return;
    }

    if (!activation?.lot || activation?.lot === "") {
      toast.warn("Ingresa un lote");
      return;
    }

    const newActivation = {
      ...activation,
      entry: {
        date: activation?.entry?.date,
        user: {
          id: currentUser.id,
          username: currentUser.username,
        },
      },
      active: true,
    };
    const toastId = toast.info("Creando Activación...");

    FirebaseDataBase.save("activations", newActivation)
      .then(() => {
        toast.update(toastId, {
          render: "Activación Creada",
          type: "success",
          autoClose: 3000,
          isLoading: false,
        });
      })
      .catch(() => {
        toast.update(toastId, {
          render: "Error al crear la activación",
          type: "error",
          autoClose: 3000,
          isLoading: false,
        });
      });
    onClose();
  };

  return (
    <div className="formContainer">
      <div className="activationForm">
        <div className="formHeader">
          <h3>{activation?.id ? "Ver" : "Crea"} una Activación</h3>
          <div className="buttonIconSection">
            <div className="buttonIcon close" onClick={() => onClose()}>
              <X size={15} color="white" />
            </div>
          </div>
        </div>
        <div className="formRow">
          <div className="formItem">
            <h5>Fecha de la activación</h5>
            <input
              disabled={activation.id}
              name="date"
              type="datetime-local"
              value={formatDateHour(activation?.entry?.date?.toDate())}
              onChange={handleChange}
            />
          </div>
          <div className="formItem">
            <h5>Vida Útil (días)</h5>
            <input
              disabled={activation?.id}
              type="number"
              min="1"
              name="life"
              value={activation?.life || 0}
              onChange={handleChange}
            />
          </div>
          <div className="formItem">
            <h5>Vencimiento</h5>
            <p>{dateToDDMMYYYY(activation?.exp?.toDate() || new Date())}</p>
          </div>
        </div>
        <div className="formRow">
          <div className="formItem">
            <h5>Código del Insumo</h5>
            <input
              disabled={activation?.id}
              type="text"
              name="lot"
              placeholder="Lote del Producto"
              value={activation?.lot}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="formHeader">
          <div className="buttonIconSection">
            {!activation?.exit && activation.id && (
              <div className="buttonIcon unblock" onClick={() => handleSubmit()}>
                <CircleCheck size={20} color="white" />
                <p>Desactivar</p>
              </div>
            )}
            {!activation?.id && (
              <div className="buttonIcon save" onClick={() => handleSubmit()}>
                <CircleCheck size={20} color="white" />
                <p>Confirmar Activación</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationForm;
