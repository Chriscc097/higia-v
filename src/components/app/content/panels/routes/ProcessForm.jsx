import { useState } from "react";
import { toast } from "react-toastify";
import FireStore from "../../../../../firebase/FireStore";
import BrandedButton from "../../../../utils/brandedButton/BrandedButton";
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

    await FireStore.save("process", formData);
    onClose();
  };

  const items = [
    { label: "Temperatura °C", name: "temp" },
    { label: "Presión PSI", name: "psi" },
    { label: "Insumos", name: "supplies" },
    { label: "Tiempo min", name: "min" },
    { label: "Activación", name: "act" },
    { label: "Equipos", name: "equipments" },
    { label: "Adicionales", name: "others" },
  ];

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
          <div className="formGrid">
            {items.map((item, index) => {
              return (
                <ToggleButton
                  key={index}
                  label={item.label}
                  value={formData.requirements[item.name]}
                  onToggle={(value) =>
                    handleRequirements({ name: item.name, value })
                  }
                />
              );
            })}
          </div>
          <button type="submit">{formData?.id ? "Guardar" : "Crear"}</button>
        </form>
        <div className="closeButtonColumn">
          <BrandedButton type="close" onClick={() => onClose()} />
        </div>
      </div>
    </div>
  );
};

export default ProcessForm;
