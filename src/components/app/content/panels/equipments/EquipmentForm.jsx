import { useState } from "react";
import { toast } from "react-toastify";
import FireStore from "../../../../../firebase/FireStore";
import BrandedButton from "../../../../utils/brandedButton/BrandedButton";
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

  const handleSubmit = () => {
    // Handle form submission
    if (!formData.name || !formData.serial || !formData.uses) {
      toast.warn("Todos los campos son obligatorios");
      return;
    }
    if (formData.id) {
      FireStore.update("equipments", formData);
    } else {
      FireStore.save("equipments", formData);
    }
    onClose();
  };

  return (
    <div className="formContainer">
      <div className="EquipmentForm">
        <form>
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
          <BrandedButton type="save" label={"Guardar"} onClick={handleSubmit}/>
        </form>
        <div className="closeButtonColumn">
          <BrandedButton type="close" onClick={() => onClose()} />
        </div>
      </div>
    </div>
  );
};

export default EquipmentForm;
