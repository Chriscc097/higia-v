import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import "./PageIndex.css";

const PageIndex = ({ currentIndex, onChange, hasMore }) => {
  const [index, setIndex] = useState(currentIndex);

  const handleChangeIndex = (newIndex) => {
    if (hasMore && newIndex > index) {
      return;
    }
    if (newIndex < 1) {
      return;
    }
    setIndex(newIndex);
    onChange(newIndex);
  };

  const addIndex = () => {
    let newIndex = index;
    if (hasMore) {
      newIndex = index + 1;
    }
    handleChangeIndex(newIndex);
  };

  const substractIndex = () => {
    let newIndex = index;
    if (newIndex > 1) {
      newIndex = index - 1;
    }
    handleChangeIndex(newIndex);
  };

  return (
    <div className="pageIndexContainer">
      <div className="pageIndex">
        {index > 1 && (
          <div className="buttonIcon close" onClick={substractIndex}>
            <ChevronLeft size={20} color="white" />
          </div>
        )}
        <input
          type="number"
          onChange={(e) => handleChangeIndex(e.target.value)}
          min={1}
          value={index}
        />
        {!hasMore && (
          <div className="buttonIcon close" onClick={addIndex}>
            <ChevronRight size={20} color="white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageIndex;
