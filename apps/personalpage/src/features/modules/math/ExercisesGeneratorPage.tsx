import { useState, useEffect, useCallback, useRef } from "react";
import { Button, LoadingScreen } from "@websites/ui";
import MathItemsDisplay from "@websites/ui";
import { isFeatureEnabled } from '@/config/features';
import { createComponentLogger } from "@websites/infrastructure/logging";

import { ExerciseDocumentData, NavigationState } from "./exercisesGenerator/types";
import { fetchExercises, fetchMetadata } from "@/features/modules/math/exercisesGenerator/utils/exercisesApi";
import { DatabaseNavigation, ExerciseEditor } from "./exercisesGenerator/components";

export default function ExercisesGeneratorPage() {
    const [navigationState, setNavigationState] = useState<NavigationState>({
        books: [],
        selectedBook: null,
        sections: [],
        selectedSection: null,
        exercises: [],
        selectedExercise: null,
        currentIndex: 0,
        loading: false,
        generatedExercise: [],
        error: null,
    });

    /**
     * @ref {NavigationState} navigationStateRef - A ref to the current navigationState.
     * Used to access the latest state within callbacks that might otherwise capture stale closures.
     */
    const navigationStateRef = useRef(navigationState);
    useEffect(() => {
        navigationStateRef.current = navigationState;
    }, [navigationState]);

    /**
     * @callback updateNavigationState - Helper function to update parts of the navigationState.
     * @param {Partial<NavigationState>} updates - An object containing the state properties to update.
     */
    const updateNavigationState = useCallback((updates: Partial<NavigationState>) =>
        setNavigationState((prev: NavigationState) => ({ ...prev, ...updates })),
        []);

    /**
     * @callback setCurrentIndex - Sets the currentIndex in the navigationState.
     * @param {number | ((prev: number) => number)} indexOrFn - Either a new index number or a function that receives the previous index and returns the new one.
     */
    const setCurrentIndex = useCallback((indexOrFn: number | ((prev: number) => number)) => {
        setNavigationState((prev: NavigationState) => ({
            ...prev,
            currentIndex: typeof indexOrFn === "number" ? indexOrFn : indexOrFn(prev.currentIndex),
        }));
    }, []);

    useEffect(() => {
        // Don't fetch data if feature is disabled
        if (!isFeatureEnabled('exercisesGenerator')) {
            return;
        }

        const fetchInitialData = async () => {
            const logger = createComponentLogger('ExercisesGenerator', 'fetchInitialData');
            logger.info("Starting...");
            updateNavigationState({ loading: true, error: null });
            const { data, error } = await fetchMetadata("db2");
            logger.info("Fetched data", { data });
            if (error) {
                updateNavigationState({ error });
                return;
            }
            if (data) {
                updateNavigationState({ books: data.metadata, selectedBook: data.metadata[1] || null });
                if (data.metadata[1]) {                 //need rework here
                    const sectionsArray = Object.entries(data.metadata[1].sections).map(
                        ([sectionId, count], index) => ({
                            id: sectionId,
                            title: `Section ${index + 1}`,
                            count,
                        })
                    );
                    logger.info("Book sections", { sectionsArray });

                    // Validate the mapped array structure instead of using type assertion
                    const validatedSections = sectionsArray.filter(section =>
                        typeof section.id === 'string' &&
                        typeof section.title === 'string' &&
                        typeof section.count === 'number'
                    );

                    updateNavigationState({
                        sections: validatedSections,
                        selectedSection: validatedSections[0] || null
                    });
                }
            }
            updateNavigationState({ loading: false });
        };

        fetchInitialData();
    }, [updateNavigationState]);

    const fetchData = useCallback(async () => {
        const logger = createComponentLogger('ExercisesGenerator', 'fetchData');
        const currentState = navigationStateRef.current;

        if (!currentState.selectedBook || !currentState.selectedSection) {
            logger.warn("No book or section selected");
            return;
        }

        logger.info("Fetching exercises", {
            bookId: currentState.selectedBook.id,
            sectionId: currentState.selectedSection.id
        });

        updateNavigationState({ loading: true, error: null });
        const { data, error } = await fetchExercises(
            "db2",
            currentState.selectedBook,
            currentState.selectedSection.id
        );

        if (error) {
            logger.error("Error fetching exercises", new Error(error));
            updateNavigationState({ error });
            return;
        }

        if (data) {
            logger.info("Exercises fetched successfully", { count: data.exercises.length });
            updateNavigationState({
                exercises: data.exercises,
                selectedExercise: data.exercises[0] || null,
                currentIndex: 0,
                loading: false
            });
        }
    }, [updateNavigationState]);

    useEffect(() => {
        fetchData();
    }, [navigationState.selectedBook, navigationState.selectedSection, fetchData]);

    const handleMetadataChange = (type: "book" | "section" | "exercise", value: string) => {
        if (type === "book") {
            const book = navigationState.books.find(b => b.id === value) || null;
            updateNavigationState({ selectedBook: book });
        } else if (type === "section") {
            const section = navigationState.sections.find(s => s.id === value) || null;
            updateNavigationState({ selectedSection: section });
        } else if (type === "exercise") {
            const exercise = navigationState.exercises.find(e => e.id === value) || null;
            updateNavigationState({ selectedExercise: exercise });
        }
    };

    const handleFieldChange = <K extends keyof ExerciseDocumentData>(
        field: K,
        value: ExerciseDocumentData[K]
    ) => {
        if (navigationState.selectedExercise) {
            updateNavigationState({
                selectedExercise: {
                    ...navigationState.selectedExercise,
                    [field]: value
                }
            });
        }
    };

    if (navigationState.loading && !navigationState.books.length) {
        return <LoadingScreen />;
    }

    if (navigationState.error) {
        return (
            <div className="text-center p-8">
                <p className="text-red-600 mb-4">Error: {navigationState.error}</p>
                <Button
                    onClick={() => window.location.reload()}
                    variant="primary"
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Panel - Database Navigation */}
                <div className="space-y-6">
                    <DatabaseNavigation
                        books={navigationState.books}
                        selectedBook={navigationState.selectedBook}
                        sections={navigationState.sections}
                        selectedSection={navigationState.selectedSection}
                        exercises={navigationState.exercises}
                        selectedExercise={navigationState.selectedExercise}
                        currentIndex={navigationState.currentIndex}
                        onMetadataChange={handleMetadataChange}
                        setCurrentIndex={setCurrentIndex}
                    />
                </div>

                {/* Right Panel - Exercise Editor */}
                <div className="space-y-6">
                    {navigationState.selectedExercise && (
                        <ExerciseEditor
                            selectedExercise={navigationState.selectedExercise}
                            handleFieldChange={handleFieldChange}
                        />
                    )}

                    {/* Generated Exercise Display */}
                    {navigationState.generatedExercise.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Generated Exercise</h3>
                            <MathItemsDisplay mathItems={navigationState.generatedExercise} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



