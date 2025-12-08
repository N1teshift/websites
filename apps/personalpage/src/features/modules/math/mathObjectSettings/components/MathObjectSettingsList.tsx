import React from "react";
import { MathObjectSettings } from "../../types/mathObjectSettingsInterfaces";
import MathObjectSettingsContainer from "./MathObjectSettingsContainer";

export interface MathObjectSettingsListProps {
  /** An array of math object settings objects to display. */
  settingsList: MathObjectSettings[];
  /** Callback function triggered when a setting object is updated. Passes the index and the new settings. */
  onUpdate: (index: number, newSettings: MathObjectSettings) => void;
  /** Callback function triggered when a setting object is deleted. Passes the index. */
  onDelete: (index: number) => void;
  /** Optional flag passed down to `MathObjectSettingsContainer` to show additional properties. */
  showProps?: boolean;
}

const MathObjectSettingsList: React.FC<MathObjectSettingsListProps> = ({
  settingsList,
  onUpdate,
  onDelete,
  showProps,
}) => {
  return (
    <>
      {settingsList.map((settings, index) => (
        <MathObjectSettingsContainer
          key={index}
          index={index}
          mathObjectSettings={settings}
          setMathObjectSettings={(newSettings) => onUpdate(index, newSettings)}
          onDelete={() => onDelete(index)}
          showProps={showProps}
        />
      ))}
    </>
  );
};

export default MathObjectSettingsList;
