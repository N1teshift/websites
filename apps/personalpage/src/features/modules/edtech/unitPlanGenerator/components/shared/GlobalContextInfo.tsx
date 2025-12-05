import React from 'react';

interface GlobalContextInfoProps {
    globalContext: string;
}

const GlobalContextInfo: React.FC<GlobalContextInfoProps> = ({ globalContext }) => {
    if (!globalContext) return null;

    const getContextInfo = (context: string) => {
        switch (context) {
            case "Identities and Relationships":
                return {
                    focusQuestion: "Who am I? Who are we?",
                    description: "Students will explore identity; beliefs and values; personal, physical, mental, social and spiritual health; human relationships including families, friends, communities and cultures; what it means to be human.",
                    examples: [
                        "Competition and cooperation, teams, affiliation and leadership",
                        "Identity formation, self-esteem, status, roles and role models",
                        "Personal efficacy and agency; attitudes, motivation, independence; happiness and the good life",
                        "Physical, psychological and social development; transitions; health and well-being; lifestyle choices",
                        "Human nature and human dignity; moral reasoning and ethical judgment; consciousness and mind"
                    ]
                };

            case "Orientation in Space and Time":
                return {
                    focusQuestion: "What is the meaning of &quot;where&quot; and &quot;when&quot;?",
                    description: "Students will explore personal histories; homes and journeys; turning points for humankind; discoveries; explorations and migrations of humankind; the relationships between, and the interconnectedness of, individuals and civilizations, from personal, local and global perspectives.",
                    examples: [
                        "Civilizations and social histories, heritage, pilgrimage, migration, displacement and exchange",
                        "Epochs, eras, turning points and &quot;big history&quot;",
                        "Scale, duration, frequency and variability",
                        "Peoples, boundaries, exchange and interaction",
                        "Natural and human landscapes and resources",
                        "Evolution, constraints and adaptation",
                        "Indigenous understanding"
                    ]
                };

            case "Personal and Cultural Expression":
                return {
                    focusQuestion: "What is the nature and purpose of creative expression?",
                    description: "Students will explore the ways in which we discover and express ideas, feelings, nature, culture, beliefs and values; the ways in which we reflect on, extend and enjoy our creativity; our appreciation of the aesthetic.",
                    examples: [
                        "Artistry, craft, creation, beauty",
                        "Products, systems and institutions",
                        "Social constructions of reality; philosophies and ways of life; belief systems; ritual and play",
                        "Critical literacy, languages and linguistic systems; histories of ideas, fields and disciplines; analysis and argument",
                        "Metacognition and abstract thinking",
                        "Entrepreneurship, practice and competency"
                    ]
                };

            case "Scientific and Technical Innovation":
                return {
                    focusQuestion: "How do we understand the world in which we live?",
                    description: "Students will explore the natural world and its laws; the interaction between people and the natural world; how humans use their understanding of scientific principles; the impact of scientific and technological advances on communities and environments; the impact of environments on human activity; how humans adapt environments to their needs.",
                    examples: [
                        "Systems, models, methods; products, processes and solutions",
                        "Adaptation, ingenuity and progress",
                        "Opportunity, risk, consequences and responsibility",
                        "Modernization, industrialization and engineering",
                        "Digital life, virtual environments and the Information Age",
                        "The biological revolution",
                        "Mathematical puzzles, principles and discoveries"
                    ]
                };

            case "Globalization and Sustainability":
                return {
                    focusQuestion: "How is everything connected?",
                    description: "Students will explore the interconnectedness of human-made systems and communities; the relationship between local and global processes; how local experiences mediate the global; the opportunities and tensions provided by world interconnectedness; the impact of decision-making on humankind and the environment.",
                    examples: [
                        "Markets, commodities and commercialization",
                        "Human impact on the environment",
                        "Commonality, diversity and interconnection",
                        "Consumption, conservation and scarcity; natural resources and public goods",
                        "Population and demography",
                        "Urban planning, strategy and infrastructure",
                        "Data-driven decision making"
                    ]
                };

            case "Fairness and Development":
                return {
                    focusQuestion: "What are the consequences of our common humanity?",
                    description: "Students will explore rights and responsibilities; the relationship between communities; sharing finite resources with other people and with other living things; access to equal opportunities; peace and conflict resolution.",
                    examples: [
                        "Democracy, politics, government and civil society",
                        "Inequality, difference and inclusion",
                        "Human capability and development; social entrepreneurs",
                        "Rights, law, civic responsibility and the public sphere",
                        "Justice, peace and conflict management",
                        "Ecology and disparate impact",
                        "Power and privilege",
                        "Authority, security and freedom",
                        "Imagining a hopeful future"
                    ]
                };

            default:
                return null;
        }
    };

    const contextInfo = getContextInfo(globalContext);

    if (!contextInfo) return null;

    return (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
            <div className="font-semibold text-blue-900 mb-2">Focus Questions & Description:</div>
            <div className="text-blue-800 mb-3">
                <strong dangerouslySetInnerHTML={{ __html: contextInfo.focusQuestion }} />
                <br/>
                {contextInfo.description}
            </div>
            <div className="font-semibold text-blue-900 mb-2">Example Explorations:</div>
            <ul className="text-blue-800 list-disc pl-5 space-y-1">
                {contextInfo.examples.map((example, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: example }} />
                ))}
            </ul>
        </div>
    );
};

export default GlobalContextInfo;



