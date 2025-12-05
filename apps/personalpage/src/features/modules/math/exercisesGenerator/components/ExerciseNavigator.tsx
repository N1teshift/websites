import { useFallbackTranslation } from "@/features/infrastructure/i18n";

type ExerciseNavigatorProps = {
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    totalExercises: number;
};

const ExerciseNavigator = ({
    currentIndex,
    setCurrentIndex,
    totalExercises,
}: ExerciseNavigatorProps) => {
    const { t } = useFallbackTranslation();

    const goToNext = () => {
        if (currentIndex < totalExercises - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    return (
        <div className="flex justify-center space-x-4 mt-4">
            <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className={`px-4 py-2 rounded text-black border border-black hover:bg-gray-200 
                ${currentIndex === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-100"}`}
            >
                {t("previous")}
            </button>
            <button
                onClick={goToNext}
                disabled={currentIndex === totalExercises - 1}
                className={`px-4 py-2 rounded text-black border border-black hover:bg-gray-200 
                ${currentIndex === totalExercises - 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-100"}`}
            >
                {t("next")}
            </button>
        </div>
    );
};

export default ExerciseNavigator;



