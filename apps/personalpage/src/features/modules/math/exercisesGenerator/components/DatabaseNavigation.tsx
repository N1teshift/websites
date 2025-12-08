import React from "react";
import { Dropdown } from "@websites/ui";
import ExerciseNavigator from "./ExerciseNavigator";
import { NavigationState } from "../types";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

/**
 * Props for the DatabaseNavigation component, extending NavigationState
 * while omitting loading, generatedExercise, and error properties.
 */
interface DatabaseNavigationProps extends Omit<
  NavigationState,
  "loading" | "generatedExercise" | "error"
> {
  /**
   * Callback function triggered when the selected book, section, or exercise changes.
   * @param type - The type of metadata that changed ('book', 'section', or 'exercise').
   * @param value - The new value (ID) of the selected item.
   */
  onMetadataChange: (type: "book" | "section" | "exercise", value: string) => void;
  /**
   * State setter function for the current exercise index.
   */
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Component providing navigation controls for browsing books, sections, and exercises.
 * It includes dropdowns for selection and an ExerciseNavigator for moving between exercises.
 * @param {DatabaseNavigationProps} props - The component props.
 * @returns {React.ReactElement} The rendered DatabaseNavigation component.
 */
const DatabaseNavigation: React.FC<DatabaseNavigationProps> = ({
  books,
  selectedBook,
  selectedSection,
  sections,
  exercises,
  selectedExercise,
  onMetadataChange,
  currentIndex,
  setCurrentIndex,
}) => {
  const { t } = useFallbackTranslation();

  console.log("exercises:", exercises);

  return (
    <div className="flex gap-2 bg-gray-200 rounded-lg shadow-sm">
      <Dropdown
        label={"book"}
        value={selectedBook?.id || ""}
        options={books.map((book) => ({
          label: book.id,
          value: book.id,
        }))}
        onChange={(value) => onMetadataChange("book", value)}
        labelPosition="above"
      />
      <Dropdown
        label={"section"}
        value={selectedSection ? selectedSection.id : ""}
        options={sections.map((section) => ({
          label: section.title,
          value: section.id,
        }))}
        onChange={(value) => onMetadataChange("section", value)}
        labelPosition="above"
      />
      <Dropdown
        label={"exercise"}
        value={selectedExercise ? selectedExercise.id : ""}
        options={exercises.map((exercise) => ({
          label: exercise.exerciseNumber.toString(),
          value: exercise.id,
        }))}
        onChange={(value) => onMetadataChange("exercise", value)}
        labelPosition="above"
      />
      <ExerciseNavigator
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        totalExercises={selectedSection ? selectedSection.count : 0}
      />
      {selectedBook && (
        <div className="text-black">
          <strong>{t("book_title")}</strong>: {selectedBook.title}
        </div>
      )}
    </div>
  );
};

export default DatabaseNavigation;
