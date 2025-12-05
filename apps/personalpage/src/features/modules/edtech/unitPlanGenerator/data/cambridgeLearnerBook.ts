// Cambridge Lower Secondary Mathematics Learner's Book Structure
// Organized by Stage (7, 8, 9) following the textbook unit organization

export interface BookSubsection {
    id: string;
    code: string; // e.g., "1.1", "2.3"
    title: string;
    objectiveIds?: string[]; // Links to curriculum objectives from curriculumCambridge.ts
}

export interface BookUnit {
    id: string;
    unitNumber: number;
    title: string;
    pages: string; // Page range, e.g., "9–20"
    strand: 'Number' | 'Algebra' | 'Geometry and measure' | 'Statistics and probability' | 'Project' | 'Other';
    subsections: BookSubsection[];
}

export interface BookModule {
    id: string;
    moduleNumber: number;
    name: string;
    description?: string;
    unitIds: string[]; // IDs of units in this module
}

export interface BookStage {
    stage: number; // 7, 8, 9
    grade: number; // Corresponding MYP grade: 6, 7, 8
    title: string;
    units: BookUnit[];
    modules: BookModule[];
}

// Stage 7 (MYP Grade 6) - Placeholder
export const STAGE_7_BOOK: BookStage = {
    stage: 7,
    grade: 6,
    title: 'Cambridge Lower Secondary Mathematics Stage 7',
    units: [], // To be filled later
    modules: []
};

// Stage 8 (MYP Grade 7) - Placeholder
export const STAGE_8_BOOK: BookStage = {
    stage: 8,
    grade: 7,
    title: 'Cambridge Lower Secondary Mathematics Stage 8',
    units: [], // To be filled later
    modules: []
};

// Stage 9 (MYP Grade 8) - Complete structure
export const STAGE_9_BOOK: BookStage = {
    stage: 9,
    grade: 8,
    title: 'Cambridge Lower Secondary Mathematics Stage 9',
    modules: [
        {
            id: 's9-mod1',
            moduleNumber: 1,
            name: 'Number and Algebra Foundations',
            description: 'Numbers, expressions, decimals and percentages',
            unitIds: ['s9-book-u1', 's9-book-u2', 's9-book-u3']
        },
        {
            id: 's9-mod2',
            moduleNumber: 2,
            name: 'Equations and Geometry',
            description: 'Solving equations and understanding angles',
            unitIds: ['s9-book-u4', 's9-book-u5']
        },
        {
            id: 's9-mod3',
            moduleNumber: 3,
            name: 'Statistics and Measurement',
            description: 'Data analysis, shapes and fractions',
            unitIds: ['s9-book-u6', 's9-book-u7', 's9-book-u8']
        },
        {
            id: 's9-mod4',
            moduleNumber: 4,
            name: 'Functions and Graphs',
            description: 'Sequences, functions and graphing',
            unitIds: ['s9-book-u9', 's9-book-u10']
        },
        {
            id: 's9-mod5',
            moduleNumber: 5,
            name: 'Ratio, Probability and Transformation',
            description: 'Proportional reasoning, probability and geometric transformations',
            unitIds: ['s9-book-u11', 's9-book-u12', 's9-book-u13']
        },
        {
            id: 's9-mod6',
            moduleNumber: 6,
            name: '3D Geometry and Data Interpretation',
            description: 'Volume, surface area and statistical analysis',
            unitIds: ['s9-book-u14', 's9-book-u15']
        }
    ],
    units: [
        {
            id: 's9-book-intro',
            unitNumber: 0,
            title: 'How to use this book',
            pages: '6–7',
            strand: 'Other',
            subsections: []
        },
        {
            id: 's9-book-ack',
            unitNumber: 0,
            title: 'Acknowledgements',
            pages: '8',
            strand: 'Other',
            subsections: []
        },
        {
            id: 's9-book-u1',
            unitNumber: 1,
            title: 'Number and calculation',
            pages: '9–20',
            strand: 'Number',
            subsections: [
                {
                    id: 's9-book-u1-s1',
                    code: '1.1',
                    title: 'Irrational numbers',
                    objectiveIds: ['s9-9Ni.01', 's9-9Ni.04']
                },
                {
                    id: 's9-book-u1-s2',
                    code: '1.2',
                    title: 'Standard form',
                    objectiveIds: ['s9-9Ni.03']
                },
                {
                    id: 's9-book-u1-s3',
                    code: '1.3',
                    title: 'Indices',
                    objectiveIds: ['s9-9Ni.02']
                }
            ]
        },
        {
            id: 's9-book-u2',
            unitNumber: 2,
            title: 'Expressions and formulae',
            pages: '21–54',
            strand: 'Algebra',
            subsections: [
                {
                    id: 's9-book-u2-s1',
                    code: '2.1',
                    title: 'Substituting into expressions',
                    objectiveIds: ['s9-9Ae.01']
                },
                {
                    id: 's9-book-u2-s2',
                    code: '2.2',
                    title: 'Constructing expressions',
                    objectiveIds: ['s9-9Ae.03']
                },
                {
                    id: 's9-book-u2-s3',
                    code: '2.3',
                    title: 'Expressions and indices',
                    objectiveIds: ['s9-9Ae.01', 's9-9Ae.02']
                },
                {
                    id: 's9-book-u2-s4',
                    code: '2.4',
                    title: 'Expanding the product of two linear expressions',
                    objectiveIds: ['s9-9Ae.02']
                },
                {
                    id: 's9-book-u2-s5',
                    code: '2.5',
                    title: 'Simplifying algebraic fractions',
                    objectiveIds: ['s9-9Ae.02']
                },
                {
                    id: 's9-book-u2-s6',
                    code: '2.6',
                    title: 'Deriving and using formulae',
                    objectiveIds: ['s9-9Ae.04']
                }
            ]
        },
        {
            id: 's9-book-u3',
            unitNumber: 3,
            title: 'Decimals, percentages and rounding',
            pages: '55–81',
            strand: 'Number',
            subsections: [
                {
                    id: 's9-book-u3-s1',
                    code: '3.1',
                    title: 'Multiplying and dividing by powers of 10',
                    objectiveIds: ['s9-9Np.01']
                },
                {
                    id: 's9-book-u3-s2',
                    code: '3.2',
                    title: 'Multiplying and dividing decimals',
                    objectiveIds: ['s9-9Nf.06']
                },
                {
                    id: 's9-book-u3-s3',
                    code: '3.3',
                    title: 'Understanding compound percentages',
                    objectiveIds: ['s9-9Nf.05']
                },
                {
                    id: 's9-book-u3-s4',
                    code: '3.4',
                    title: 'Understanding upper and lower bounds',
                    objectiveIds: ['s9-9Np.02']
                }
            ]
        },
        {
            id: 's9-book-p1',
            unitNumber: 0,
            title: 'Project 1: Cutting tablecloths',
            pages: '82',
            strand: 'Project',
            subsections: []
        },
        {
            id: 's9-book-u4',
            unitNumber: 4,
            title: 'Equations and inequalities',
            pages: '83–102',
            strand: 'Algebra',
            subsections: [
                {
                    id: 's9-book-u4-s1',
                    code: '4.1',
                    title: 'Constructing and solving equations',
                    objectiveIds: ['s9-9Ae.05']
                },
                {
                    id: 's9-book-u4-s2',
                    code: '4.2',
                    title: 'Simultaneous equations',
                    objectiveIds: ['s9-9Ae.06']
                },
                {
                    id: 's9-book-u4-s3',
                    code: '4.3',
                    title: 'Inequalities',
                    objectiveIds: ['s9-9Ae.07']
                }
            ]
        },
        {
            id: 's9-book-u5',
            unitNumber: 5,
            title: 'Angles',
            pages: '103–126',
            strand: 'Geometry and measure',
            subsections: [
                {
                    id: 's9-book-u5-s1',
                    code: '5.1',
                    title: 'Calculating angles',
                    objectiveIds: ['s9-9Gg.09']
                },
                {
                    id: 's9-book-u5-s2',
                    code: '5.2',
                    title: 'Interior angles of polygons',
                    objectiveIds: ['s9-9Gg.07']
                },
                {
                    id: 's9-book-u5-s3',
                    code: '5.3',
                    title: 'Exterior angles of polygons',
                    objectiveIds: ['s9-9Gg.08']
                },
                {
                    id: 's9-book-u5-s4',
                    code: '5.4',
                    title: 'Constructions',
                    objectiveIds: ['s9-9Gg.11']
                },
                {
                    id: 's9-book-u5-s5',
                    code: '5.5',
                    title: 'Pythagoras\' theorem',
                    objectiveIds: ['s9-9Gg.10']
                }
            ]
        },
        {
            id: 's9-book-p2',
            unitNumber: 0,
            title: 'Project 2: Angle tangle',
            pages: '127',
            strand: 'Project',
            subsections: []
        },
        {
            id: 's9-book-u6',
            unitNumber: 6,
            title: 'Statistical investigations',
            pages: '128–137',
            strand: 'Statistics and probability',
            subsections: [
                {
                    id: 's9-book-u6-s1',
                    code: '6.1',
                    title: 'Data collection and sampling',
                    objectiveIds: ['s9-9Ss.01']
                },
                {
                    id: 's9-book-u6-s2',
                    code: '6.2',
                    title: 'Bias',
                    objectiveIds: ['s9-9Ss.02']
                }
            ]
        },
        {
            id: 's9-book-u7',
            unitNumber: 7,
            title: 'Shapes and measurements',
            pages: '138–160',
            strand: 'Geometry and measure',
            subsections: [
                {
                    id: 's9-book-u7-s1',
                    code: '7.1',
                    title: 'Circumference and area of a circle',
                    objectiveIds: ['s9-9Gg.01']
                },
                {
                    id: 's9-book-u7-s2',
                    code: '7.2',
                    title: 'Areas of compound shapes',
                    objectiveIds: ['s9-9Gg.03']
                },
                {
                    id: 's9-book-u7-s3',
                    code: '7.3',
                    title: 'Large and small units',
                    objectiveIds: ['s9-9Gg.02']
                }
            ]
        },
        {
            id: 's9-book-u8',
            unitNumber: 8,
            title: 'Fractions',
            pages: '161–189',
            strand: 'Number',
            subsections: [
                {
                    id: 's9-book-u8-s1',
                    code: '8.1',
                    title: 'Fractions and recurring decimals',
                    objectiveIds: ['s9-9Nf.01']
                },
                {
                    id: 's9-book-u8-s2',
                    code: '8.2',
                    title: 'Fractions and the correct order of operations',
                    objectiveIds: ['s9-9Nf.02', 's9-9Nf.04']
                },
                {
                    id: 's9-book-u8-s3',
                    code: '8.3',
                    title: 'Multiplying fractions',
                    objectiveIds: ['s9-9Nf.03']
                },
                {
                    id: 's9-book-u8-s4',
                    code: '8.4',
                    title: 'Dividing fractions',
                    objectiveIds: ['s9-9Nf.03']
                },
                {
                    id: 's9-book-u8-s5',
                    code: '8.5',
                    title: 'Making calculations easier',
                    objectiveIds: ['s9-9Nf.04']
                }
            ]
        },
        {
            id: 's9-book-p3',
            unitNumber: 0,
            title: 'Project 3: Selling apples',
            pages: '190',
            strand: 'Project',
            subsections: []
        },
        {
            id: 's9-book-u9',
            unitNumber: 9,
            title: 'Sequences and functions',
            pages: '191–211',
            strand: 'Algebra',
            subsections: [
                {
                    id: 's9-book-u9-s1',
                    code: '9.1',
                    title: 'Generating sequences',
                    objectiveIds: ['s9-9As.01']
                },
                {
                    id: 's9-book-u9-s2',
                    code: '9.2',
                    title: 'Using the nth term',
                    objectiveIds: ['s9-9As.02']
                },
                {
                    id: 's9-book-u9-s3',
                    code: '9.3',
                    title: 'Representing functions',
                    objectiveIds: ['s9-9As.03']
                }
            ]
        },
        {
            id: 's9-book-u10',
            unitNumber: 10,
            title: 'Graphs',
            pages: '212–233',
            strand: 'Algebra',
            subsections: [
                {
                    id: 's9-book-u10-s1',
                    code: '10.1',
                    title: 'Functions',
                    objectiveIds: ['s9-9As.03', 's9-9As.04']
                },
                {
                    id: 's9-book-u10-s2',
                    code: '10.2',
                    title: 'Plotting graphs',
                    objectiveIds: ['s9-9As.05']
                },
                {
                    id: 's9-book-u10-s3',
                    code: '10.3',
                    title: 'Gradient and intercept',
                    objectiveIds: ['s9-9As.06']
                },
                {
                    id: 's9-book-u10-s4',
                    code: '10.4',
                    title: 'Interpreting graphs',
                    objectiveIds: ['s9-9As.07']
                }
            ]
        },
        {
            id: 's9-book-p4',
            unitNumber: 0,
            title: 'Project 4: Cinema membership',
            pages: '234',
            strand: 'Project',
            subsections: []
        },
        {
            id: 's9-book-u11',
            unitNumber: 11,
            title: 'Ratio and proportion',
            pages: '235–249',
            strand: 'Number',
            subsections: [
                {
                    id: 's9-book-u11-s1',
                    code: '11.1',
                    title: 'Using ratios',
                    objectiveIds: ['s9-9Nf.08']
                },
                {
                    id: 's9-book-u11-s2',
                    code: '11.2',
                    title: 'Direct and inverse proportion',
                    objectiveIds: ['s9-9Nf.07']
                }
            ]
        },
        {
            id: 's9-book-u12',
            unitNumber: 12,
            title: 'Probability',
            pages: '250–269',
            strand: 'Statistics and probability',
            subsections: [
                {
                    id: 's9-book-u12-s1',
                    code: '12.1',
                    title: 'Mutually exclusive events',
                    objectiveIds: ['s9-9Sp.01']
                },
                {
                    id: 's9-book-u12-s2',
                    code: '12.2',
                    title: 'Independent events',
                    objectiveIds: ['s9-9Sp.02']
                },
                {
                    id: 's9-book-u12-s3',
                    code: '12.3',
                    title: 'Combined events',
                    objectiveIds: ['s9-9Sp.03']
                },
                {
                    id: 's9-book-u12-s4',
                    code: '12.4',
                    title: 'Chance experiments',
                    objectiveIds: ['s9-9Sp.04']
                }
            ]
        },
        {
            id: 's9-book-u13',
            unitNumber: 13,
            title: 'Position and transformation',
            pages: '270–299',
            strand: 'Geometry and measure',
            subsections: [
                {
                    id: 's9-book-u13-s1',
                    code: '13.1',
                    title: 'Bearings and scale drawings',
                    objectiveIds: ['s9-9Gp.01']
                },
                {
                    id: 's9-book-u13-s2',
                    code: '13.2',
                    title: 'Points on a line segment',
                    objectiveIds: ['s9-9Gp.02']
                },
                {
                    id: 's9-book-u13-s3',
                    code: '13.3',
                    title: 'Transformations',
                    objectiveIds: ['s9-9Gp.03', 's9-9Gp.04', 's9-9Gp.05']
                },
                {
                    id: 's9-book-u13-s4',
                    code: '13.4',
                    title: 'Enlarging shapes',
                    objectiveIds: ['s9-9Gp.06', 's9-9Gp.07']
                }
            ]
        },
        {
            id: 's9-book-p5',
            unitNumber: 0,
            title: 'Project 5: Triangle transformations',
            pages: '300',
            strand: 'Project',
            subsections: []
        },
        {
            id: 's9-book-u14',
            unitNumber: 14,
            title: 'Volume, surface area and symmetry',
            pages: '301–316',
            strand: 'Geometry and measure',
            subsections: [
                {
                    id: 's9-book-u14-s1',
                    code: '14.1',
                    title: 'Calculating the volume of prisms',
                    objectiveIds: ['s9-9Gg.04']
                },
                {
                    id: 's9-book-u14-s2',
                    code: '14.2',
                    title: 'Calculating the surface area of triangular prisms, pyramids and cylinders',
                    objectiveIds: ['s9-9Gg.05']
                },
                {
                    id: 's9-book-u14-s3',
                    code: '14.3',
                    title: 'Symmetry in three-dimensional shapes',
                    objectiveIds: ['s9-9Gg.06']
                }
            ]
        },
        {
            id: 's9-book-u15',
            unitNumber: 15,
            title: 'Interpreting and discussing results',
            pages: '317–347',
            strand: 'Statistics and probability',
            subsections: [
                {
                    id: 's9-book-u15-s1',
                    code: '15.1',
                    title: 'Interpreting and drawing frequency polygons',
                    objectiveIds: ['s9-9Ss.03']
                },
                {
                    id: 's9-book-u15-s2',
                    code: '15.2',
                    title: 'Scatter graphs',
                    objectiveIds: ['s9-9Ss.03']
                },
                {
                    id: 's9-book-u15-s3',
                    code: '15.3',
                    title: 'Back-to-back stem-and-leaf diagrams',
                    objectiveIds: ['s9-9Ss.03']
                },
                {
                    id: 's9-book-u15-s4',
                    code: '15.4',
                    title: 'Calculating statistics for grouped data',
                    objectiveIds: ['s9-9Ss.04']
                },
                {
                    id: 's9-book-u15-s5',
                    code: '15.5',
                    title: 'Representing data',
                    objectiveIds: ['s9-9Ss.03', 's9-9Ss.05']
                }
            ]
        }
    ]
};

// Main export array
export const CAMBRIDGE_LEARNER_BOOKS: BookStage[] = [
    STAGE_7_BOOK,
    STAGE_8_BOOK,
    STAGE_9_BOOK
];

// Helper functions
export function getBookByStage(stage: number): BookStage | undefined {
    return CAMBRIDGE_LEARNER_BOOKS.find(book => book.stage === stage);
}

export function getBookByGrade(grade: number): BookStage | undefined {
    return CAMBRIDGE_LEARNER_BOOKS.find(book => book.grade === grade);
}

export function getUnitsByStrand(stage: number, strand: string): BookUnit[] {
    const book = getBookByStage(stage);
    if (!book) return [];
    return book.units.filter(unit => unit.strand === strand);
}




