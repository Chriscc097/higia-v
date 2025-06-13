import { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { toast } from "react-toastify";
import FireStore from "../../../../../firebase/FireStore";
import BrandedButton from "../../../../utils/brandedButton/BrandedButton";
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

  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
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

    FireStore.save("activations", newActivation)
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
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="formContainer">
      <div className="activationForm">
        <div className="formHeader">
          <h3>{activation?.id ? "Ver" : "Crea"} una Activación</h3>
          <div className="buttonIconSection">
            <BrandedButton type="close" onClick={() => onClose()} />
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
              <BrandedButton
                type="save"
                label="Desactivar"
                onClick={() => handleSubmit()}
                isLoading={isLoading}
              />
            )}
            {!activation?.id && (
              <BrandedButton
                isLoading={isLoading}
                type="save"
                label="Confirmar Activación"
                onClick={() => handleSubmit()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationForm;
