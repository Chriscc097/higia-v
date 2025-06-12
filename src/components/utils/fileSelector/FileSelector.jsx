import { File } from "lucide-react"; // Usa react-lucide para íconos
import { useRef, useState } from "react";
import BrandedButton from "../brandedButton/BrandedButton";
import "./FileSelector.css";

const FileSelector = ({ onFilesSelected, inputFiles = [] }) => {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([...inputFiles]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setIsLoading(false);
    const newFiles = Array.from(e.target.files);
    const uniqueFiles = newFiles.filter(
      (file) => !files.some((f) => f.name === file.name && f.size === file.size)
    );
    const updatedFiles = [...files, ...uniqueFiles];
    setFiles(updatedFiles);
    onFilesSelected?.(updatedFiles); // Callback opcional
    setIsLoading(false);
  };

  const handleRemoveFile = (index) => {
    setIsLoading(true);
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesSelected?.(updated);
    setIsLoading(false);
  };

  const handleSee = (file) => {
    setIsLoading(true);
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
    setIsLoading(false);
  };

  return (
    <div className="fileSelector">
      <BrandedButton
        type="upload"
        onClick={() => fileInputRef.current.click()}
        isLoading={isLoading}
      />
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
              <BrandedButton
                type="close"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
              />
              <File size={15} color="#292F36" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileSelector;
