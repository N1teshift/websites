import React, { useState } from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import { getBUPByGrade, BUPModule, BUPUnit, BUPSubunit } from "../../data/curriculumBUP";
import {
  getCambridgeByGrade,
  CambridgeStrand,
  CambridgeSubstrand,
  CambridgeObjective,
} from "../../data/curriculumCambridge";
import { getBookByGrade, BookUnit, BookSubsection } from "../../data/cambridgeLearnerBook";
import { CurriculumConnection } from "../../types/UnitPlanTypes";
import { FiChevronDown, FiChevronRight, FiPlus, FiLink, FiBook } from "react-icons/fi";

interface CurriculumContentSelectorProps {
  mypYear: number;
  subject: string;
  onAddContent: (content: string) => void;
  onAddConnection: (connection: CurriculumConnection) => void;
  existingConnections?: CurriculumConnection[];
}

const CurriculumContentSelector: React.FC<CurriculumContentSelectorProps> = ({
  mypYear,
  subject,
  onAddContent,
  onAddConnection,
  existingConnections = [],
}) => {
  const { t } = useFallbackTranslation();
  const [isMainExpanded, setIsMainExpanded] = useState(false);
  const [bupExpanded, setBupExpanded] = useState(false);
  const [cambridgeExpanded, setCambridgeExpanded] = useState(false);
  const [cambridgeBookExpanded, setCambridgeBookExpanded] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedStrands, setExpandedStrands] = useState<Set<string>>(new Set());
  const [expandedSubstrands, setExpandedSubstrands] = useState<Set<string>>(new Set());
  const [expandedBookUnits, setExpandedBookUnits] = useState<Set<string>>(new Set());

  const isConnected = (id: string): boolean => {
    return existingConnections.some((conn) => conn.id === id);
  };

  // Only show for Mathematics in MYP 2 or 3
  if (subject !== "mathematics" || ![2, 3].includes(mypYear)) {
    return null;
  }

  const displayGrade = mypYear === 2 ? 7 : 8;
  const cambridgeStage = displayGrade === 7 ? 8 : 9;

  const bupData = getBUPByGrade(displayGrade);
  const cambridgeData = getCambridgeByGrade(displayGrade);
  const cambridgeBook = getBookByGrade(displayGrade);

  const toggleModule = (moduleId: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(moduleId)) {
      newSet.delete(moduleId);
    } else {
      newSet.add(moduleId);
    }
    setExpandedModules(newSet);
  };

  const toggleUnit = (unitId: string) => {
    const newSet = new Set(expandedUnits);
    if (newSet.has(unitId)) {
      newSet.delete(unitId);
    } else {
      newSet.add(unitId);
    }
    setExpandedUnits(newSet);
  };

  const toggleStrand = (strandId: string) => {
    const newSet = new Set(expandedStrands);
    if (newSet.has(strandId)) {
      newSet.delete(strandId);
    } else {
      newSet.add(strandId);
    }
    setExpandedStrands(newSet);
  };

  const toggleSubstrand = (substrandId: string) => {
    const newSet = new Set(expandedSubstrands);
    if (newSet.has(substrandId)) {
      newSet.delete(substrandId);
    } else {
      newSet.add(substrandId);
    }
    setExpandedSubstrands(newSet);
  };

  const toggleBookUnit = (unitId: string) => {
    const newSet = new Set(expandedBookUnits);
    if (newSet.has(unitId)) {
      newSet.delete(unitId);
    } else {
      newSet.add(unitId);
    }
    setExpandedBookUnits(newSet);
  };

  const formatBUPSubunit = (subunit: BUPSubunit, unitName: string, moduleName: string): string => {
    return `\n**${moduleName} → ${unitName} → ${subunit.name}**\n\n${subunit.originalText}\n`;
  };

  const formatBUPUnit = (unit: BUPUnit, moduleName: string): string => {
    let content = `\n**${moduleName} → ${unit.name}**\n\n`;
    unit.subunits.forEach((subunit) => {
      content += `• ${subunit.name}: ${subunit.originalText}\n\n`;
    });
    return content;
  };

  const formatBUPModule = (module: BUPModule): string => {
    let content = `\n**${module.name}**\n\n`;
    module.units.forEach((unit) => {
      content += `**${unit.name}**\n`;
      unit.subunits.forEach((subunit) => {
        content += `• ${subunit.name}: ${subunit.originalText}\n\n`;
      });
    });
    return content;
  };

  const formatCambridgeObjective = (
    objective: CambridgeObjective,
    substrandName: string,
    strandName: string
  ): string => {
    return `\n**${strandName} → ${substrandName} → ${objective.code}**\n\n${objective.description}\n`;
  };

  const formatCambridgeSubstrand = (substrand: CambridgeSubstrand, strandName: string): string => {
    let content = `\n**${strandName} → ${substrand.name}**\n\n`;
    substrand.objectives.forEach((objective) => {
      content += `• ${objective.code}: ${objective.description}\n`;
    });
    content += "\n";
    return content;
  };

  const formatCambridgeStrand = (strand: CambridgeStrand): string => {
    let content = `\n**${strand.name}**\n\n`;
    strand.substrands.forEach((substrand) => {
      content += `**${substrand.name}**\n`;
      substrand.objectives.forEach((objective) => {
        content += `• ${objective.code}: ${objective.description}\n`;
      });
      content += "\n";
    });
    return content;
  };

  // Connection creators
  const createBUPSubunitConnection = (
    subunit: BUPSubunit,
    unit: BUPUnit,
    module: BUPModule
  ): CurriculumConnection => ({
    id: subunit.id,
    type: "bup",
    level: "subunit",
    displayPath: `${module.name} → ${unit.name} → ${subunit.name}`,
    moduleId: module.id,
    moduleName: module.name,
    unitId: unit.id,
    unitName: unit.name,
    subunitId: subunit.id,
    subunitName: subunit.name,
    subunitText: subunit.originalText,
  });

  const createBUPUnitConnection = (unit: BUPUnit, module: BUPModule): CurriculumConnection => ({
    id: unit.id,
    type: "bup",
    level: "unit",
    displayPath: `${module.name} → ${unit.name}`,
    moduleId: module.id,
    moduleName: module.name,
    unitId: unit.id,
    unitName: unit.name,
  });

  const createBUPModuleConnection = (module: BUPModule): CurriculumConnection => ({
    id: module.id,
    type: "bup",
    level: "module",
    displayPath: module.name,
    moduleId: module.id,
    moduleName: module.name,
  });

  const createCambridgeObjectiveConnection = (
    objective: CambridgeObjective,
    substrand: CambridgeSubstrand,
    strand: CambridgeStrand
  ): CurriculumConnection => ({
    id: objective.id,
    type: "cambridge",
    level: "objective",
    displayPath: `${strand.name} → ${substrand.name} → ${objective.code}`,
    strandId: strand.id,
    strandName: strand.name,
    substrandId: substrand.id,
    substrandName: substrand.name,
    objectiveId: objective.id,
    objectiveCode: objective.code,
    objectiveDescription: objective.description,
  });

  const createCambridgeSubstrandConnection = (
    substrand: CambridgeSubstrand,
    strand: CambridgeStrand
  ): CurriculumConnection => ({
    id: substrand.id,
    type: "cambridge",
    level: "substrand",
    displayPath: `${strand.name} → ${substrand.name}`,
    strandId: strand.id,
    strandName: strand.name,
    substrandId: substrand.id,
    substrandName: substrand.name,
  });

  const createCambridgeStrandConnection = (strand: CambridgeStrand): CurriculumConnection => ({
    id: strand.id,
    type: "cambridge",
    level: "strand",
    displayPath: strand.name,
    strandId: strand.id,
    strandName: strand.name,
  });

  // Cambridge Book formatting
  const formatBookSubsection = (subsection: BookSubsection, unit: BookUnit): string => {
    return `\n**Unit ${unit.unitNumber}: ${unit.title} → ${subsection.code} ${subsection.title}**\n\nPages: ${unit.pages}\n`;
  };

  const formatBookUnit = (unit: BookUnit): string => {
    let content = `\n**Unit ${unit.unitNumber}: ${unit.title}**\n\nPages: ${unit.pages}\nStrand: ${unit.strand}\n\n`;
    unit.subsections.forEach((subsection) => {
      content += `• ${subsection.code} ${subsection.title}\n`;
    });
    content += "\n";
    return content;
  };

  // Cambridge Book connection creators
  const createBookSubsectionConnection = (
    subsection: BookSubsection,
    unit: BookUnit
  ): CurriculumConnection => ({
    id: subsection.id,
    type: "cambridge-book",
    level: "book-subsection",
    displayPath: `Unit ${unit.unitNumber}: ${unit.title} → ${subsection.code}`,
    bookUnitId: unit.id,
    bookUnitNumber: unit.unitNumber,
    bookUnitTitle: unit.title,
    bookUnitPages: unit.pages,
    bookSubsectionId: subsection.id,
    bookSubsectionCode: subsection.code,
    bookSubsectionTitle: subsection.title,
  });

  const createBookUnitConnection = (unit: BookUnit): CurriculumConnection => ({
    id: unit.id,
    type: "cambridge-book",
    level: "book-unit",
    displayPath: `Unit ${unit.unitNumber}: ${unit.title}`,
    bookUnitId: unit.id,
    bookUnitNumber: unit.unitNumber,
    bookUnitTitle: unit.title,
    bookUnitPages: unit.pages,
  });

  const handleAddWithText = (content: string, connection: CurriculumConnection) => {
    onAddContent(content);
    onAddConnection(connection);
  };

  const handleAddLinkOnly = (connection: CurriculumConnection) => {
    onAddConnection(connection);
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsMainExpanded(!isMainExpanded)}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors"
      >
        <svg
          className={`w-4 h-4 mr-1.5 transition-transform ${isMainExpanded ? "rotate-90" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="mr-2">📚</span>
        {t("add_content_from_curriculum")}
      </button>

      {isMainExpanded && (
        <div className="mt-2 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border-2 border-gray-300 rounded-lg p-6 space-y-4">
          <p className="text-sm text-gray-600 mb-4">{t("curriculum_selector_description")}</p>

          {/* BUP Curriculum Section */}
          {bupData && (
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setBupExpanded(!bupExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {bupExpanded ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
                  <span className="font-semibold text-gray-900">
                    🇱🇹 BUP Curriculum (Grade {displayGrade})
                  </span>
                </div>
              </button>

              {bupExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-2">
                  {bupData.modules.map((module: BUPModule) => (
                    <div
                      key={module.id}
                      className="border border-gray-200 rounded-md overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 transition-colors">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {expandedModules.has(module.id) ? (
                            <FiChevronDown size={16} />
                          ) : (
                            <FiChevronRight size={16} />
                          )}
                          <span className="font-medium text-gray-900 text-sm">
                            {module.name}
                            {isConnected(module.id) && (
                              <span className="ml-2 text-xs text-green-600">✓</span>
                            )}
                          </span>
                        </button>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              handleAddWithText(
                                formatBUPModule(module),
                                createBUPModuleConnection(module)
                              )
                            }
                            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs"
                            title={t("add_text_and_link")}
                            disabled={isConnected(module.id)}
                          >
                            <FiPlus size={12} />
                            {t("text")}
                          </button>
                          <button
                            onClick={() => handleAddLinkOnly(createBUPModuleConnection(module))}
                            className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t("link_only")}
                            disabled={isConnected(module.id)}
                          >
                            <FiLink size={12} />
                            {t("link")}
                          </button>
                        </div>
                      </div>

                      {expandedModules.has(module.id) && (
                        <div className="p-2 space-y-2 bg-white">
                          {module.units.map((unit: BUPUnit) => (
                            <div
                              key={unit.id}
                              className="border border-gray-200 rounded-md overflow-hidden"
                            >
                              <div className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <button
                                  onClick={() => toggleUnit(unit.id)}
                                  className="flex items-center gap-2 flex-1 text-left"
                                >
                                  {expandedUnits.has(unit.id) ? (
                                    <FiChevronDown size={14} />
                                  ) : (
                                    <FiChevronRight size={14} />
                                  )}
                                  <span className="text-gray-800 text-xs font-medium">
                                    {unit.name}
                                    {isConnected(unit.id) && (
                                      <span className="ml-2 text-xs text-green-600">✓</span>
                                    )}
                                  </span>
                                </button>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      handleAddWithText(
                                        formatBUPUnit(unit, module.name),
                                        createBUPUnitConnection(unit, module)
                                      )
                                    }
                                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t("add_text_and_link")}
                                    disabled={isConnected(unit.id)}
                                  >
                                    <FiPlus size={12} />
                                    {t("text")}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAddLinkOnly(createBUPUnitConnection(unit, module))
                                    }
                                    className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t("link_only")}
                                    disabled={isConnected(unit.id)}
                                  >
                                    <FiLink size={12} />
                                    {t("link")}
                                  </button>
                                </div>
                              </div>

                              {expandedUnits.has(unit.id) && (
                                <div className="p-2 space-y-1 bg-white">
                                  {unit.subunits.map((subunit: BUPSubunit) => (
                                    <div
                                      key={subunit.id}
                                      className="flex items-start justify-between p-2 hover:bg-gray-50 rounded transition-colors group"
                                    >
                                      <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-900">
                                          {subunit.name}
                                          {isConnected(subunit.id) && (
                                            <span className="ml-2 text-xs text-green-600">✓</span>
                                          )}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {subunit.originalText}
                                        </p>
                                      </div>
                                      <div className="ml-2 flex gap-1 opacity-0 group-hover:opacity-100">
                                        <button
                                          onClick={() =>
                                            handleAddWithText(
                                              formatBUPSubunit(subunit, unit.name, module.name),
                                              createBUPSubunitConnection(subunit, unit, module)
                                            )
                                          }
                                          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={t("add_text_and_link")}
                                          disabled={isConnected(subunit.id)}
                                        >
                                          <FiPlus size={12} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleAddLinkOnly(
                                              createBUPSubunitConnection(subunit, unit, module)
                                            )
                                          }
                                          className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={t("link_only")}
                                          disabled={isConnected(subunit.id)}
                                        >
                                          <FiLink size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cambridge Curriculum Section */}
          {cambridgeData && (
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setCambridgeExpanded(!cambridgeExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {cambridgeExpanded ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
                  <span className="font-semibold text-gray-900">
                    🇬🇧 Cambridge Curriculum (Stage {cambridgeStage})
                  </span>
                </div>
              </button>

              {cambridgeExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-2">
                  {cambridgeData.strands.map((strand: CambridgeStrand) => (
                    <div
                      key={strand.id}
                      className="border border-gray-200 rounded-md overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 transition-colors">
                        <button
                          onClick={() => toggleStrand(strand.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {expandedStrands.has(strand.id) ? (
                            <FiChevronDown size={16} />
                          ) : (
                            <FiChevronRight size={16} />
                          )}
                          <span className="font-medium text-gray-900 text-sm">
                            {strand.name}
                            {isConnected(strand.id) && (
                              <span className="ml-2 text-xs text-green-600">✓</span>
                            )}
                          </span>
                        </button>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              handleAddWithText(
                                formatCambridgeStrand(strand),
                                createCambridgeStrandConnection(strand)
                              )
                            }
                            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t("add_text_and_link")}
                            disabled={isConnected(strand.id)}
                          >
                            <FiPlus size={12} />
                            {t("text")}
                          </button>
                          <button
                            onClick={() =>
                              handleAddLinkOnly(createCambridgeStrandConnection(strand))
                            }
                            className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t("link_only")}
                            disabled={isConnected(strand.id)}
                          >
                            <FiLink size={12} />
                            {t("link")}
                          </button>
                        </div>
                      </div>

                      {expandedStrands.has(strand.id) && (
                        <div className="p-2 space-y-2 bg-white">
                          {strand.substrands.map((substrand: CambridgeSubstrand) => (
                            <div
                              key={substrand.id}
                              className="border border-gray-200 rounded-md overflow-hidden"
                            >
                              <div className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <button
                                  onClick={() => toggleSubstrand(substrand.id)}
                                  className="flex items-center gap-2 flex-1 text-left"
                                >
                                  {expandedSubstrands.has(substrand.id) ? (
                                    <FiChevronDown size={14} />
                                  ) : (
                                    <FiChevronRight size={14} />
                                  )}
                                  <span className="text-gray-800 text-xs font-medium">
                                    {substrand.name}
                                    {isConnected(substrand.id) && (
                                      <span className="ml-2 text-xs text-green-600">✓</span>
                                    )}
                                  </span>
                                </button>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      handleAddWithText(
                                        formatCambridgeSubstrand(substrand, strand.name),
                                        createCambridgeSubstrandConnection(substrand, strand)
                                      )
                                    }
                                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t("add_text_and_link")}
                                    disabled={isConnected(substrand.id)}
                                  >
                                    <FiPlus size={12} />
                                    {t("text")}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAddLinkOnly(
                                        createCambridgeSubstrandConnection(substrand, strand)
                                      )
                                    }
                                    className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t("link_only")}
                                    disabled={isConnected(substrand.id)}
                                  >
                                    <FiLink size={12} />
                                    {t("link")}
                                  </button>
                                </div>
                              </div>

                              {expandedSubstrands.has(substrand.id) && (
                                <div className="p-2 space-y-1 bg-white">
                                  {substrand.objectives.map((objective: CambridgeObjective) => (
                                    <div
                                      key={objective.id}
                                      className="flex items-start justify-between p-2 hover:bg-gray-50 rounded transition-colors group"
                                    >
                                      <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-900">
                                          {objective.code}
                                          {isConnected(objective.id) && (
                                            <span className="ml-2 text-xs text-green-600">✓</span>
                                          )}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {objective.description}
                                        </p>
                                      </div>
                                      <div className="ml-2 flex gap-1 opacity-0 group-hover:opacity-100">
                                        <button
                                          onClick={() =>
                                            handleAddWithText(
                                              formatCambridgeObjective(
                                                objective,
                                                substrand.name,
                                                strand.name
                                              ),
                                              createCambridgeObjectiveConnection(
                                                objective,
                                                substrand,
                                                strand
                                              )
                                            )
                                          }
                                          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={t("add_text_and_link")}
                                          disabled={isConnected(objective.id)}
                                        >
                                          <FiPlus size={12} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleAddLinkOnly(
                                              createCambridgeObjectiveConnection(
                                                objective,
                                                substrand,
                                                strand
                                              )
                                            )
                                          }
                                          className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={t("link_only")}
                                          disabled={isConnected(objective.id)}
                                        >
                                          <FiLink size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cambridge Learner's Book Section */}
          {cambridgeBook && cambridgeBook.units.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setCambridgeBookExpanded(!cambridgeBookExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {cambridgeBookExpanded ? (
                    <FiChevronDown size={20} />
                  ) : (
                    <FiChevronRight size={20} />
                  )}
                  <FiBook size={18} className="text-indigo-600" />
                  <span className="font-semibold text-gray-900">
                    📖 Cambridge Learner&apos;s Book Stage {cambridgeStage}
                  </span>
                  <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    {cambridgeBook.units.length} Units
                  </span>
                </div>
              </button>

              {cambridgeBookExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-2">
                  {cambridgeBook.units
                    .filter((unit) => unit.unitNumber > 0) // Skip intro unit
                    .map((unit: BookUnit) => (
                      <div
                        key={unit.id}
                        className="border border-gray-200 rounded-md overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                          <button
                            onClick={() => toggleBookUnit(unit.id)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            {expandedBookUnits.has(unit.id) ? (
                              <FiChevronDown size={16} />
                            ) : (
                              <FiChevronRight size={16} />
                            )}
                            <span className="font-medium text-gray-900 text-sm">
                              Unit {unit.unitNumber}: {unit.title}
                              {isConnected(unit.id) && (
                                <span className="ml-2 text-xs text-green-600">✓</span>
                              )}
                            </span>
                            <span className="ml-auto text-xs text-gray-500 mr-2">
                              pp. {unit.pages}
                            </span>
                          </button>
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                handleAddWithText(
                                  formatBookUnit(unit),
                                  createBookUnitConnection(unit)
                                )
                              }
                              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              title={t("add_text_and_link")}
                              disabled={isConnected(unit.id)}
                            >
                              <FiPlus size={12} />
                              {t("text")}
                            </button>
                            <button
                              onClick={() => handleAddLinkOnly(createBookUnitConnection(unit))}
                              className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              title={t("link_only")}
                              disabled={isConnected(unit.id)}
                            >
                              <FiLink size={12} />
                              {t("link")}
                            </button>
                          </div>
                        </div>

                        {expandedBookUnits.has(unit.id) && unit.subsections.length > 0 && (
                          <div className="p-2 space-y-1 bg-white">
                            {unit.subsections.map((subsection: BookSubsection) => (
                              <div
                                key={subsection.id}
                                className="flex items-start justify-between p-2 hover:bg-gray-50 rounded transition-colors group"
                              >
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-900">
                                    {subsection.code} {subsection.title}
                                    {isConnected(subsection.id) && (
                                      <span className="ml-2 text-xs text-green-600">✓</span>
                                    )}
                                  </p>
                                </div>
                                <div className="ml-2 flex gap-1 opacity-0 group-hover:opacity-100">
                                  <button
                                    onClick={() =>
                                      handleAddWithText(
                                        formatBookSubsection(subsection, unit),
                                        createBookSubsectionConnection(subsection, unit)
                                      )
                                    }
                                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t("add_text_and_link")}
                                    disabled={isConnected(subsection.id)}
                                  >
                                    <FiPlus size={12} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAddLinkOnly(
                                        createBookSubsectionConnection(subsection, unit)
                                      )
                                    }
                                    className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t("link_only")}
                                    disabled={isConnected(subsection.id)}
                                  >
                                    <FiLink size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {!bupData && !cambridgeData && !cambridgeBook && (
            <div className="text-center py-8 text-gray-500">
              <p>{t("no_curriculum_data_available")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurriculumContentSelector;
