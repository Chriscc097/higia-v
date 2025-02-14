import './ConfirmPopup.css';

const ConfirmPopup = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="popup-container">
      <div className="popup">
        <p>{message}</p>
        <div className="popup-actions">
          <button onClick={() => onConfirm(true)}>Aceptar</button>
          <button onClick={() => onCancel(true)}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
