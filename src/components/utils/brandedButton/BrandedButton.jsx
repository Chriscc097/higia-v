import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleOff,
  CirclePlus,
  ListFilter,
  RotateCcw,
  ScanBarcode,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import LoadingPanel from "./../loadingPanel/LoadingPanel";
import "./BrandedButton.css";

const icons = {
  save: <CircleCheck size={20} color="white" />,
  add: <CirclePlus size={20} color="white" />,
  cancel: <CircleOff size={20} color="white" />,
  delete: <Trash2 size={20} color="white" />,
  close: <X size={15} color="white" />,
  print: <ScanBarcode size={20} color="white" />,
  upload: <Upload size={20} color="white" />,
  left: <ChevronLeft size={20} color="white" />,
  right: <ChevronRight size={20} color="white" />,
  filter: <ListFilter  size={20} color="white" />,
  update: <RotateCcw  size={20} color="white" />,
};

const BrandedButton = ({
  type = "none",
  label,
  isLoading = false,
  onClick,
}) => {
  return (
    <div className={"brandedButtonContainer " + type}>
      {isLoading ? (
        <LoadingPanel positive={false} label={null} />
      ) : (
        <div className="brandedContent" onClick={() => onClick()}>
          {icons[type]}
          {label && <span>{label}</span>}
        </div>
      )}
    </div>
  );
};

export default BrandedButton;
