import React from "react";
import BaseMathObjectSettingsContainer from "./BaseMathObjectSettingsContainer";
import { EquationSettings, MathObjectContainerProps } from "@math/types/index";

const EquationSettingsContainer: React.FC<MathObjectContainerProps<EquationSettings>> = ({
  containerId,
  settings,
  updateSettings,
  startIndex = 1,
  showDescription = false,
  //objectType = null
}) => {
  return (
    <BaseMathObjectSettingsContainer
      containerId={containerId}
      settings={settings}
      updateSettings={updateSettings}
      startIndex={startIndex}
      showDescription={showDescription}
      objectType="equation"
    >
      {() => <></>}
    </BaseMathObjectSettingsContainer>
  );
};

export default EquationSettingsContainer;
