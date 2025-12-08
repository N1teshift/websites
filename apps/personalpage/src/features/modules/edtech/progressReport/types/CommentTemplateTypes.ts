export interface CommentTemplate {
  id: string;
  name: string;
  sections: {
    intro: string;
    context: string;
    assessment: string;
    achievement: string;
    weakIntro: string;
    weakEnding: string;
  };
  topicDescriptions: {
    section_1_1: string;
    section_1_2: string;
    section_1_3: string;
  };
  grammarRules: {
    singular: {
      topic: string;
      subtopic: string;
    };
    plural: {
      topic: string;
      subtopic: string;
    };
  };
}

export const DEFAULT_TEMPLATE: CommentTemplate = {
  id: "default-unit1",
  name: "Unit 1: Numbers and Calculations",
  sections: {
    intro: "Pažymys įrašytas už 1.1, 1.2, 1.3 potemių savarankiškus darbus.",
    context:
      '{Name} šiuose darbuose turėjo galimybę pademonstruoti ką mokėsi rugsėjo pirmosiomis savaitėmis temoje "Skaičiai ir skaičiavimai".',
    assessment:
      'Savarankiškuose darbuose buvo tikrinamos MYP A kriterijaus "žinios ir supratimas" kompetencijos.',
    achievement: "{Name} pasiekė {MYP_Level} lygį.",
    weakIntro: "{Name} turi pasimokyti",
    weakEnding:
      "nes {Subtopic_Word} žinias ir supratimą {Name_Kam} pademonstruoti sekėsi prasčiausiai.",
  },
  topicDescriptions: {
    section_1_1: "apie iracionaliuosius skaičius",
    section_1_2: "apie standartinę išraišką",
    section_1_3: "apie laipsnius",
  },
  grammarRules: {
    singular: {
      topic: "temą",
      subtopic: "tos potėmės",
    },
    plural: {
      topic: "temas",
      subtopic: "tų potemių",
    },
  },
};

// English template for Diagnostic TEST 1
export const ENGLISH_DIAGNOSTIC_1_TEMPLATE: CommentTemplate = {
  id: "english-diagnostic-1",
  name: "English Diagnostic TEST 1",
  sections: {
    intro: "Grade recorded for Diagnostic TEST 1.",
    context:
      "{Name} demonstrated reading and use of English skills ({Paper1_Percent}%), listening skills ({Paper2_Percent}%), and writing skills ({Paper3_Percent}%).",
    assessment:
      "The diagnostic test assessed overall English language proficiency across multiple skills.",
    achievement: "{Name} achieved {Total_Percent}% overall.",
    weakIntro: "{Name} should focus on improving",
    weakEnding: "as this area needs the most attention.",
  },
  topicDescriptions: {
    section_1_1: "reading and use of English",
    section_1_2: "listening",
    section_1_3: "writing",
  },
  grammarRules: {
    singular: {
      topic: "skill",
      subtopic: "this skill",
    },
    plural: {
      topic: "skills",
      subtopic: "these skills",
    },
  },
};

// English template for Unit 1 TEST
export const ENGLISH_UNIT_1_TEMPLATE: CommentTemplate = {
  id: "english-unit-1",
  name: "English Unit 1 TEST",
  sections: {
    intro: "Grade recorded for Unit 1 TEST.",
    context:
      "{Name} was assessed on listening ({Listening_Score}/{Listening_Max}), reading ({Reading_Score}/{Reading_Max}), vocabulary ({Vocabulary_Score}/{Vocabulary_Max}), and grammar ({Grammar_Score}/{Grammar_Max}).",
    assessment: "This unit test evaluated language skills and knowledge from Unit 1.",
    achievement: "{Name} achieved {Total_Percent}% overall (total: {Total_Score} points).",
    weakIntro: "{Name} should review",
    weakEnding: "to strengthen performance in this area.",
  },
  topicDescriptions: {
    section_1_1: "listening comprehension",
    section_1_2: "reading comprehension",
    section_1_3: "vocabulary and grammar",
  },
  grammarRules: {
    singular: {
      topic: "area",
      subtopic: "this area",
    },
    plural: {
      topic: "areas",
      subtopic: "these areas",
    },
  },
};

export const TEMPLATE_VARIABLE_DESCRIPTIONS: Record<string, string> = {
  "{Name}": "Student name (Kas? - Nominative)",
  "{Name_Ko}": "Student name (Ko? - Genitive)",
  "{Name_Ka}": "Student name (Ką? - Accusative)",
  "{Name_Kuo}": "Student name (Kuo? - Instrumental)",
  "{Name_Kam}": "Student name (Kam? - Dative)",
  "{Name_Kur}": "Student name (Kur? - Locative)",
  "{MYP_Level}": "Calculated MYP level (0-8)",
  "{Sections}": 'List of weak sections (e.g., "1.1, 1.2")',
  "{Topic_Word}": 'Topic word (singular/plural: "temą" or "temas")',
  "{Subtopic_Word}": 'Subtopic word (singular/plural: "tos potėmės" or "tų potemių")',
  "{Topic_Description}": 'Description of topics (e.g., "apie iracionaliuosius skaičius")',
  // English template variables
  "{Paper1_Percent}": "Diagnostic Paper 1 percentage",
  "{Paper2_Percent}": "Diagnostic Paper 2 percentage",
  "{Paper3_Percent}": "Diagnostic Paper 3 percentage",
  "{Total_Percent}": "Total percentage",
  "{Total_Score}": "Total score",
  "{Listening_Score}": "Listening score",
  "{Listening_Max}": "Listening max points",
  "{Reading_Score}": "Reading score",
  "{Reading_Max}": "Reading max points",
  "{Vocabulary_Score}": "Vocabulary score (combined)",
  "{Vocabulary_Max}": "Vocabulary max points (combined)",
  "{Grammar_Score}": "Grammar score (combined)",
  "{Grammar_Max}": "Grammar max points (combined)",
};
