import { File } from "lucide-react"; // Usa react-lucide para íconos
import { useState } from "react";
import "./FileSelector.css";

const FileViewer = ({ inputUrls }) => {
  const [urls, setUrls] = useState([...inputUrls]);

  const handleSee = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="fileSelector">
      {urls.length > 0 && (
        <div className="files">
          {urls.map((url, index) => (
            <div
              className="file"
              key={index}
              onClick={() => handleSee(url)}
              title={"Adjunto"} // Show filename on hover
            >
              <File size={15} color="#292F36" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileViewer;
