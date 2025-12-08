import { useState, useEffect, useCallback } from "react";
import {
  CommentTemplate,
  DEFAULT_TEMPLATE,
  ENGLISH_DIAGNOSTIC_1_TEMPLATE,
  ENGLISH_UNIT_1_TEMPLATE,
} from "../types/CommentTemplateTypes";

const STORAGE_KEY = "progress_report_comment_templates";
const ACTIVE_TEMPLATE_KEY = "progress_report_active_template_id";

// Default templates including Math and English
const DEFAULT_TEMPLATES = [
  DEFAULT_TEMPLATE,
  ENGLISH_DIAGNOSTIC_1_TEMPLATE,
  ENGLISH_UNIT_1_TEMPLATE,
];

export function useCommentTemplates() {
  const [templates, setTemplates] = useState<CommentTemplate[]>(DEFAULT_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(DEFAULT_TEMPLATE.id);

  // Load templates from localStorage on mount
  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem(STORAGE_KEY);
      const storedActiveId = localStorage.getItem(ACTIVE_TEMPLATE_KEY);

      if (storedTemplates) {
        const parsed = JSON.parse(storedTemplates) as CommentTemplate[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migration: Ensure all default templates are present
          const storedIds = new Set(parsed.map((t) => t.id));
          const missingTemplates = DEFAULT_TEMPLATES.filter((dt) => !storedIds.has(dt.id));

          if (missingTemplates.length > 0) {
            // Add missing templates from defaults
            const migratedTemplates = [...parsed, ...missingTemplates];
            setTemplates(migratedTemplates);
            console.log(
              `✨ Added ${missingTemplates.length} new template(s):`,
              missingTemplates.map((t) => t.name)
            );
          } else {
            setTemplates(parsed);
          }

          // Set active template if stored, otherwise use first template
          if (storedActiveId && parsed.some((t) => t.id === storedActiveId)) {
            setActiveTemplateId(storedActiveId);
          } else {
            setActiveTemplateId(parsed[0].id);
          }
        } else {
          // Invalid stored data, use defaults
          setTemplates(DEFAULT_TEMPLATES);
          setActiveTemplateId(DEFAULT_TEMPLATE.id);
        }
      } else {
        // No stored templates, initialize with defaults
        setTemplates(DEFAULT_TEMPLATES);
        setActiveTemplateId(DEFAULT_TEMPLATE.id);
      }
    } catch (error) {
      console.error("Failed to load comment templates from localStorage:", error);
      // Fall back to default templates
      setTemplates(DEFAULT_TEMPLATES);
      setActiveTemplateId(DEFAULT_TEMPLATE.id);
    }
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error("Failed to save comment templates to localStorage:", error);
    }
  }, [templates]);

  // Save active template ID to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_TEMPLATE_KEY, activeTemplateId);
    } catch (error) {
      console.error("Failed to save active template ID to localStorage:", error);
    }
  }, [activeTemplateId]);

  const activeTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0];

  const updateTemplate = useCallback((templateId: string, updates: Partial<CommentTemplate>) => {
    setTemplates((prev) => prev.map((t) => (t.id === templateId ? { ...t, ...updates } : t)));
  }, []);

  const addTemplate = useCallback((template: CommentTemplate) => {
    setTemplates((prev) => [...prev, template]);
  }, []);

  const deleteTemplate = useCallback(
    (templateId: string) => {
      setTemplates((prev) => {
        const filtered = prev.filter((t) => t.id !== templateId);
        // Ensure at least one template exists
        return filtered.length > 0 ? filtered : DEFAULT_TEMPLATES;
      });

      // If deleting active template, switch to first available
      if (templateId === activeTemplateId) {
        setActiveTemplateId(templates[0]?.id || DEFAULT_TEMPLATE.id);
      }
    },
    [activeTemplateId, templates]
  );

  const resetToDefault = useCallback(() => {
    setTemplates(DEFAULT_TEMPLATES);
    setActiveTemplateId(DEFAULT_TEMPLATE.id);
  }, []);

  return {
    templates,
    activeTemplate,
    activeTemplateId,
    setActiveTemplateId,
    updateTemplate,
    addTemplate,
    deleteTemplate,
    resetToDefault,
  };
}
