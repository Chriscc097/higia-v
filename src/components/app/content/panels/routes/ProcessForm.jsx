import React, { useState } from "react";
import { toast } from "react-toastify";
import Firestore from "../../../../../controllers/Firebase/Firestore";
import ToggleButton from "../../../../utils/ToggleButton";
import "./ProcessForm.css";

const ProcessForm = ({ process, onClose }) => {
  const [formData, setFormData] = useState({
    id: process?.id || null,
    name: process?.name || "",
    content: process?.content || "",
    requirements: {
      act: process?.requirements?.act || false,
      temp: process?.requirements?.temp || false,
      psi: process?.requirements?.psi || false,
      min: process?.requirements?.min || false,
      supplies: process?.requirements?.supplies || false,
      equipments: process?.requirements?.equipments || false,
      equipmentsIds: process?.requirements?.equipmentsIds || [],
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRequirements = (e) => {
    const { name, value } = e;
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        [name]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission
    if (!formData.name || !formData.content || !formData.requirements) {
      toast.warn("Todos los campos son obligatorios");
      return;
    }
    const requirementsValues = Object.values(formData.requirements).filter(
      (value) => typeof value === "boolean"
    );
    if (!requirementsValues.includes(true)) {
      toast.warn("Al menos un requisito debe ser verdadero");
      return;
    }
    
    await Firestore.create("process", formData);
    onClose();
  };

  return (
    <div className="formContainer">
      <div className="processForm">
        <form onSubmit={handleSubmit}>
          <h3>{process?.id ? "Edita" : "Crea"} un proceso</h3>
          <div className="formColumn">
            <input
              placeholder="Nombre"
              type="text"
              name="name"
              onChange={handleChange}
              value={formData.name}
            />
            <input
              type="text"
              name="content"
              placeholder="Descripción"
              onChange={handleChange}
              value={formData.content}
            />
          </div>
          <h5>Requerimientos</h5>
          <div className="formRow">
            <div className="formColumn">
              <ToggleButton
                label="Temperatura °C"
                value={formData.requirements.temp}
                onToggle={(value) =>
                  handleRequirements({ name: "temp", value })
                }
              />
              <ToggleButton
                label="Presión PSI"
                value={formData.requirements.psi}
                onToggle={(value) => handleRequirements({ name: "psi", value })}
              />
              <ToggleButton
                label="Insumos"
                value={formData.requirements.supplies}
                onToggle={(value) =>
                  handleRequirements({ name: "supplies", value })
                }
              />
            </div>
            <div className="formColumn">
              <ToggleButton
                label="Tiempo min"
                value={formData.requirements.min}
                onToggle={(value) => handleRequirements({ name: "min", value })}
              />
              <ToggleButton
                label="Activación"
                value={formData.requirements.act}
                onToggle={(value) => handleRequirements({ name: "act", value })}
              />
              <ToggleButton
                label="Equipos"
                value={formData.requirements.equipments}
                onToggle={(value) =>
                  handleRequirements({ name: "equipments", value })
                }
              />
            </div>
          </div>
          <button type="submit">{formData?.id ? "Guardar" : "Crear"}</button>
        </form>
        <div className="closeButtonColumn">
          <div className="buttonIcon close" onClick={() => onClose()}>
            <img src="./cross_white.png" alt="close" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessForm;
