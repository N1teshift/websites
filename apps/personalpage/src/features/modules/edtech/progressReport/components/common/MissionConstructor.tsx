import React, { useState } from "react";
import { Plus, X } from "lucide-react";

interface MissionFormData {
  title: string;
  description: string;
  deadline: string;
  assessmentColumns: string[];
}

interface MissionConstructorProps {
  onCreateMission: (mission: MissionFormData) => void;
  onClose: () => void;
}

const MissionConstructor: React.FC<MissionConstructorProps> = ({ onCreateMission, onClose }) => {
  const [formData, setFormData] = useState<MissionFormData>({
    title: "",
    description: "",
    deadline: "",
    assessmentColumns: [""],
  });

  const handleAddColumn = () => {
    setFormData((prev) => ({
      ...prev,
      assessmentColumns: [...prev.assessmentColumns, ""],
    }));
  };

  const handleRemoveColumn = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      assessmentColumns: prev.assessmentColumns.filter((_, i) => i !== index),
    }));
  };

  const handleColumnChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      assessmentColumns: prev.assessmentColumns.map((col, i) =>
        i === index ? value.toUpperCase() : col
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.title.trim()) {
      alert("Please enter a mission title");
      return;
    }
    if (!formData.deadline) {
      alert("Please select a deadline");
      return;
    }
    const validColumns = formData.assessmentColumns.filter((col) => col.trim() !== "");
    if (validColumns.length === 0) {
      alert("Please add at least one assessment column");
      return;
    }

    onCreateMission({
      ...formData,
      assessmentColumns: validColumns,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create New Mission</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mission Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., SD4, SD5, SD6 Tests Completion"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what students need to do..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Assessment Columns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Columns <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Add the column names (e.g., KD3, SD4, SD5) that students need to complete
            </p>
            <div className="space-y-2">
              {formData.assessmentColumns.map((column, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={column}
                    onChange={(e) => handleColumnChange(index, e.target.value)}
                    placeholder="e.g., SD4, KD3"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.assessmentColumns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddColumn}
              className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Another Column
            </button>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>Title:</strong> {formData.title || "(empty)"}
              </p>
              <p>
                <strong>Deadline:</strong> {formData.deadline || "(not set)"}
              </p>
              <p>
                <strong>Columns:</strong>{" "}
                {formData.assessmentColumns.filter((c) => c.trim()).join(", ") || "(none)"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Create Mission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MissionConstructor;
