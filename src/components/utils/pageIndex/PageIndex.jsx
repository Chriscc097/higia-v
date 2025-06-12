import { useState } from "react";
import BrandedButton from "../brandedButton/BrandedButton";
import "./PageIndex.css";

const PageIndex = ({ currentIndex, onChange, hasMore, isLoading }) => {
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
          <BrandedButton
            type="left"
            onClick={substractIndex}
            isLoading={isLoading}
          />
        )}
        <input
          type="number"
          onChange={(e) => handleChangeIndex(e.target.value)}
          min={1}
          value={index}
        />
        {!hasMore && (
          <BrandedButton
            type="right"
            onClick={addIndex}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default PageIndex;
