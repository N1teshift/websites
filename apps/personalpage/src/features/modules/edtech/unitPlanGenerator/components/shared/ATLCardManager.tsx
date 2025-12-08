import React from "react";
import { ATLCard } from "../../types/UnitPlanTypes";
import { ATL_CARD_CATEGORIES } from "../../data/atlCardCategories";
import FormField from "./FormField";
import LabelWithInfo from "./LabelWithInfo";

interface ATLCardManagerProps {
  cards: ATLCard[];
  onCardsChange: (cards: ATLCard[]) => void;
}

const ATLCardManager: React.FC<ATLCardManagerProps> = ({ cards, onCardsChange }) => {
  // Ensure cards is always an array
  const safeCards = cards || [];

  const addCard = () => {
    const newCard: ATLCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      categoryCluster: "Thinking/Critical thinking",
      atlSupport: "",
      atlStrategyName: "",
      atlStrategyDescription: "",
    };
    onCardsChange([...safeCards, newCard]);
  };

  const updateCard = (cardId: string, field: keyof ATLCard, value: string) => {
    const updatedCards = safeCards.map((card) =>
      card.id === cardId ? { ...card, [field]: value } : card
    );
    onCardsChange(updatedCards);
  };

  const removeCard = (cardId: string) => {
    const updatedCards = safeCards.filter((card) => card.id !== cardId);
    onCardsChange(updatedCards);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <LabelWithInfo
          label="ATL Cards"
          info="Create ATL cards for the current display mode. Each card represents a row in the Word document table."
        />
        <button
          type="button"
          onClick={addCard}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Card
        </button>
      </div>

      {safeCards.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No ATL cards created yet.</p>
          <p className="text-sm">Click &quot;Add Card&quot; to create your first ATL card.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {safeCards.map((card, index) => (
            <div key={card.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Card {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeCard(card.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <LabelWithInfo
                    label="Category Cluster"
                    info="Select the ATL category and subcategory for this card"
                    required
                  />
                  <select
                    value={card.categoryCluster}
                    onChange={(e) => updateCard(card.id, "categoryCluster", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    {ATL_CARD_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <FormField
                  label="ATL Support"
                  value={card.atlSupport}
                  onChange={(value) => updateCard(card.id, "atlSupport", value)}
                  placeholder="Enter ATL support description"
                  required
                />
              </div>

              <div className="mt-4">
                <FormField
                  label="Strategy Name"
                  value={card.atlStrategyName}
                  onChange={(value) => updateCard(card.id, "atlStrategyName", value)}
                  placeholder="Enter strategy name"
                  required
                />
              </div>

              <div className="mt-4">
                <FormField
                  label="Strategy Description"
                  value={card.atlStrategyDescription}
                  onChange={(value) => updateCard(card.id, "atlStrategyDescription", value)}
                  type="textarea"
                  rows={3}
                  placeholder="Describe the ATL strategy in detail"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ATLCardManager;
