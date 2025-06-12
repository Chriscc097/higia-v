import { LoaderCircle } from "lucide-react";
import "./LoadingPanel.css";

const LoadingPanel = ({ positive = true, label="Cargando" }) => {
  return (
    <div className={"loaderContanier " + !positive}>
      <div className="loaderContent">
        <LoaderCircle
          size={20}
          color={positive ? "#292F36" : "white"}
          className="animatedIcon"
        />
        {label && <p>{label}</p>}
      </div>
    </div>
  );
};

export default LoadingPanel;
