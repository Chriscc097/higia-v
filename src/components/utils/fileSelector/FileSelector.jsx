import { File, Upload, X } from "lucide-react"; // Usa react-lucide para íconos
import { useRef, useState } from "react";
import "./FileSelector.css";

const FileSelector = ({ onFilesSelected, inputFiles = [] }) => {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([...inputFiles]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const uniqueFiles = newFiles.filter(
      (file) => !files.some((f) => f.name === file.name && f.size === file.size)
    );
    const updatedFiles = [...files, ...uniqueFiles];
    setFiles(updatedFiles);
    onFilesSelected?.(updatedFiles); // Callback opcional
  };

  const handleRemoveFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesSelected?.(updated);
  };

  const handleSee = (file) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
  };

  return (
    <div className="fileSelector">
      <div
        className="buttonIcon sync"
        onClick={() => fileInputRef.current.click()}
      >
        <Upload size={20} color="white" />
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        hidden
      />
      {files.length > 0 && (
        <div className="files">
          {files.map((file, index) => (
            <div
              className="file"
              key={index}
              onClick={() => handleSee(file)}
              title={file.name} // Show filename on hover
            >
              <div
                className="buttonIcon close"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
              >
                <X size={15} color="white" />
              </div>
              <File size={15} color="#292F36" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileSelector;
