import React, { useState } from "react";
import { toast } from "react-toastify";
import Firestore from "../../../../../controllers/Firebase/Firestore";
import "./EquipmentForm.css";

const EquipmentForm = ({ equipment, onClose }) => {
  const [formData, setFormData] = useState({
    name: equipment?.name || "",
    serial: equipment?.serial || "",
    uses: equipment?.uses || 0,
    status: equipment?.status || true,
    id: equipment?.id,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStatus = () => {
    setFormData({
      ...formData,
      status: !formData.status,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    if (!formData.name || !formData.serial || !formData.uses) {
      toast.warn("Todos los campos son obligatorios");
      return;
    }
    if (formData.id) {
      Firestore.update("equipments", formData);
    } else {
      Firestore.create("equipments", formData);
    }
    onClose();
  };

  return (
    <div className="formContainer">
      <div className="EquipmentForm">
        <form onSubmit={handleSubmit}>
          <h3>{formData?.id ? "Edita " : "Crea"} un Equipo</h3>
          <div>
            <input
              placeholder="Equipo"
              type="text"
              name="name"
              value={formData?.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              type="text"
              name="serial"
              placeholder="Serie"
              value={formData?.serial}
              onChange={handleChange}
            />
          </div>
          <div className="formRow">
            <h4>Usos</h4>
            <input
              className="smallInput"
              type="number"
              name="uses"
              min="0"
              value={formData.uses}
              onChange={handleChange}
            ></input>
             <label>Estado:</label>
            <input
              type="checkbox"
              checked={formData.status}
              onChange={handleStatus}
            />
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

export default EquipmentForm;
