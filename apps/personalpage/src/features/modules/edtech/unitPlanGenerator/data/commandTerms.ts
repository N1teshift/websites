export interface CommandTerm {
    id: string;
    name: string;
    definition: string;
}

// Base command terms with English defaults
export const MATHEMATICS_COMMAND_TERMS: CommandTerm[] = [
    {
        id: 'annotate',
        name: 'Annotate',
        definition: 'Add brief notes to a diagram or graph.'
    },
    {
        id: 'apply',
        name: 'Apply',
        definition: 'Use knowledge and understanding in response to a given situation or real circumstances. Use an idea, equation, principle, theory or law in relation to a given problem or issue.'
    },
    {
        id: 'calculate',
        name: 'Calculate',
        definition: 'Obtain a numerical answer showing the relevant stages in the working.'
    },
    {
        id: 'comment',
        name: 'Comment',
        definition: 'Give a judgment based on a given statement or result of a calculation.'
    },
    {
        id: 'construct',
        name: 'Construct',
        definition: 'Display information in a diagrammatic or logical form.'
    },
    {
        id: 'demonstrate',
        name: 'Demonstrate',
        definition: 'Make clear by reasoning or evidence, illustrating with examples or practical application.'
    },
    {
        id: 'derive',
        name: 'Derive',
        definition: 'Manipulate a mathematical relationship to give a new equation or relationship.'
    },
    {
        id: 'describe',
        name: 'Describe',
        definition: 'Give a detailed account or picture of a situation, event, pattern or process.'
    },
    {
        id: 'discuss',
        name: 'Discuss',
        definition: 'Offer a considered and balanced review that includes a range of arguments, factors or hypotheses. Opinions or conclusions should be presented clearly and supported by appropriate evidence.'
    },
    {
        id: 'draw',
        name: 'Draw',
        definition: 'Represent by means of a labelled, accurate diagram or graph, using a pencil. A ruler (straight edge) should be used for straight lines. Diagrams should be drawn to scale. Graphs should have points correctly plotted (if appropriate) and joined in a straight line or smooth curve.'
    },
    {
        id: 'estimate',
        name: 'Estimate',
        definition: 'Obtain an approximate value for an unknown quantity.'
    },
    {
        id: 'explain',
        name: 'Explain',
        definition: 'Give a detailed account including reasons or causes.'
    },
    {
        id: 'identify',
        name: 'Identify',
        definition: 'Provide an answer from a number of possibilities. Recognize and state briefly a distinguishing fact or feature.'
    },
    {
        id: 'justify',
        name: 'Justify',
        definition: 'Give valid reasons or evidence to support an answer or conclusion.'
    },
    {
        id: 'label',
        name: 'Label',
        definition: 'Add title, labels or brief explanation(s) to a diagram or graph.'
    },
    {
        id: 'measure',
        name: 'Measure',
        definition: 'Obtain a value for a quantity.'
    },
    {
        id: 'organize',
        name: 'Organize',
        definition: 'Put ideas and information into a proper or systematic order.'
    },
    {
        id: 'plot',
        name: 'Plot',
        definition: 'Mark the position of points on a diagram.'
    },
    {
        id: 'predict',
        name: 'Predict',
        definition: 'Give an expected result of an upcoming action or event.'
    },
    {
        id: 'prove',
        name: 'Prove',
        definition: 'Use a sequence of logical steps to obtain the required result in a formal way.'
    },
    {
        id: 'select',
        name: 'Select',
        definition: 'Choose from a list or group.'
    },
    {
        id: 'show',
        name: 'Show',
        definition: 'Give the steps in a calculation or derivation.'
    },
    {
        id: 'sketch',
        name: 'Sketch',
        definition: 'Represent by means of a diagram or graph (labelled as appropriate). The sketch should give a general idea of the required shape or relationship and should include relevant features.'
    },
    {
        id: 'solve',
        name: 'Solve',
        definition: 'Obtain the answer(s) using algebraic and/or numerical and/or graphical methods.'
    },
    {
        id: 'state',
        name: 'State',
        definition: 'Give a specific name, value or other brief answer without explanation or calculation.'
    },
    {
        id: 'suggest',
        name: 'Suggest',
        definition: 'Propose a solution, hypothesis or other possible answer.'
    },
    {
        id: 'trace',
        name: 'Trace',
        definition: 'Follow and record the action of an algorithm.'
    },
    {
        id: 'use',
        name: 'Use',
        definition: 'Apply knowledge or rules to put theory into practice.'
    },
    {
        id: 'verify',
        name: 'Verify',
        definition: 'Provide evidence that validates the result.'
    },
    {
        id: 'write-down',
        name: 'Write down',
        definition: 'Obtain the answer(s), usually by extracting information. Little or no calculation is required. Working does not need to be shown.'
    }
];

// Function to get localized command terms
export const getLocalizedCommandTerms = (t: (key: string) => string): CommandTerm[] => {
    return MATHEMATICS_COMMAND_TERMS.map(term => ({
        id: term.id,
        name: t(`command_terms.${term.id}`) || term.name,
        definition: t(`command_terms_definitions.${term.id}`) || term.definition
    }));
};

// For future expansion when other subjects' command terms are available
export const getCommandTermsBySubject = (subjectId: string, t?: (key: string) => string): CommandTerm[] => {
    switch (subjectId) {
        case 'mathematics':
            return t ? getLocalizedCommandTerms(t) : MATHEMATICS_COMMAND_TERMS;
        default:
            return []; // Return empty array for subjects without defined command terms
    }
};

export const getCommandTermById = (id: string): CommandTerm | undefined => {
    return MATHEMATICS_COMMAND_TERMS.find(term => term.id === id);
};



