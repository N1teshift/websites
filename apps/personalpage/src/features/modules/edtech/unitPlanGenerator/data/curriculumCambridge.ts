// Cambridge Lower Secondary Mathematics Curriculum - Stages 7-9 (Grades 6-8)

export interface CambridgeObjective {
  id: string; // e.g., "7Ni.01"
  code: string; // e.g., "7Ni.01"
  description: string;
}

export interface CambridgeSubstrand {
  id: string;
  name: string;
  objectives: CambridgeObjective[];
}

export interface CambridgeStrand {
  id: string;
  name: string;
  substrands: CambridgeSubstrand[];
}

export interface CambridgeStage {
  stage: number; // 7, 8, 9
  grade: number; // 6, 7, 8 (for our mapping)
  strands: CambridgeStrand[];
}

export const CAMBRIDGE_CURRICULUM: CambridgeStage[] = [
  // ===== STAGE 7 (Grade 6) =====
  {
    stage: 7,
    grade: 6,
    strands: [
      {
        id: "s7-twm",
        name: "Thinking and Working Mathematically",
        substrands: [
          {
            id: "s7-twm-core",
            name: "Thinking and Working Mathematically",
            objectives: [
              { id: "s7-TWM.01", code: "TWM.01", description: "Specialising" },
              { id: "s7-TWM.02", code: "TWM.02", description: "Generalising" },
              { id: "s7-TWM.03", code: "TWM.03", description: "Conjecturing" },
              { id: "s7-TWM.04", code: "TWM.04", description: "Convincing" },
              { id: "s7-TWM.05", code: "TWM.05", description: "Characterising" },
              { id: "s7-TWM.06", code: "TWM.06", description: "Classifying" },
              { id: "s7-TWM.07", code: "TWM.07", description: "Critiquing" },
              { id: "s7-TWM.08", code: "TWM.08", description: "Improving" },
            ],
          },
        ],
      },
      {
        id: "s7-number",
        name: "Number",
        substrands: [
          {
            id: "s7-ni",
            name: "Integers, powers and roots",
            objectives: [
              {
                id: "s7-7Ni.01",
                code: "7Ni.01",
                description: "Estimate, add and subtract integers, recognising generalisations.",
              },
              {
                id: "s7-7Ni.02",
                code: "7Ni.02",
                description:
                  "Understand that brackets, positive indices and operations follow a particular order.",
              },
              {
                id: "s7-7Ni.03",
                code: "7Ni.03",
                description:
                  "Estimate, multiply and divide integers including where one integer is negative.",
              },
              {
                id: "s7-7Ni.04",
                code: "7Ni.04",
                description:
                  "Understand lowest common multiple and highest common factor (numbers less than 100).",
              },
              {
                id: "s7-7Ni.05",
                code: "7Ni.05",
                description:
                  "Use knowledge of tests of divisibility to find factors of numbers greater than 100.",
              },
              {
                id: "s7-7Ni.06",
                code: "7Ni.06",
                description:
                  "Understand the relationship between squares and corresponding square roots, and cubes and corresponding cube roots.",
              },
            ],
          },
          {
            id: "s7-np",
            name: "Place value, ordering and rounding",
            objectives: [
              {
                id: "s7-7Np.01",
                code: "7Np.01",
                description:
                  "Use knowledge of place value to multiply and divide whole numbers and decimals by any positive power of 10.",
              },
              {
                id: "s7-7Np.02",
                code: "7Np.02",
                description: "Round numbers to a given number of decimal places.",
              },
            ],
          },
          {
            id: "s7-nf",
            name: "Fractions, decimals, percentages, ratio and proportion",
            objectives: [
              {
                id: "s7-7Nf.01",
                code: "7Nf.01",
                description:
                  "Recognise that fractions, terminating decimals and percentages have equivalent values.",
              },
              {
                id: "s7-7Nf.02",
                code: "7Nf.02",
                description:
                  "Estimate and add mixed numbers, and write the answer as a mixed number in its simplest form.",
              },
              {
                id: "s7-7Nf.03",
                code: "7Nf.03",
                description: "Estimate, multiply and divide proper fractions.",
              },
              {
                id: "s7-7Nf.04",
                code: "7Nf.04",
                description:
                  "Use knowledge of common factors, laws of arithmetic and order of operations to simplify calculations containing decimals or fractions.",
              },
              {
                id: "s7-7Nf.05",
                code: "7Nf.05",
                description:
                  "Recognise percentages of shapes and whole numbers, including percentages less than 1 or greater than 100.",
              },
              {
                id: "s7-7Nf.06",
                code: "7Nf.06",
                description:
                  "Understand the relative size of quantities to compare and order decimals and fractions, using the symbols =, ≠, > and <.",
              },
              {
                id: "s7-7Nf.07",
                code: "7Nf.07",
                description:
                  "Estimate, add and subtract positive and negative numbers with the same or different number of decimal places.",
              },
              {
                id: "s7-7Nf.08",
                code: "7Nf.08",
                description: "Estimate, multiply and divide decimals by whole numbers.",
              },
              {
                id: "s7-7Nf.09",
                code: "7Nf.09",
                description:
                  "Understand and use the unitary method to solve problems involving ratio and direct proportion in a range of contexts.",
              },
              {
                id: "s7-7Nf.10",
                code: "7Nf.10",
                description:
                  "Use knowledge of equivalence to simplify and compare ratios (same units).",
              },
              {
                id: "s7-7Nf.11",
                code: "7Nf.11",
                description:
                  "Understand how ratios are used to compare quantities to divide an amount into a given ratio with two parts.",
              },
            ],
          },
        ],
      },
      {
        id: "s7-algebra",
        name: "Algebra",
        substrands: [
          {
            id: "s7-ae",
            name: "Expressions, equations and formulae",
            objectives: [
              {
                id: "s7-7Ae.01",
                code: "7Ae.01",
                description:
                  "Understand that letters can be used to represent unknown numbers, variables or constants.",
              },
              {
                id: "s7-7Ae.02",
                code: "7Ae.02",
                description:
                  "Understand that the laws of arithmetic and order of operations apply to algebraic terms and expressions (four operations).",
              },
              {
                id: "s7-7Ae.03",
                code: "7Ae.03",
                description:
                  "Understand how to manipulate algebraic expressions including: collecting like terms and applying the distributive law with a constant.",
              },
              {
                id: "s7-7Ae.04",
                code: "7Ae.04",
                description:
                  "Understand that a situation can be represented either in words or as an algebraic expression, and move between the two representations (linear with integer coefficients).",
              },
              {
                id: "s7-7Ae.05",
                code: "7Ae.05",
                description:
                  "Understand that a situation can be represented either in words or as a formula (single operation), and move between the two representations.",
              },
              {
                id: "s7-7Ae.06",
                code: "7Ae.06",
                description:
                  "Understand that a situation can be represented either in words or as an equation. Move between the two representations and solve the equation (integer coefficients, unknown on one side).",
              },
              {
                id: "s7-7Ae.07",
                code: "7Ae.07",
                description: "Understand that letters can represent an open interval (one term).",
              },
            ],
          },
          {
            id: "s7-as",
            name: "Sequences, functions and graphs",
            objectives: [
              {
                id: "s7-7As.01",
                code: "7As.01",
                description:
                  "Understand term-to-term rules, and generate sequences from numerical and spatial patterns (linear and integers).",
              },
              {
                id: "s7-7As.02",
                code: "7As.02",
                description:
                  "Understand and describe nth term rules algebraically (in the form n ± a, a × n where a is a whole number).",
              },
              {
                id: "s7-7As.03",
                code: "7As.03",
                description:
                  "Understand that a function is a relationship where each input has a single output. Generate outputs from a given function and identify inputs from a given output by considering inverse operations (linear and integers).",
              },
              {
                id: "s7-7As.04",
                code: "7As.04",
                description:
                  "Understand that a situation can be represented either in words or as a linear function in two variables (of the form y = x + c or y = mx), and move between the two representations.",
              },
              {
                id: "s7-7As.05",
                code: "7As.05",
                description:
                  "Use knowledge of coordinate pairs to construct tables of values and plot the graphs of linear functions, where y is given explicitly in terms of x (y = x + c or y = mx).",
              },
              {
                id: "s7-7As.06",
                code: "7As.06",
                description: "Recognise straight-line graphs parallel to the x- or y-axis.",
              },
              {
                id: "s7-7As.07",
                code: "7As.07",
                description:
                  "Read and interpret graphs related to rates of change. Explain why they have a specific shape.",
              },
            ],
          },
        ],
      },
      {
        id: "s7-geometry",
        name: "Geometry and Measure",
        substrands: [
          {
            id: "s7-gg",
            name: "Geometrical reasoning, shapes and measurements",
            objectives: [
              {
                id: "s7-7Gg.01",
                code: "7Gg.01",
                description:
                  "Identify, describe and sketch regular polygons, including reference to sides, angles and symmetrical properties.",
              },
              {
                id: "s7-7Gg.02",
                code: "7Gg.02",
                description:
                  "Understand that if two 2D shapes are congruent, corresponding sides and angles are equal.",
              },
              {
                id: "s7-7Gg.03",
                code: "7Gg.03",
                description:
                  "Know the parts of a circle: centre, radius, diameter, circumference, chord, tangent.",
              },
              {
                id: "s7-7Gg.04",
                code: "7Gg.04",
                description:
                  "Understand the relationships and convert between metric units of area, including hectares (ha), square metres (m²), square centimetres (cm²) and square millimetres (mm²).",
              },
              {
                id: "s7-7Gg.05",
                code: "7Gg.05",
                description:
                  "Derive and know the formula for the area of a triangle. Use the formula to calculate the area of triangles and compound shapes made from rectangles and triangles.",
              },
              {
                id: "s7-7Gg.06",
                code: "7Gg.06",
                description:
                  "Identify and describe the combination of properties that determine a specific 3D shape.",
              },
              {
                id: "s7-7Gg.07",
                code: "7Gg.07",
                description:
                  "Derive and use a formula for the volume of a cube or cuboid. Use the formula to calculate the volume of compound shapes made from cuboids, in cubic metres (m³), cubic centimetres (cm³) and cubic millimetres (mm³).",
              },
              {
                id: "s7-7Gg.08",
                code: "7Gg.08",
                description: "Visualise and represent front, side and top view of 3D shapes.",
              },
              {
                id: "s7-7Gg.09",
                code: "7Gg.09",
                description:
                  "Use knowledge of area, and properties of cubes and cuboids to calculate their surface area.",
              },
              {
                id: "s7-7Gg.10",
                code: "7Gg.10",
                description:
                  "Identify reflective symmetry and order of rotational symmetry of 2D shapes and patterns.",
              },
              {
                id: "s7-7Gg.11",
                code: "7Gg.11",
                description:
                  "Derive the property that the sum of the angles in a quadrilateral is 360°, and use this to calculate missing angles.",
              },
              {
                id: "s7-7Gg.12",
                code: "7Gg.12",
                description:
                  "Know that the sum of the angles around a point is 360º, and use this to calculate missing angles.",
              },
              {
                id: "s7-7Gg.13",
                code: "7Gg.13",
                description:
                  "Recognise the properties of angles on: parallel lines and transversals, perpendicular lines, intersecting lines.",
              },
              {
                id: "s7-7Gg.14",
                code: "7Gg.14",
                description: "Draw parallel and perpendicular lines, and quadrilaterals.",
              },
            ],
          },
          {
            id: "s7-gp",
            name: "Position and transformation",
            objectives: [
              {
                id: "s7-7Gp.01",
                code: "7Gp.01",
                description: "Use knowledge of scaling to interpret maps and plans.",
              },
              {
                id: "s7-7Gp.02",
                code: "7Gp.02",
                description:
                  "Use knowledge of 2D shapes and coordinates to find the distance between two coordinates that have the same x or y coordinate (without the aid of a grid).",
              },
              {
                id: "s7-7Gp.03",
                code: "7Gp.03",
                description:
                  "Use knowledge of translation of 2D shapes to identify the corresponding points between the original and the translated image, without the use of a grid.",
              },
              {
                id: "s7-7Gp.04",
                code: "7Gp.04",
                description:
                  "Reflect 2D shapes on coordinate grids, in a given mirror line (x- or y-axis), recognising that the image is congruent to the object after a reflection.",
              },
              {
                id: "s7-7Gp.05",
                code: "7Gp.05",
                description:
                  "Rotate shapes 90° and 180° around a centre of rotation, recognising that the image is congruent to the object after a rotation.",
              },
              {
                id: "s7-7Gp.06",
                code: "7Gp.06",
                description:
                  "Understand that the image is mathematically similar to the object after enlargement. Use positive integer scale factors to perform and identify enlargements.",
              },
            ],
          },
        ],
      },
      {
        id: "s7-statistics",
        name: "Statistics and Probability",
        substrands: [
          {
            id: "s7-ss",
            name: "Statistics",
            objectives: [
              {
                id: "s7-7Ss.01",
                code: "7Ss.01",
                description:
                  "Select and trial data collection and sampling methods to investigate predictions for a set of related statistical questions, considering what data to collect (categorical, discrete and continuous data).",
              },
              {
                id: "s7-7Ss.02",
                code: "7Ss.02",
                description:
                  "Understand the effect of sample size on data collection and analysis.",
              },
              {
                id: "s7-7Ss.03",
                code: "7Ss.03",
                description:
                  "Record, organise and represent categorical, discrete and continuous data. Choose and explain which representation to use in a given situation: Venn and Carroll diagrams; tally charts, frequency tables and two-way tables; dual and compound bar charts; waffle diagrams and pie charts; frequency diagrams for continuous data; line graphs; scatter graphs; infographics.",
              },
              {
                id: "s7-7Ss.04",
                code: "7Ss.04",
                description:
                  "Use knowledge of mode, median, mean and range to describe and summarise large data sets. Choose and explain which one is the most appropriate for the context.",
              },
              {
                id: "s7-7Ss.05",
                code: "7Ss.05",
                description:
                  "Interpret data, identifying patterns, within and between data sets, to answer statistical questions. Discuss conclusions, considering the sources of variation, including sampling, and check predictions.",
              },
            ],
          },
          {
            id: "s7-sp",
            name: "Probability",
            objectives: [
              {
                id: "s7-7Sp.01",
                code: "7Sp.01",
                description:
                  "Use the language associated with probability and proportion to describe, compare, order and interpret the likelihood of outcomes.",
              },
              {
                id: "s7-7Sp.02",
                code: "7Sp.02",
                description:
                  "Understand and explain that probabilities range from 0 to 1, and can be represented as proper fractions, decimals and percentages.",
              },
              {
                id: "s7-7Sp.03",
                code: "7Sp.03",
                description:
                  "Identify all the possible mutually exclusive outcomes of a single event, and recognise when they are equally likely to happen.",
              },
              {
                id: "s7-7Sp.04",
                code: "7Sp.04",
                description:
                  "Understand how to find the theoretical probabilities of equally likely outcomes.",
              },
              {
                id: "s7-7Sp.05",
                code: "7Sp.05",
                description:
                  "Design and conduct chance experiments or simulations, using small and large numbers of trials. Analyse the frequency of outcomes to calculate experimental probabilities.",
              },
            ],
          },
        ],
      },
    ],
  },
  // ===== STAGE 8 (Grade 7) =====
  {
    stage: 8,
    grade: 7,
    strands: [
      {
        id: "s8-twm",
        name: "Thinking and Working Mathematically",
        substrands: [
          {
            id: "s8-twm-core",
            name: "Thinking and Working Mathematically",
            objectives: [
              { id: "s8-TWM.01", code: "TWM.01", description: "Specialising" },
              { id: "s8-TWM.02", code: "TWM.02", description: "Generalising" },
              { id: "s8-TWM.03", code: "TWM.03", description: "Conjecturing" },
              { id: "s8-TWM.04", code: "TWM.04", description: "Convincing" },
              { id: "s8-TWM.05", code: "TWM.05", description: "Characterising" },
              { id: "s8-TWM.06", code: "TWM.06", description: "Classifying" },
              { id: "s8-TWM.07", code: "TWM.07", description: "Critiquing" },
              { id: "s8-TWM.08", code: "TWM.08", description: "Improving" },
            ],
          },
        ],
      },
      {
        id: "s8-number",
        name: "Number",
        substrands: [
          {
            id: "s8-ni",
            name: "Integers, powers and roots",
            objectives: [
              {
                id: "s8-8Ni.01",
                code: "8Ni.01",
                description:
                  "Understand that brackets, indices (square and cube roots) and operations follow a particular order.",
              },
              {
                id: "s8-8Ni.02",
                code: "8Ni.02",
                description: "Estimate, multiply and divide integers, recognising generalisations.",
              },
              {
                id: "s8-8Ni.03",
                code: "8Ni.03",
                description:
                  "Understand factors, multiples, prime factors, highest common factors and lowest common multiples.",
              },
              {
                id: "s8-8Ni.04",
                code: "8Ni.04",
                description:
                  "Understand the hierarchy of natural numbers, integers and rational numbers.",
              },
              {
                id: "s8-8Ni.05",
                code: "8Ni.05",
                description:
                  "Use positive and zero indices, and the index laws for multiplication and division.",
              },
              {
                id: "s8-8Ni.06",
                code: "8Ni.06",
                description:
                  "Recognise squares of negative and positive numbers, and corresponding square roots.",
              },
              {
                id: "s8-8Ni.07",
                code: "8Ni.07",
                description:
                  "Recognise positive and negative cube numbers, and the corresponding cube roots.",
              },
            ],
          },
          {
            id: "s8-np",
            name: "Place value, ordering and rounding",
            objectives: [
              {
                id: "s8-8Np.01",
                code: "8Np.01",
                description:
                  "Use knowledge of place value to multiply and divide integers and decimals by 0.1 and 0.01.",
              },
              {
                id: "s8-8Np.02",
                code: "8Np.02",
                description: "Round numbers to a given number of significant figures.",
              },
            ],
          },
          {
            id: "s8-nf",
            name: "Fractions, decimals, percentages, ratio and proportion",
            objectives: [
              {
                id: "s8-8Nf.01",
                code: "8Nf.01",
                description: "Recognise fractions that are equivalent to recurring decimals.",
              },
              {
                id: "s8-8Nf.02",
                code: "8Nf.02",
                description:
                  "Estimate and subtract mixed numbers, and write the answer as a mixed number in its simplest form.",
              },
              {
                id: "s8-8Nf.03",
                code: "8Nf.03",
                description:
                  "Estimate and multiply an integer by a mixed number, and divide an integer by a proper fraction.",
              },
              {
                id: "s8-8Nf.04",
                code: "8Nf.04",
                description:
                  "Use knowledge of the laws of arithmetic and order of operations (including brackets) to simplify calculations containing decimals or fractions.",
              },
              {
                id: "s8-8Nf.05",
                code: "8Nf.05",
                description: "Understand percentage increase and decrease, and absolute change.",
              },
              {
                id: "s8-8Nf.06",
                code: "8Nf.06",
                description:
                  "Understand the relative size of quantities to compare and order decimals and fractions (positive and negative), using the symbols =, ≠, >, <, ≤ and ≥.",
              },
              {
                id: "s8-8Nf.07",
                code: "8Nf.07",
                description: "Estimate and multiply decimals by integers and decimals.",
              },
              {
                id: "s8-8Nf.08",
                code: "8Nf.08",
                description: "Estimate and divide decimals by numbers with one decimal place.",
              },
              {
                id: "s8-8Nf.09",
                code: "8Nf.09",
                description:
                  "Understand and use the relationship between ratio and direct proportion.",
              },
              {
                id: "s8-8Nf.10",
                code: "8Nf.10",
                description:
                  "Use knowledge of equivalence to simplify and compare ratios (different units).",
              },
              {
                id: "s8-8Nf.11",
                code: "8Nf.11",
                description:
                  "Understand how ratios are used to compare quantities to divide an amount into a given ratio with two or more parts.",
              },
            ],
          },
        ],
      },
      {
        id: "s8-algebra",
        name: "Algebra",
        substrands: [
          {
            id: "s8-ae",
            name: "Expressions, equations and formulae",
            objectives: [
              {
                id: "s8-8Ae.01",
                code: "8Ae.01",
                description:
                  "Understand that letters have different meanings in expressions, formulae and equations.",
              },
              {
                id: "s8-8Ae.02",
                code: "8Ae.02",
                description:
                  "Understand that the laws of arithmetic and order of operations apply to algebraic terms and expressions (four operations, squares and cubes).",
              },
              {
                id: "s8-8Ae.03",
                code: "8Ae.03",
                description:
                  "Understand how to manipulate algebraic expressions including: applying the distributive law with a single term (squares and cubes); identifying the highest common factor to factorise.",
              },
              {
                id: "s8-8Ae.04",
                code: "8Ae.04",
                description:
                  "Understand that a situation can be represented either in words or as an algebraic expression, and move between the two representations (linear with integer or fractional coefficients).",
              },
              {
                id: "s8-8Ae.05",
                code: "8Ae.05",
                description:
                  "Understand that a situation can be represented either in words or as a formula (mixed operations), and manipulate using knowledge of inverse operations to change the subject of a formula.",
              },
              {
                id: "s8-8Ae.06",
                code: "8Ae.06",
                description:
                  "Understand that a situation can be represented either in words or as an equation. Move between the two representations and solve the equation (integer or fractional coefficients, unknown on either or both sides).",
              },
              {
                id: "s8-8Ae.07",
                code: "8Ae.07",
                description:
                  "Understand that letters can represent open and closed intervals (two terms).",
              },
            ],
          },
          {
            id: "s8-as",
            name: "Sequences, functions and graphs",
            objectives: [
              {
                id: "s8-8As.01",
                code: "8As.01",
                description:
                  "Understand term-to-term rules, and generate sequences from numerical and spatial patterns (including fractions).",
              },
              {
                id: "s8-8As.02",
                code: "8As.02",
                description:
                  "Understand and describe nth term rules algebraically (in the form n ± a, a × n, or an ± b, where a and b are positive or negative integers or fractions).",
              },
              {
                id: "s8-8As.03",
                code: "8As.03",
                description:
                  "Understand that a function is a relationship where each input has a single output. Generate outputs from a given function and identify inputs from a given output by considering inverse operations (including fractions).",
              },
              {
                id: "s8-8As.04",
                code: "8As.04",
                description:
                  "Understand that a situation can be represented either in words or as a linear function in two variables (of the form y = mx + c), and move between the two representations.",
              },
              {
                id: "s8-8As.05",
                code: "8As.05",
                description:
                  "Use knowledge of coordinate pairs to construct tables of values and plot the graphs of linear functions, where y is given explicitly in terms of x (y = mx + c).",
              },
              {
                id: "s8-8As.06",
                code: "8As.06",
                description:
                  "Recognise that equations of the form y = mx + c correspond to straight-line graphs, where m is the gradient and c is the y-intercept (integer values of m).",
              },
              {
                id: "s8-8As.07",
                code: "8As.07",
                description:
                  "Read and interpret graphs with more than one component. Explain why they have a specific shape and the significance of intersections of the graphs.",
              },
            ],
          },
        ],
      },
      {
        id: "s8-geometry",
        name: "Geometry and Measure",
        substrands: [
          {
            id: "s8-gg",
            name: "Geometrical reasoning, shapes and measurements",
            objectives: [
              {
                id: "s8-8Gg.01",
                code: "8Gg.01",
                description: "Identify and describe the hierarchy of quadrilaterals.",
              },
              {
                id: "s8-8Gg.02",
                code: "8Gg.02",
                description:
                  "Understand π as the ratio between a circumference and a diameter. Know and use the formula for the circumference of a circle.",
              },
              {
                id: "s8-8Gg.03",
                code: "8Gg.03",
                description:
                  "Know that distances can be measured in miles or kilometres, and that a kilometre is approximately 5/8 of a mile or a mile is 1.6 kilometres.",
              },
              {
                id: "s8-8Gg.04",
                code: "8Gg.04",
                description:
                  "Use knowledge of rectangles, squares and triangles to derive the formulae for the area of parallelograms and trapezia. Use the formulae to calculate the area of parallelograms and trapezia.",
              },
              {
                id: "s8-8Gg.05",
                code: "8Gg.05",
                description:
                  "Understand and use Euler's formula to connect number of vertices, faces and edges of 3D shapes.",
              },
              {
                id: "s8-8Gg.06",
                code: "8Gg.06",
                description:
                  "Use knowledge of area and volume to derive the formula for the volume of a triangular prism. Use the formula to calculate the volume of triangular prisms.",
              },
              {
                id: "s8-8Gg.07",
                code: "8Gg.07",
                description: "Represent front, side and top view of 3D shapes to scale.",
              },
              {
                id: "s8-8Gg.08",
                code: "8Gg.08",
                description:
                  "Use knowledge of area, and properties of cubes, cuboids, triangular prisms and pyramids to calculate their surface area.",
              },
              {
                id: "s8-8Gg.09",
                code: "8Gg.09",
                description:
                  "Understand that the number of sides of a regular polygon is equal to the number of lines of symmetry and the order of rotation.",
              },
              {
                id: "s8-8Gg.10",
                code: "8Gg.10",
                description:
                  "Derive and use the fact that the exterior angle of a triangle is equal to the sum of the two interior opposite angles.",
              },
              {
                id: "s8-8Gg.11",
                code: "8Gg.11",
                description:
                  "Recognise and describe the properties of angles on parallel and intersecting lines, using geometric vocabulary such as alternate, corresponding and vertically opposite.",
              },
              {
                id: "s8-8Gg.12",
                code: "8Gg.12",
                description:
                  "Construct triangles, midpoint and perpendicular bisector of a line segment, and the bisector of an angle.",
              },
            ],
          },
          {
            id: "s8-gp",
            name: "Position and transformation",
            objectives: [
              {
                id: "s8-8Gp.01",
                code: "8Gp.01",
                description: "Understand and use bearings as a measure of direction.",
              },
              {
                id: "s8-8Gp.02",
                code: "8Gp.02",
                description: "Use knowledge of coordinates to find the midpoint of a line segment.",
              },
              {
                id: "s8-8Gp.03",
                code: "8Gp.03",
                description:
                  "Translate points and 2D shapes using vectors, recognising that the image is congruent to the object after a translation.",
              },
              {
                id: "s8-8Gp.04",
                code: "8Gp.04",
                description:
                  "Reflect 2D shapes and points in a given mirror line on or parallel to the x- or y-axis, or y = ± x on coordinate grids. Identify a reflection and its mirror line.",
              },
              {
                id: "s8-8Gp.05",
                code: "8Gp.05",
                description:
                  "Understand that the centre of rotation, direction of rotation and angle are needed to identify and perform rotations.",
              },
              {
                id: "s8-8Gp.06",
                code: "8Gp.06",
                description:
                  "Enlarge 2D shapes, from a centre of enlargement (outside or on the shape) with a positive integer scale factor. Identify an enlargement and scale factor.",
              },
            ],
          },
        ],
      },
      {
        id: "s8-statistics",
        name: "Statistics and Probability",
        substrands: [
          {
            id: "s8-ss",
            name: "Statistics",
            objectives: [
              {
                id: "s8-8Ss.01",
                code: "8Ss.01",
                description:
                  "Select, trial and justify data collection and sampling methods to investigate predictions for a set of related statistical questions, considering what data to collect (categorical, discrete and continuous data).",
              },
              {
                id: "s8-8Ss.02",
                code: "8Ss.02",
                description:
                  "Understand the advantages and disadvantages of different sampling methods.",
              },
              {
                id: "s8-8Ss.03",
                code: "8Ss.03",
                description:
                  "Record, organise and represent categorical, discrete and continuous data. Choose and explain which representation to use in a given situation: Venn and Carroll diagrams; tally charts, frequency tables and two-way tables; dual and compound bar charts; pie charts; frequency diagrams for continuous data; line graphs and time series graphs; scatter graphs; stem-and-leaf diagrams; infographics.",
              },
              {
                id: "s8-8Ss.04",
                code: "8Ss.04",
                description:
                  "Use knowledge of mode, median, mean and range to compare two distributions, considering the interrelationship between centrality and spread.",
              },
              {
                id: "s8-8Ss.05",
                code: "8Ss.05",
                description:
                  "Interpret data, identifying patterns, trends and relationships, within and between data sets, to answer statistical questions. Discuss conclusions, considering the sources of variation, including sampling, and check predictions.",
              },
            ],
          },
          {
            id: "s8-sp",
            name: "Probability",
            objectives: [
              {
                id: "s8-8Sp.01",
                code: "8Sp.01",
                description:
                  "Understand that complementary events are two events that have a total probability of 1.",
              },
              {
                id: "s8-8Sp.02",
                code: "8Sp.02",
                description:
                  "Understand that tables, diagrams and lists can be used to identify all mutually exclusive outcomes of combined events (independent events only).",
              },
              {
                id: "s8-8Sp.03",
                code: "8Sp.03",
                description:
                  "Understand how to find the theoretical probabilities of equally likely combined events.",
              },
              {
                id: "s8-8Sp.04",
                code: "8Sp.04",
                description:
                  "Design and conduct chance experiments or simulations, using small and large numbers of trials. Compare the experimental probabilities with theoretical outcomes.",
              },
            ],
          },
        ],
      },
    ],
  },
  // ===== STAGE 9 (Grade 8) =====
  {
    stage: 9,
    grade: 8,
    strands: [
      {
        id: "s9-twm",
        name: "Thinking and Working Mathematically",
        substrands: [
          {
            id: "s9-twm-core",
            name: "Thinking and Working Mathematically",
            objectives: [
              { id: "s9-TWM.01", code: "TWM.01", description: "Specialising" },
              { id: "s9-TWM.02", code: "TWM.02", description: "Generalising" },
              { id: "s9-TWM.03", code: "TWM.03", description: "Conjecturing" },
              { id: "s9-TWM.04", code: "TWM.04", description: "Convincing" },
              { id: "s9-TWM.05", code: "TWM.05", description: "Characterising" },
              { id: "s9-TWM.06", code: "TWM.06", description: "Classifying" },
              { id: "s9-TWM.07", code: "TWM.07", description: "Critiquing" },
              { id: "s9-TWM.08", code: "TWM.08", description: "Improving" },
            ],
          },
        ],
      },
      {
        id: "s9-number",
        name: "Number",
        substrands: [
          {
            id: "s9-ni",
            name: "Integers, powers and roots",
            objectives: [
              {
                id: "s9-9Ni.01",
                code: "9Ni.01",
                description: "Understand the difference between rational and irrational numbers.",
              },
              {
                id: "s9-9Ni.02",
                code: "9Ni.02",
                description:
                  "Use positive, negative and zero indices, and the index laws for multiplication and division.",
              },
              {
                id: "s9-9Ni.03",
                code: "9Ni.03",
                description:
                  "Understand the standard form for representing large and small numbers.",
              },
              {
                id: "s9-9Ni.04",
                code: "9Ni.04",
                description: "Use knowledge of square and cube roots to estimate surds.",
              },
            ],
          },
          {
            id: "s9-np",
            name: "Place value, ordering and rounding",
            objectives: [
              {
                id: "s9-9Np.01",
                code: "9Np.01",
                description:
                  "Multiply and divide integers and decimals by 10 to the power of any positive or negative number.",
              },
              {
                id: "s9-9Np.02",
                code: "9Np.02",
                description:
                  "Understand that when a number is rounded there are upper and lower limits for the original number.",
              },
            ],
          },
          {
            id: "s9-nf",
            name: "Fractions, decimals, percentages, ratio and proportion",
            objectives: [
              {
                id: "s9-9Nf.01",
                code: "9Nf.01",
                description:
                  "Deduce whether fractions will have recurring or terminating decimal equivalents.",
              },
              {
                id: "s9-9Nf.02",
                code: "9Nf.02",
                description:
                  "Estimate, add and subtract proper and improper fractions, and mixed numbers, using the order of operations.",
              },
              {
                id: "s9-9Nf.03",
                code: "9Nf.03",
                description:
                  "Estimate, multiply and divide fractions, interpret division as a multiplicative inverse, and cancel common factors before multiplying or dividing.",
              },
              {
                id: "s9-9Nf.04",
                code: "9Nf.04",
                description:
                  "Use knowledge of the laws of arithmetic, inverse operations, equivalence and order of operations (brackets and indices) to simplify calculations containing decimals and fractions.",
              },
              { id: "s9-9Nf.05", code: "9Nf.05", description: "Understand compound percentages." },
              {
                id: "s9-9Nf.06",
                code: "9Nf.06",
                description: "Estimate, multiply and divide decimals by integers and decimals.",
              },
              {
                id: "s9-9Nf.07",
                code: "9Nf.07",
                description:
                  "Understand the relationship between two quantities when they are in direct or inverse proportion.",
              },
              {
                id: "s9-9Nf.08",
                code: "9Nf.08",
                description: "Use knowledge of ratios and equivalence for a range of contexts.",
              },
            ],
          },
        ],
      },
      {
        id: "s9-algebra",
        name: "Algebra",
        substrands: [
          {
            id: "s9-ae",
            name: "Expressions, equations and formulae",
            objectives: [
              {
                id: "s9-9Ae.01",
                code: "9Ae.01",
                description:
                  "Understand that the laws of arithmetic and order of operations apply to algebraic terms and expressions (four operations and integer powers).",
              },
              {
                id: "s9-9Ae.02",
                code: "9Ae.02",
                description:
                  "Understand how to manipulate algebraic expressions including: expanding the product of two algebraic expressions, applying the laws of indices, simplifying algebraic fractions.",
              },
              {
                id: "s9-9Ae.03",
                code: "9Ae.03",
                description:
                  "Understand that a situation can be represented either in words or as an algebraic expression, and move between the two representations (including squares, cubes and roots).",
              },
              {
                id: "s9-9Ae.04",
                code: "9Ae.04",
                description:
                  "Understand that a situation can be represented either in words or as a formula (including squares and cubes), and manipulate using knowledge of inverse operations to change the subject of a formula.",
              },
              {
                id: "s9-9Ae.05",
                code: "9Ae.05",
                description:
                  "Understand that a situation can be represented either in words or as an equation. Move between the two representations and solve the equation (including those with an unknown in the denominator).",
              },
              {
                id: "s9-9Ae.06",
                code: "9Ae.06",
                description:
                  "Understand that the solution of simultaneous linear equations is the pair of values that satisfy both equations and can be found algebraically (eliminating one variable) or graphically (point of intersection).",
              },
              {
                id: "s9-9Ae.07",
                code: "9Ae.07",
                description:
                  "Understand that a situation can be represented either in words or as an inequality. Move between the two representations and solve linear inequalities.",
              },
            ],
          },
          {
            id: "s9-as",
            name: "Sequences, functions and graphs",
            objectives: [
              {
                id: "s9-9As.01",
                code: "9As.01",
                description:
                  "Generate linear and quadratic sequences from numerical patterns and from a given term-to-term rule (any indices).",
              },
              {
                id: "s9-9As.02",
                code: "9As.02",
                description:
                  "Understand and describe nth term rules algebraically (in the form an ± b, where a and b are positive or negative integers or fractions, and in the form n², n³ or n² ± a, where a is a whole number).",
              },
              {
                id: "s9-9As.03",
                code: "9As.03",
                description:
                  "Understand that a function is a relationship where each input has a single output. Generate outputs from a given function and identify inputs from a given output by considering inverse operations (including indices).",
              },
              {
                id: "s9-9As.04",
                code: "9As.04",
                description:
                  "Understand that a situation can be represented either in words or as a linear function in two variables (of the form y = mx + c or ax + by = c), and move between the two representations.",
              },
              {
                id: "s9-9As.05",
                code: "9As.05",
                description:
                  "Use knowledge of coordinate pairs to construct tables of values and plot the graphs of linear functions, including where y is given implicitly in terms of x (ax + by = c), and quadratic functions of the form y = x² ± a.",
              },
              {
                id: "s9-9As.06",
                code: "9As.06",
                description:
                  "Understand that straight-line graphs can be represented by equations. Find the equation in the form y = mx + c or where y is given implicitly in terms of x (fractional, positive and negative gradients).",
              },
              {
                id: "s9-9As.07",
                code: "9As.07",
                description:
                  "Read, draw and interpret graphs and use compound measures to compare graphs.",
              },
            ],
          },
        ],
      },
      {
        id: "s9-geometry",
        name: "Geometry and Measure",
        substrands: [
          {
            id: "s9-gg",
            name: "Geometrical reasoning, shapes and measurements",
            objectives: [
              {
                id: "s9-9Gg.01",
                code: "9Gg.01",
                description:
                  "Know and use the formulae for the area and circumference of a circle.",
              },
              {
                id: "s9-9Gg.02",
                code: "9Gg.02",
                description:
                  "Know and recognise very small or very large units of length, capacity and mass.",
              },
              {
                id: "s9-9Gg.03",
                code: "9Gg.03",
                description:
                  "Estimate and calculate areas of compound 2D shapes made from rectangles, triangles and circles.",
              },
              {
                id: "s9-9Gg.04",
                code: "9Gg.04",
                description:
                  "Use knowledge of area and volume to derive the formula for the volume of prisms and cylinders. Use the formula to calculate the volume of prisms and cylinders.",
              },
              {
                id: "s9-9Gg.05",
                code: "9Gg.05",
                description:
                  "Use knowledge of area, and properties of cubes, cuboids, triangular prisms, pyramids and cylinders to calculate their surface area.",
              },
              {
                id: "s9-9Gg.06",
                code: "9Gg.06",
                description: "Identify reflective symmetry in 3D shapes.",
              },
              {
                id: "s9-9Gg.07",
                code: "9Gg.07",
                description:
                  "Derive and use the formula for the sum of the interior angles of any polygon.",
              },
              {
                id: "s9-9Gg.08",
                code: "9Gg.08",
                description: "Know that the sum of the exterior angles of any polygon is 360°.",
              },
              {
                id: "s9-9Gg.09",
                code: "9Gg.09",
                description:
                  "Use properties of angles, parallel and intersecting lines, triangles and quadrilaterals to calculate missing angles.",
              },
              { id: "s9-9Gg.10", code: "9Gg.10", description: "Know and use Pythagoras' theorem." },
              {
                id: "s9-9Gg.11",
                code: "9Gg.11",
                description: "Construct 60°, 45° and 30° angles and regular polygons.",
              },
            ],
          },
          {
            id: "s9-gp",
            name: "Position and transformation",
            objectives: [
              {
                id: "s9-9Gp.01",
                code: "9Gp.01",
                description:
                  "Use knowledge of bearings and scaling to interpret position on maps and plans.",
              },
              {
                id: "s9-9Gp.02",
                code: "9Gp.02",
                description: "Use knowledge of coordinates to find points on a line segment.",
              },
              {
                id: "s9-9Gp.03",
                code: "9Gp.03",
                description:
                  "Transform points and 2D shapes by combinations of reflections, translations and rotations.",
              },
              {
                id: "s9-9Gp.04",
                code: "9Gp.04",
                description:
                  "Identify and describe a transformation (reflections, translations, rotations and combinations of these) given an object and its image.",
              },
              {
                id: "s9-9Gp.05",
                code: "9Gp.05",
                description:
                  "Recognise and explain that after any combination of reflections, translations and rotations the image is congruent to the object.",
              },
              {
                id: "s9-9Gp.06",
                code: "9Gp.06",
                description:
                  "Enlarge 2D shapes, from a centre of enlargement (outside, on or inside the shape) with a positive integer scale factor. Identify an enlargement, centre of enlargement and scale factor.",
              },
              {
                id: "s9-9Gp.07",
                code: "9Gp.07",
                description:
                  "Analyse and describe changes in perimeter and area of squares and rectangles when side lengths are enlarged by a positive integer scale factor.",
              },
            ],
          },
        ],
      },
      {
        id: "s9-statistics",
        name: "Statistics and Probability",
        substrands: [
          {
            id: "s9-ss",
            name: "Statistics",
            objectives: [
              {
                id: "s9-9Ss.01",
                code: "9Ss.01",
                description:
                  "Select, trial and justify data collection and sampling methods to investigate predictions for a set of related statistical questions, considering what data to collect, and the appropriateness of each type (qualitative or quantitative; categorical, discrete or continuous).",
              },
              {
                id: "s9-9Ss.02",
                code: "9Ss.02",
                description:
                  "Explain potential issues and sources of bias with data collection and sampling methods, identifying further questions to ask.",
              },
              {
                id: "s9-9Ss.03",
                code: "9Ss.03",
                description:
                  "Record, organise and represent categorical, discrete and continuous data. Choose and explain which representation to use in a given situation: Venn and Carroll diagrams; tally charts, frequency tables and two-way tables; dual and compound bar charts; pie charts; line graphs, time series graphs and frequency polygons; scatter graphs; stem-and-leaf and back-to-back stem-and-leaf diagrams; infographics.",
              },
              {
                id: "s9-9Ss.04",
                code: "9Ss.04",
                description:
                  "Use mode, median, mean and range to compare two distributions, including grouped data.",
              },
              {
                id: "s9-9Ss.05",
                code: "9Ss.05",
                description:
                  "Interpret data, identifying patterns, trends and relationships, within and between data sets, to answer statistical questions. Make informal inferences and generalisations, identifying wrong or misleading information.",
              },
            ],
          },
          {
            id: "s9-sp",
            name: "Probability",
            objectives: [
              {
                id: "s9-9Sp.01",
                code: "9Sp.01",
                description:
                  "Understand that the probability of multiple mutually exclusive events can be found by summation and all mutually exclusive events have a total probability of 1.",
              },
              {
                id: "s9-9Sp.02",
                code: "9Sp.02",
                description:
                  "Identify when successive and combined events are independent and when they are not.",
              },
              {
                id: "s9-9Sp.03",
                code: "9Sp.03",
                description:
                  "Understand how to find the theoretical probabilities of combined events.",
              },
              {
                id: "s9-9Sp.04",
                code: "9Sp.04",
                description:
                  "Design and conduct chance experiments or simulations, using small and large numbers of trials. Calculate the expected frequency of occurrences and compare with observed outcomes.",
              },
            ],
          },
        ],
      },
    ],
  },
];

// Helper functions for easy access
export function getCambridgeByStage(stage: number): CambridgeStage | undefined {
  return CAMBRIDGE_CURRICULUM.find((s) => s.stage === stage);
}

export function getCambridgeByGrade(grade: number): CambridgeStage | undefined {
  return CAMBRIDGE_CURRICULUM.find((s) => s.grade === grade);
}

export function getCambridgeStrand(strandId: string): CambridgeStrand | undefined {
  for (const stageData of CAMBRIDGE_CURRICULUM) {
    const strand = stageData.strands.find((s) => s.id === strandId);
    if (strand) return strand;
  }
  return undefined;
}

export function getCambridgeSubstrand(substrandId: string): CambridgeSubstrand | undefined {
  for (const stageData of CAMBRIDGE_CURRICULUM) {
    for (const strand of stageData.strands) {
      const substrand = strand.substrands.find((ss) => ss.id === substrandId);
      if (substrand) return substrand;
    }
  }
  return undefined;
}

export function getCambridgeObjective(objectiveId: string): CambridgeObjective | undefined {
  for (const stageData of CAMBRIDGE_CURRICULUM) {
    for (const strand of stageData.strands) {
      for (const substrand of strand.substrands) {
        const objective = substrand.objectives.find((o) => o.id === objectiveId);
        if (objective) return objective;
      }
    }
  }
  return undefined;
}

// Get all objectives for a specific stage (useful for dropdowns/selectors)
export function getAllObjectivesByStage(stage: number): Array<{
  objective: CambridgeObjective;
  substrandName: string;
  strandName: string;
}> {
  const stageData = getCambridgeByStage(stage);
  if (!stageData) return [];

  const result: Array<{
    objective: CambridgeObjective;
    substrandName: string;
    strandName: string;
  }> = [];

  for (const strand of stageData.strands) {
    for (const substrand of strand.substrands) {
      for (const objective of substrand.objectives) {
        result.push({
          objective,
          substrandName: substrand.name,
          strandName: strand.name,
        });
      }
    }
  }

  return result;
}

// Get all objectives for a specific grade (for our grade-based system)
export function getAllObjectivesByGrade(grade: number): Array<{
  objective: CambridgeObjective;
  substrandName: string;
  strandName: string;
}> {
  const stageData = getCambridgeByGrade(grade);
  if (!stageData) return [];

  const result: Array<{
    objective: CambridgeObjective;
    substrandName: string;
    strandName: string;
  }> = [];

  for (const strand of stageData.strands) {
    for (const substrand of strand.substrands) {
      for (const objective of substrand.objectives) {
        result.push({
          objective,
          substrandName: substrand.name,
          strandName: strand.name,
        });
      }
    }
  }

  return result;
}
