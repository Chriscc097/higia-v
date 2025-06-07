import { X } from "lucide-react";
import "./ExitForm.css";
const ExitForm = ({onClose}) => {
  return (
    <div className="formContainer">
      <div className="exitForm">
        <div className="formHeader">
          <h3>Salidas del Almacén</h3>
          <div className="buttonIconSection">
            <div className="buttonIcon close">
                <X color="white" size={15}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitForm;
