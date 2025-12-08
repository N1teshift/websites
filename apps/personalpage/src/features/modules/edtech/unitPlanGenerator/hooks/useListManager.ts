import { useCallback } from "react";
import { UnitPlanData } from "../types/UnitPlanTypes";

type ListField = keyof UnitPlanData;

interface UseListManagerProps {
  unitPlan: UnitPlanData;
  updateUnitPlan: (field: keyof UnitPlanData, value: UnitPlanData[keyof UnitPlanData]) => void;
}

export const useListManager = ({ unitPlan, updateUnitPlan }: UseListManagerProps) => {
  const addItem = useCallback(
    (field: ListField) => {
      const currentList = Array.isArray(unitPlan[field]) ? (unitPlan[field] as string[]) : [];
      updateUnitPlan(field, [...currentList, ""]);
    },
    [unitPlan, updateUnitPlan]
  );

  const updateItem = useCallback(
    (field: ListField, index: number, value: string) => {
      const currentList = Array.isArray(unitPlan[field]) ? (unitPlan[field] as string[]) : [];
      const updatedList = currentList.map((item, i) => (i === index ? value : item));
      updateUnitPlan(field, updatedList);
    },
    [unitPlan, updateUnitPlan]
  );

  const removeItem = useCallback(
    (field: ListField, index: number) => {
      const currentList = Array.isArray(unitPlan[field]) ? (unitPlan[field] as string[]) : [];
      const updatedList = currentList.filter((_, i) => i !== index);
      updateUnitPlan(field, updatedList);
    },
    [unitPlan, updateUnitPlan]
  );

  const getList = useCallback(
    (field: ListField): string[] => {
      return Array.isArray(unitPlan[field]) ? (unitPlan[field] as string[]) : [];
    },
    [unitPlan]
  );

  return {
    addItem,
    updateItem,
    removeItem,
    getList,
  };
};
