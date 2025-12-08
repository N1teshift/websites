import React from "react";
import { LearningExperienceCard, ActivityCard } from "../../types/UnitPlanTypes";

interface LearningExperienceCardManagerProps {
  cards: LearningExperienceCard[];
  onCardsChange: (cards: LearningExperienceCard[]) => void;
}

const LearningExperienceCardManager: React.FC<LearningExperienceCardManagerProps> = ({
  cards,
  onCardsChange,
}) => {
  const addLearningExperience = () => {
    const newLearningExperience: LearningExperienceCard = {
      id: Date.now().toString(),
      learningExperienceDayRange: "1",
      learningExperienceHoursCount: "1",
      learningExperienceName: "",
      learningExperienceDescription: "",
      learningExperienceFormativeAssessment: "",
      activities: [],
    };
    onCardsChange([...cards, newLearningExperience]);
  };

  const updateLearningExperience = (
    id: string,
    field: keyof LearningExperienceCard,
    value: string | ActivityCard[]
  ) => {
    const updatedCards = cards.map((card) => (card.id === id ? { ...card, [field]: value } : card));
    onCardsChange(updatedCards);
  };

  const removeLearningExperience = (id: string) => {
    const updatedCards = cards.filter((card) => card.id !== id);
    onCardsChange(updatedCards);
  };

  const addActivity = (learningExperienceId: string) => {
    const newActivity: ActivityCard = {
      id: Date.now().toString(),
      activityName: "",
      activityDescription: "",
      activityFormativeAssessmentTitle: "",
    };

    const updatedCards = cards.map((card) =>
      card.id === learningExperienceId
        ? { ...card, activities: [...card.activities, newActivity] }
        : card
    );
    onCardsChange(updatedCards);
  };

  const updateActivity = (
    learningExperienceId: string,
    activityId: string,
    field: keyof ActivityCard,
    value: string
  ) => {
    const updatedCards = cards.map((card) =>
      card.id === learningExperienceId
        ? {
            ...card,
            activities: card.activities.map((activity) =>
              activity.id === activityId ? { ...activity, [field]: value } : activity
            ),
          }
        : card
    );
    onCardsChange(updatedCards);
  };

  const removeActivity = (learningExperienceId: string, activityId: string) => {
    const updatedCards = cards.map((card) =>
      card.id === learningExperienceId
        ? {
            ...card,
            activities: card.activities.filter((activity) => activity.id !== activityId),
          }
        : card
    );
    onCardsChange(updatedCards);
  };

  const safeCards = cards || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Learning Experiences</h4>
        <button
          type="button"
          onClick={addLearningExperience}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Learning Experience
        </button>
      </div>

      {safeCards.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No learning experiences created yet. Click &quot;Add Learning Experience&quot; to get
          started.
        </div>
      ) : (
        <div className="space-y-6">
          {safeCards.map((learningExperience, index) => (
            <div
              key={learningExperience.id}
              className="border border-gray-200 rounded-lg p-6 bg-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-medium text-gray-900">
                  Learning Experience {index + 1}
                </h5>
                <button
                  type="button"
                  onClick={() => removeLearningExperience(learningExperience.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>

              {/* Learning Experience Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Day Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                  <input
                    type="text"
                    value={learningExperience.learningExperienceDayRange}
                    onChange={(e) =>
                      updateLearningExperience(
                        learningExperience.id,
                        "learningExperienceDayRange",
                        e.target.value
                      )
                    }
                    placeholder="e.g., 1 or 1-2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Hours Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                  <input
                    type="text"
                    value={learningExperience.learningExperienceHoursCount}
                    onChange={(e) =>
                      updateLearningExperience(
                        learningExperience.id,
                        "learningExperienceHoursCount",
                        e.target.value
                      )
                    }
                    placeholder="e.g., 1 or 1.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Learning Experience Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Experience Name
                </label>
                <input
                  type="text"
                  value={learningExperience.learningExperienceName}
                  onChange={(e) =>
                    updateLearningExperience(
                      learningExperience.id,
                      "learningExperienceName",
                      e.target.value
                    )
                  }
                  placeholder="Enter learning experience name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Learning Experience Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Experience Description
                </label>
                <textarea
                  value={learningExperience.learningExperienceDescription}
                  onChange={(e) =>
                    updateLearningExperience(
                      learningExperience.id,
                      "learningExperienceDescription",
                      e.target.value
                    )
                  }
                  placeholder="Describe the learning experience"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Learning Experience Formative Assessment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formative Assessment
                </label>
                <input
                  type="text"
                  value={learningExperience.learningExperienceFormativeAssessment}
                  onChange={(e) =>
                    updateLearningExperience(
                      learningExperience.id,
                      "learningExperienceFormativeAssessment",
                      e.target.value
                    )
                  }
                  placeholder="Enter formative assessment for this learning experience"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Activities Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h6 className="text-md font-medium text-gray-900">
                    Activities ({learningExperience.activities.length})
                  </h6>
                  <button
                    type="button"
                    onClick={() => addActivity(learningExperience.id)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Add Activity
                  </button>
                </div>

                {learningExperience.activities.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">
                    No activities created yet. Click &quot;Add Activity&quot; to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {learningExperience.activities.map((activity, activityIndex) => (
                      <div
                        key={activity.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="text-sm font-medium text-gray-900">
                            Activity {activityIndex + 1}
                          </h6>
                          <button
                            type="button"
                            onClick={() => removeActivity(learningExperience.id, activity.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        </div>

                        {/* Activity Name */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Activity Name
                          </label>
                          <input
                            type="text"
                            value={activity.activityName}
                            onChange={(e) =>
                              updateActivity(
                                learningExperience.id,
                                activity.id,
                                "activityName",
                                e.target.value
                              )
                            }
                            placeholder="Enter activity name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        {/* Activity Description */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Activity Description
                          </label>
                          <textarea
                            value={activity.activityDescription}
                            onChange={(e) =>
                              updateActivity(
                                learningExperience.id,
                                activity.id,
                                "activityDescription",
                                e.target.value
                              )
                            }
                            placeholder="Describe the activity"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        {/* Formative Assessment Title */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Formative Assessment Title
                          </label>
                          <input
                            type="text"
                            value={activity.activityFormativeAssessmentTitle}
                            onChange={(e) =>
                              updateActivity(
                                learningExperience.id,
                                activity.id,
                                "activityFormativeAssessmentTitle",
                                e.target.value
                              )
                            }
                            placeholder="Enter formative assessment title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningExperienceCardManager;
