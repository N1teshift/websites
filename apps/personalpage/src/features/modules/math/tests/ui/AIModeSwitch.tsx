import React from "react";
import { Button } from "@websites/ui";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

export type AISystem = "legacy" | "langgraph";

export interface AIModeSwitchProps {
  /** The currently selected AI system. */
  selectedSystem: AISystem;
  /** Callback function invoked when the user selects a different AI system. */
  onSystemChange: (system: AISystem) => void;
  /** Boolean indicating if the switch should be disabled (e.g., during test execution). */
  disabled?: boolean;
}

/**
 * Renders a toggle switch for selecting between different AI generation systems.
 * Currently supports 'legacy' (System 1) and 'langgraph' (System 2).
 *
 * @param {AIModeSwitchProps} props - The component props.
 */
const AIModeSwitch: React.FC<AIModeSwitchProps> = ({
  selectedSystem,
  onSystemChange,
  disabled = false,
}) => {
  const { t } = useFallbackTranslation();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-secondary mr-2">{t("ai_system") || "AI System"}:</span>
      <div className="flex gap-2">
        <Button
          onClick={() => onSystemChange("legacy")}
          variant={selectedSystem === "legacy" ? "primary" : "secondary"}
          disabled={disabled}
          size="sm"
        >
          {t("system_1") || "System 1"}
        </Button>
        <Button
          onClick={() => onSystemChange("langgraph")}
          variant={selectedSystem === "langgraph" ? "primary" : "secondary"}
          disabled={disabled}
          size="sm"
        >
          {t("system_2") || "System 2"}
        </Button>
      </div>
    </div>
  );
};

export default AIModeSwitch;
