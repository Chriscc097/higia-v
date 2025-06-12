import { useState } from "react";
import Select from "react-select";
import "./CancelForm.css";

const CancelForm = ({ onSummit, onClose, load }) => {
  const [cancellation, setCancellation] = useState({});

  const reasons = [
    { name: "Corte de suministro de energía", id: 1 },
    { name: "Proceso Incompleto", id: 2 },
    { name: "Paquetes Húmedos", id: 3 },
    { name: "Paquetes Quemados", id: 4 },
    { name: "Otros", id: 5 },
  ];

  const handleChangeField = (e) => {
    const { name, value } = e.target;
    const newCancellation = {
      ...cancellation,
      [name]: value,
    };
    console.log(newCancellation)
    setCancellation(newCancellation);
  };
  return (
    <div className="formContainer">
      <div className="cancelForm">
        <h3>{"Cancelación Carga #" + load.id}</h3>
        <div className="formRow">
          <div className="formItem">
            <Select
              className="selector"
              isDisabled={load?.cancellation}
              value={reasons.find(
                (reason) => reason.name === cancellation.reason
              )}
              options={reasons?.map((reason) => ({
                value: reason.id,
                label: reason.name,
              }))}
              placeholder="Selecciona"
              name="reason"
              onChange={(e) =>
                handleChangeField({
                  target: { name: "reason", value: e.value },
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelForm;
