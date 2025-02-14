import React, { useState } from "react";
import { toast } from "react-toastify";
import Firestore from "../../../../../controllers/Firebase/Firestore";
import "./PackageForm.css";

const PackageForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    content: "",
    count: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    if (!formData.name || !formData.content || !formData.id) {
      toast.warn("Todos los campos son obligatorios");
      return;
    }
    Firestore.create("packages", formData);
    onClose();
  };

  return (
    <div className="formContainer">
      <div className="packageForm">
        <form onSubmit={handleSubmit}>
          <h3>Crea un Material</h3>
          <div>
            <input
              placeholder="Nombre"
              type="text"
              name="name"
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              type="text"
              name="content"
              placeholder="Contenido"
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              type="text"
              name="id"
              placeholder="Código"
              onChange={handleChange}
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

export default PackageForm;
