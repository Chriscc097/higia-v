import React, { useState } from "react";
import "./ToggleButton.css"; // Importa el CSS

const ToggleButton = ({ label = "Sin label", onToggle, value = false }) => {
  const [isOn, setIsOn] = useState(value);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) onToggle(newState); // Llama a la función si se proporciona
  };

  return (
    <div className="toggle-container" onClick={handleToggle}>
      <div className={`toggle-button ${isOn ? "on" : ""}`}>
        <div className="toggle-thumb"></div>
      </div>
      <p className="toggle-label">{label}</p>
    </div>
  );
};

export default ToggleButton;
