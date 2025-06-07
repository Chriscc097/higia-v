import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import FirebaseDataBase from "../../../../../firebase/FirebaseDatabase";
import "./ClientForm.css";

const ClientForm = ({ client, onClose }) => {
  const [formData, setFormData] = useState({
    businessName: client?.businessName || "",
    nit: client?.nit || "",
    phone: client?.phone || "",
    email: client?.email || "",
    address: client?.address || "",
    status: client?.status || false,
    id: client?.id,
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
    if (
      !formData.businessName ||
      !formData.nit ||
      !formData.phone ||
      !formData.email ||
      !formData.address
    ) {
      toast.warn("Todos los campos son obligatorios");
      return;
    }
    if (formData.id) {
      FirebaseDataBase.update("clients", formData);
    } else {
      FirebaseDataBase.save("clients", formData);
    }
    onClose();
  };

  return (
    <div className="formContainer">
      <div className="clientForm">
        <form onSubmit={handleSubmit}>
          <h3>{formData.id ? "Edita " : "Crea"} un Cliente</h3>
          <div>
            <input
              placeholder="Razón Social"
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              type="text"
              name="nit"
              placeholder="Rut"
              value={formData.nit}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              type="text"
              name="phone"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Correo Electrónico"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              type="text"
              name="address"
              placeholder="Dirección"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div>
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
            <X size={15} color="white"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;
