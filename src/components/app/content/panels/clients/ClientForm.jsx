import { useState } from "react";
import { toast } from "react-toastify";
import FirebaseDataBase from "../../../../../firebase/FirebaseDatabase";
import BrandedButton from "../../../../utils/brandedButton/BrandedButton";
import ToggleButton from "../../../../utils/ToggleButton";
import Stock from "../stock/Stock";
import "./ClientForm.css";

const ClientForm = ({ client, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: client?.businessName || "",
    nit: client?.nit || "",
    phone: client?.phone || "",
    email: client?.email || "",
    address: client?.address || "",
    status: client?.status || false,
    id: client?.id,
    prefix: client?.prefix,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    setIsLoading(true);
    // Handle form submission
    if (
      !formData.businessName ||
      !formData.nit ||
      !formData.phone ||
      !formData.email ||
      !formData.prefix ||
      !formData.address
    ) {
      toast.warn("Todos los campos son obligatorios");
      return;
    }
    if (formData?.id) {
      FirebaseDataBase.update("clients", formData);
    } else {
      FirebaseDataBase.save("clients", formData);
    }
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="formContainer">
      <div className="clientForm">
        <div className="formHeader">
          <h3>Datos del Odontólogo</h3>
          <div className="buttonIconSection">
            <BrandedButton
              type="save"
              label="Guardar"
              isLoading={isLoading}
              onClick={() => handleSubmit()}
            />
            <BrandedButton type="close" onClick={() => onClose()} />
          </div>
        </div>

        <div className="formRow">
          <div className="formItem">
            <h5>Prefijo</h5>
            <input
              placeholder="Prefijo (Dr./Dra.)"
              type="text"
              name="prefix"
              value={formData.prefix}
              onChange={handleChange}
            />
          </div>
          <div className="formItem">
            <h5>Razón Social</h5>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
            />
          </div>
          <div className="formItem">
            <h5>NIT</h5>
            <input
              type="text"
              name="nit"
              placeholder="Rut"
              value={formData.nit}
              onChange={handleChange}
            />
          </div>
          <div className="formItem">
            <h5>Celular</h5>
            <input
              type="text"
              name="phone"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="formItem">
            <h5>Activo</h5>
            <ToggleButton
              value={formData.status}
              label={""}
              onToggle={(value) =>
                handleChange({ target: { name: "status", value } })
              }
            />
          </div>
        </div>

        <div className="formRow">
          <div className="formItem">
            <h5>Dirección</h5>
            <input
              type="text"
              name="address"
              placeholder="Dirección"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="formItem">
            <h5>Correo</h5>
            <input
              type="email"
              name="email"
              placeholder="Correo Electrónico"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="content">{client?.id && <Stock client={client} />}</div>
      </div>
    </div>
  );
};

export default ClientForm;
