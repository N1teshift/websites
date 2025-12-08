import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import { ActiveSection } from "../../types/UnitPlanTypes";

interface GuideSectionProps {
  onSectionChange: (section: ActiveSection) => void;
}

const GuideSection: React.FC<GuideSectionProps> = ({ onSectionChange }) => {
  const { t } = useFallbackTranslation();

  const handleStepClick = (section: ActiveSection) => {
    onSectionChange(section);
  };

  // Shared classes for step content
  const stepContentClass = "text-text-primary text-sm";
  const stepContentWrapperClass = "mt-3 space-y-2";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 pb-4 border-b-2 border-border-default">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-medium">
          <span className="text-white text-xl font-bold">📖</span>
        </div>
        <h2 className="text-3xl font-bold text-text-primary">
          {t("enhanced_myp_unit_planning_algorithm")}
        </h2>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-5 rounded-xl border-2 border-primary-400 shadow-soft hover:shadow-medium transition-all duration-200">
          <button onClick={() => handleStepClick("basic-info")} className="text-left w-full group">
            <h3 className="text-lg font-bold text-white group-hover:text-text-inverse cursor-pointer flex items-center gap-2 transition-colors">
              <span className="text-xl">1️⃣</span>
              {t("step_1_basic_info")}
            </h3>
          </button>
          <div className={stepContentWrapperClass}>
            <p className={stepContentClass}>• {t("step_1_basic_info_content")}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-success-500 to-success-600 p-5 rounded-xl border-2 border-success-400 shadow-soft hover:shadow-medium transition-all duration-200">
          <button onClick={() => handleStepClick("content")} className="text-left w-full group">
            <h3 className="text-lg font-bold text-white group-hover:text-text-inverse cursor-pointer flex items-center gap-2 transition-colors">
              <span className="text-xl">2️⃣</span>
              {t("step_2_content")}
            </h3>
          </button>
          <div className={stepContentWrapperClass}>
            <p className={stepContentClass}>• {t("step_2_define_content")}</p>
            <p className={stepContentClass}>• {t("step_2_add_subtopics")}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-5 rounded-xl border-2 border-secondary-400 shadow-soft hover:shadow-medium transition-all duration-200">
          <button onClick={() => handleStepClick("content")} className="text-left w-full group">
            <h3 className="text-lg font-bold text-white group-hover:text-text-inverse cursor-pointer flex items-center gap-2 transition-colors">
              <span className="text-xl">3️⃣</span>
              {t("step_3_content_filling")}
            </h3>
          </button>
          <div className={stepContentWrapperClass}>
            <p className={stepContentClass}>{t("step_3_intro")}</p>
            <p className={stepContentClass}>• {t("step_3_lesson_count")}</p>
            <p className={stepContentClass}>• {t("step_3_subtopic_name")}</p>
            <p className={stepContentClass}>• {t("step_3_prior_knowledge")}</p>
            <p className={stepContentClass}>• {t("step_3_prior_skills")}</p>
            <p className={stepContentClass}>• {t("step_3_new_terms")}</p>
            <p className={stepContentClass}>• {t("step_3_conceptual_procedural")}</p>
            <p className={stepContentClass}>• {t("step_3_success_criteria")}</p>
            <p className={stepContentClass}>• {t("step_3_activities")}</p>
            <p className={stepContentClass}>• {t("step_3_learning_experiences")}</p>
            <p className={stepContentClass}>• {t("step_3_differentiation")}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-warning-500 to-warning-600 p-5 rounded-xl border-2 border-warning-400 shadow-soft hover:shadow-medium transition-all duration-200">
          <button onClick={() => handleStepClick("inquiry")} className="text-left w-full group">
            <h3 className="text-lg font-bold text-white group-hover:text-text-inverse cursor-pointer flex items-center gap-2 transition-colors">
              <span className="text-xl">4️⃣</span>
              {t("step_4_concepts")}
            </h3>
          </button>
          <div className={stepContentWrapperClass}>
            <p className={stepContentClass}>• {t("step_4_select_specified")}</p>
            <p className={stepContentClass}>• {t("step_4_conceptual_understanding")}</p>
            <p className={stepContentClass}>• {t("step_4_global_context")}</p>
            <p className={stepContentClass}>• {t("step_4_context_exploration")}</p>
            <p className={stepContentClass}>• {t("step_4_inquiry_statement")}</p>
            <p className={stepContentClass}>• {t("step_4_questions")}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-danger-500 to-danger-600 p-5 rounded-xl border-2 border-danger-400 shadow-soft hover:shadow-medium transition-all duration-200">
          <button onClick={() => handleStepClick("planning")} className="text-left w-full group">
            <h3 className="text-lg font-bold text-white group-hover:text-text-inverse cursor-pointer flex items-center gap-2 transition-colors">
              <span className="text-xl">5️⃣</span>
              {t("step_5_summative_assessment")}
            </h3>
          </button>
          <div className={stepContentWrapperClass}>
            <p className={stepContentClass}>• {t("step_5_select_objectives")}</p>
            <p className={stepContentClass}>• {t("step_5_assessment_name")}</p>
            <p className={stepContentClass}>• {t("step_5_assessment_type")}</p>
            <p className={stepContentClass}>• {t("step_5_assessment_task")}</p>
            <p className={stepContentClass}>• {t("step_5_assessment_inquiry")}</p>
            <p className={stepContentClass}>• {t("step_5_command_terms")}</p>
            <p className={stepContentClass}>• {t("step_5_contexts")}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-5 rounded-xl border-2 border-primary-400 shadow-soft hover:shadow-medium transition-all duration-200">
          <button onClick={() => handleStepClick("atl")} className="text-left w-full group">
            <h3 className="text-lg font-bold text-white group-hover:text-text-inverse cursor-pointer flex items-center gap-2 transition-colors">
              <span className="text-xl">6️⃣</span>
              {t("step_6_atl_skills")}
            </h3>
          </button>
          <div className={stepContentWrapperClass}>
            <p className={stepContentClass}>• {t("step_6_select_atl")}</p>
            <p className={stepContentClass}>• {t("step_6_describe_atl")}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-warning-500 to-warning-600 p-5 rounded-xl border-2 border-warning-400 shadow-soft hover:shadow-medium transition-all duration-200">
          <button onClick={() => handleStepClick("resources")} className="text-left w-full group">
            <h3 className="text-lg font-bold text-white group-hover:text-text-inverse cursor-pointer flex items-center gap-2 transition-colors">
              <span className="text-xl">7️⃣</span>
              {t("step_7_resources")}
            </h3>
          </button>
          <div className={stepContentWrapperClass}>
            <p className={stepContentClass}>• {t("step_7_print_resources")}</p>
            <p className={stepContentClass}>• {t("step_7_digital_resources")}</p>
            <p className={stepContentClass}>• {t("step_7_guest_speakers")}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-success-500 to-success-600 p-5 rounded-xl border-2 border-success-400 shadow-soft hover:shadow-medium transition-all duration-200">
          <button
            onClick={() => handleStepClick("community-engagement")}
            className="text-left w-full group"
          >
            <h3 className="text-lg font-bold text-white group-hover:text-text-inverse cursor-pointer flex items-center gap-2 transition-colors">
              <span className="text-xl">8️⃣</span>
              {t("step_8_community")}
            </h3>
          </button>
          <div className={stepContentWrapperClass}>
            <p className={stepContentClass}>• {t("step_8_community_activities")}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-5 rounded-xl border-2 border-secondary-400 shadow-soft hover:shadow-medium transition-all duration-200">
          <button onClick={() => handleStepClick("reflection")} className="text-left w-full group">
            <h3 className="text-lg font-bold text-white group-hover:text-text-inverse cursor-pointer flex items-center gap-2 transition-colors">
              <span className="text-xl">9️⃣</span>
              {t("step_9_reflection")}
            </h3>
          </button>
          <div className={stepContentWrapperClass}>
            <p className={stepContentClass}>• {t("step_9_complete_reflection")}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-500 to-secondary-600 p-5 rounded-xl border-2 border-primary-400 shadow-soft hover:shadow-medium transition-all duration-200">
          <button onClick={() => handleStepClick("preview")} className="text-left w-full group">
            <h3 className="text-lg font-bold text-white group-hover:text-text-inverse cursor-pointer flex items-center gap-2 transition-colors">
              <span className="text-xl">🔟</span>
              {t("step_10_preview")}
            </h3>
          </button>
          <div className={stepContentWrapperClass}>
            <p className={stepContentClass}>• {t("step_10_review_save")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideSection;
