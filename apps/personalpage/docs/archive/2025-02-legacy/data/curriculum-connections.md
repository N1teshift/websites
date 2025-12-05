# Curriculum Connections: BUP ↔ Cambridge

## Overview
This document outlines the connection system between Lithuanian BUP curriculum and Cambridge Lower Secondary Mathematics curriculum for MYP Years 2-3 (Grades 7-8).

## Current Implementation
The content display tab now shows:
- **BUP Curriculum**: All subunits organized by modules and units
- **Cambridge Curriculum**: All objectives organized by strands and substrands
- **Example Connections**: A small set of manual connections to demonstrate the system

---

## Connection Examples

### Grade 7 (MYP Year 2)
**BUP Grade 7 ↔ Cambridge Stage 8**

#### 1. Powers and Exponents
**BUP**: `g7-m1-u1-s1` - Laipsnis su sveikuoju rodikliu (Powers with integer exponents)
- Covers: powers with natural exponents, zero exponent, negative integer exponents, standard form (a×10^k)
- Operations: multiplication, division, power to power

**Cambridge**: `8Ni.05` - Use positive and zero indices, and the index laws
- Covers: index laws, positive and zero indices

**Connection Type**: ⭐ **Direct Match** - Same mathematical concept
**Connection Strength**: Strong (90%+ overlap)
**Notes**: BUP goes deeper with standard form; Cambridge focuses on laws

---

#### 2. Inequalities and Intervals
**BUP**: `g7-m2-u1-s1` - Nelygybės (Inequalities)
- Linear inequalities, graphing on number line, inequality properties
- Compound inequalities

**Cambridge**: `8Ae.07` - Understand that letters can represent open and closed intervals
- Open/closed intervals notation
- Representing constraints algebraically

**Connection Type**: 🔗 **Conceptual Link** - Related but different focus
**Connection Strength**: Medium (50-70% overlap)
**Notes**: BUP is more procedural, Cambridge more notational/theoretical

---

#### 3. Geometric Figures and Properties
**BUP**: `g7-m3-u2-s1` - Plokščiosios figūros (Plane figures)
- Triangle types, quadrilateral properties
- Angle relationships, parallel lines

**Cambridge**: `8Gg.*` - Geometrical reasoning strand (multiple objectives)
- `8Gg.01`: Use and interpret geometrical terms
- `8Gg.08`: Solve problems using properties of angles
- `8Gg.11`: Identify congruent shapes

**Connection Type**: 🌐 **Strand Connection** - BUP subunit maps to multiple Cambridge objectives
**Connection Strength**: Strong (80%+ overlap across multiple objectives)
**Notes**: One-to-many relationship

---

#### 4. Area and Volume Calculations
**BUP**: `g7-m3-u2-s3` - Plotai ir tūriai (Areas and volumes)
- Rectangle, triangle, parallelogram areas
- Prism volumes, compound shapes

**Cambridge**: 
- `8Gg.05`: Derive and use formulae for area of triangles and parallelograms
- `8Gg.06`: Derive and use formulae for volume of cuboids

**Connection Type**: 🔀 **Split Mapping** - BUP subunit splits across Cambridge objectives
**Connection Strength**: Strong (85%+ overlap)
**Notes**: Same content, different granularity

---

### Grade 8 (MYP Year 3)
**BUP Grade 8 ↔ Cambridge Stage 9**

#### 5. Roots and Surds
**BUP**: `g8-m1-u1-s1` - Kvadratinė ir kubinė šaknys (Square and cube roots)
- Properties of roots, simplifying radical expressions
- Operations with roots

**Cambridge**: `9Ni.04` - Use knowledge of square and cube roots to estimate surds
- Estimating surds, simplifying surds
- Exact vs approximate values

**Connection Type**: ⭐ **Direct Match** - Same mathematical concept
**Connection Strength**: Very Strong (95%+ overlap)
**Notes**: Nearly identical content and depth

---

#### 6. Number Sets
**BUP**: `g8-m1-u1-s2` - Skaičių aibės (Number sets)
- Natural, integer, rational, irrational, real numbers
- Number set relationships and properties

**Cambridge**: `9Ni.01` - Understand the difference between rational and irrational numbers
- Defining rational vs irrational
- Examples and classification

**Connection Type**: 🔍 **Subset Match** - Cambridge is subset of BUP content
**Connection Strength**: Medium-Strong (70% overlap)
**Notes**: BUP covers broader scope; Cambridge focuses on one distinction

---

#### 7. Systems of Equations
**BUP**: `g8-m2-u1-s2` - Lygčių sistemos (Systems of equations)
- Linear systems with two variables
- Solution methods: substitution, elimination, graphical

**Cambridge**: `9Ae.06` - Understand that simultaneous equations can be solved algebraically or graphically
- Solving simultaneous linear equations
- Algebraic methods (elimination) and graphical interpretation

**Connection Type**: ⭐ **Direct Match** - Same mathematical concept
**Connection Strength**: Very Strong (90%+ overlap)
**Notes**: Terminology differs (systemos vs simultaneous) but content identical

---

#### 8. Pythagorean Theorem
**BUP**: `g8-m3-u2-s1` - Pitagoro teorema (Pythagorean theorem)
- Statement and proof
- Applications in 2D and 3D
- Finding missing sides, distance problems

**Cambridge**: `9Gg.10` - Know and use Pythagoras' theorem
- Apply theorem to solve problems
- Multi-step applications

**Connection Type**: ⭐ **Direct Match** - Same mathematical concept
**Connection Strength**: Very Strong (95%+ overlap)
**Notes**: Same theorem, similar applications

---

#### 9. Functions and Graphs
**BUP**: `g8-m2-u2-s1` - Funkcijos (Functions)
- Function concept, domain/range
- Linear and quadratic functions
- Function graphs and properties

**Cambridge**: 
- `9As.03`: Understand functions and their properties
- `9As.05`: Plot graphs of linear and quadratic functions (y = x² ± a)
- `9As.06`: Find equations of straight-line graphs

**Connection Type**: 🌐 **Strand Connection** - Multiple Cambridge objectives
**Connection Strength**: Strong (85% overlap)
**Notes**: BUP is more integrated; Cambridge breaks into specific skills

---

#### 10. Statistics and Data Analysis
**BUP**: `g8-m4-u1-s1` - Statistika (Statistics)
- Data collection and representation
- Mean, median, mode, range
- Interpreting charts and graphs

**Cambridge**: 
- `9Ss.01`: Select and justify data collection methods
- `9Ss.03`: Choose appropriate representations
- `9Ss.04`: Use mean, median, mode, range to compare distributions

**Connection Type**: 🌐 **Strand Connection** - Full strand mapping
**Connection Strength**: Strong (80% overlap)
**Notes**: Cambridge more granular with explicit statistical thinking

---

## Connection Type Summary

| Symbol | Type | Description | Example Count |
|--------|------|-------------|---------------|
| ⭐ | Direct Match | Nearly identical content and depth | 5 |
| 🔗 | Conceptual Link | Related concepts, different emphasis | 3 |
| 🌐 | Strand Connection | One-to-many mapping | 4 |
| 🔀 | Split Mapping | Content split differently | 2 |
| 🔍 | Subset Match | One is subset of the other | 2 |

**Total Potential Connections**: ~50-70 across both grade levels

---

## Implementation Approaches

### Approach 1: Manual Mapping (Current)
**Description**: Manually define connection pairs in a lookup object

```typescript
export const CONNECTIONS: Record<string, string[]> = {
    'g7-m1-u1-s1': ['s8-ni', 's8-8Ni.05'],
    'g8-m3-u2-s1': ['s9-gg', 's9-9Gg.10'],
    // ... 50-70 more entries
};
```

**Pros**:
- ✅ Complete control over connections
- ✅ Can specify connection strength/type
- ✅ Simple to understand and debug
- ✅ Fast lookup performance

**Cons**:
- ❌ Tedious to create initially (~50-70 mappings)
- ❌ Hard to maintain when curricula change
- ❌ Requires domain expertise for each connection
- ❌ Bidirectional connections need to be defined twice

**Best For**: Small to medium connection sets with stable curricula

---

### Approach 2: Keyword-Based Automatic Matching
**Description**: Use keyword extraction and matching to suggest connections

```typescript
function extractKeywords(text: string): string[] {
    const keywords = [
        'powers', 'exponents', 'indices',
        'equations', 'inequalities', 'functions',
        'triangle', 'circle', 'polygon',
        'area', 'volume', 'perimeter',
        // ... 100+ math keywords
    ];
    // NLP processing to find matches
}

function autoConnect(bupTopic, cambridgeTopics) {
    const bupKeywords = extractKeywords(bupTopic.content);
    return cambridgeTopics
        .map(ct => ({
            topic: ct,
            score: calculateOverlap(bupKeywords, extractKeywords(ct.description))
        }))
        .filter(({ score }) => score > 0.3)
        .sort((a, b) => b.score - a.score);
}
```

**Pros**:
- ✅ Automatic connection discovery
- ✅ Adapts to curriculum changes
- ✅ Can find unexpected connections
- ✅ Bidirectional by nature

**Cons**:
- ❌ Requires NLP library or custom implementation
- ❌ May produce false positives (e.g., "factor" in different contexts)
- ❌ Needs threshold tuning
- ❌ Performance overhead for real-time calculation

**Best For**: Large, dynamic curricula where manual mapping is impractical

---

### Approach 3: Semantic Similarity (AI-Enhanced)
**Description**: Use embeddings or AI to understand semantic similarity

```typescript
// Using pre-computed embeddings or API calls
async function findSemanticConnections(topic: CurriculumTopic) {
    const embedding = await getEmbedding(topic.content);
    const candidates = await queryVectorDB(embedding, topK=5);
    return candidates.map(c => ({
        id: c.id,
        similarity: c.score,
        type: classifyConnectionType(c.score)
    }));
}
```

**Pros**:
- ✅ Best accuracy for conceptual connections
- ✅ Understands context beyond keywords
- ✅ Can capture "Conceptual Link" type connections
- ✅ Professional/cutting-edge solution

**Cons**:
- ❌ Requires external API (OpenAI) or local model
- ❌ Costs (API calls) or complexity (local embeddings)
- ❌ Slower performance
- ❌ "Black box" - hard to explain why connections were made

**Best For**: Production systems with budget for AI services

---

### Approach 4: Hybrid (Manual + Auto-Suggest)
**Description**: Start with manual mappings, use auto-suggestions for review

```typescript
export const VERIFIED_CONNECTIONS: Record<string, ConnectionData[]> = {
    // Human-verified connections
    'g7-m1-u1-s1': [
        { id: 's8-8Ni.05', type: 'direct', strength: 0.95, verified: true }
    ],
};

export const SUGGESTED_CONNECTIONS: Record<string, ConnectionData[]> = {
    // Auto-generated, pending review
    'g7-m2-u1-s2': [
        { id: 's8-ae-intervals', type: 'conceptual', strength: 0.65, verified: false }
    ],
};

// In UI: show verified connections prominently, suggestions with "?" icon
```

**Pros**:
- ✅ Best of both worlds
- ✅ Gradual improvement over time
- ✅ Human oversight with automation assist
- ✅ Can mark connection quality/confidence

**Cons**:
- ❌ More complex architecture
- ❌ Requires UI for reviewing suggestions
- ❌ Still needs initial auto-suggestion implementation

**Best For**: Long-term solution with iterative improvement

---

### Approach 5: Category-Based Grouping
**Description**: Group topics by mathematical domain, connect within domains

```typescript
const MATH_DOMAINS = {
    number: ['powers', 'roots', 'rational', 'irrational', 'indices'],
    algebra: ['equations', 'inequalities', 'functions', 'graphs'],
    geometry: ['shapes', 'angles', 'area', 'volume', 'pythagorean'],
    statistics: ['data', 'mean', 'median', 'probability', 'charts'],
};

function categorize(topic: CurriculumTopic): string[] {
    // Assign topic to one or more domains
    return domains.filter(domain => 
        MATH_DOMAINS[domain].some(keyword => 
            topic.content.toLowerCase().includes(keyword)
        )
    );
}

// Connect topics in same domain
function getDomainConnections(topic: CurriculumTopic, otherCurriculum) {
    const domains = categorize(topic);
    return otherCurriculum.filter(other => 
        categorize(other).some(d => domains.includes(d))
    );
}
```

**Pros**:
- ✅ Reasonable accuracy with low complexity
- ✅ Easy to understand and explain
- ✅ Fast performance
- ✅ Good starting point for finer connections

**Cons**:
- ❌ Coarse-grained (shows too many connections)
- ❌ Can't distinguish strength within domain
- ❌ Topics often span multiple domains
- ❌ Still requires manual domain classification

**Best For**: Quick prototype or fallback when no specific connection exists

---

## Recommended Approach

### 🎯 Start with Approach 1 (Manual) + Approach 5 (Category) Hybrid

**Phase 1 (Immediate)**: 
1. Keep current manual mappings as "verified connections"
2. Implement category-based grouping as "suggested connections"
3. Display both in UI with different visual styles:
   - Verified: Solid line, bright colors, high confidence
   - Suggested: Dashed line, muted colors, "similar topic area"

**Phase 2 (Future Enhancement)**:
1. Add UI to promote suggestions to verified connections
2. Implement keyword matching to improve suggestions
3. Add connection metadata (type, strength, notes)

**Phase 3 (Advanced)**:
1. If the system proves valuable, consider AI-enhanced semantic matching
2. Build curriculum comparison analytics
3. Export connection reports for curriculum planning

---

## UI/UX Implementation Ideas

### Option A: Hover Highlighting (Current)
- Hover over BUP card → highlight connected Cambridge cards
- Simple, clean, works for few connections
- **Issue**: Gets messy with many connections (5+)

### Option B: Connection Lines with SVG
- Draw curved lines between connected cards
- Can show connection type with line style (solid/dashed)
- Can show connection strength with line thickness
- **Pro**: Beautiful, intuitive
- **Con**: Complex implementation, performance with many connections

### Option C: Side Panel Details
- Hover/click topic → side panel shows all connections
- Panel shows connection type, strength, notes
- Can compare content side-by-side
- **Pro**: Clean, scalable to many connections
- **Con**: Requires extra screen space

### Option D: Connection Matrix View
- Toggle to matrix view showing all connections at once
- Rows = BUP topics, Columns = Cambridge objectives
- Cell color intensity = connection strength
- **Pro**: Overview of entire curriculum mapping
- **Con**: Information overload for 50x50+ matrix

### Option E: Smart Filter Mode
- Toggle "Show Only Connected Topics"
- Hides unconnected topics for cleaner view
- Add filter by connection type/strength
- **Pro**: Reduces cognitive load
- **Con**: Loses context of full curriculum

**Recommendation**: Start with **Option A (current)** + **Option E (filter)**
- Option A for basic interaction
- Option E to reduce visual clutter
- Option C as expansion on click for details

---

## Data Structure Enhancement

### Add Connection Metadata

```typescript
export interface Connection {
    targetId: string;
    type: 'direct' | 'conceptual' | 'strand' | 'split' | 'subset';
    strength: number; // 0.0 to 1.0
    verified: boolean;
    notes?: string;
    bidirectional: boolean;
}

export interface CurriculumTopic {
    id: string;
    // ... existing fields
    connections: Connection[]; // Enhanced from string[]
}
```

This allows:
- Visual distinction by connection type
- Filtering by strength threshold
- Manual review workflow (verified flag)
- Explanatory notes for educators

---

## Next Steps

1. **Decision Point**: Choose implementation approach
2. **Quick Win**: Add 10-15 more manual connections for Grade 7
3. **Enhancement**: Implement category-based suggestions
4. **UI Polish**: Add filter toggle and connection info tooltips
5. **Validation**: Review with mathematics educators
6. **Scale**: Complete all ~50-70 connections across both grades

---

## Questions for Consideration

1. **Granularity**: Should we connect at subunit level (current) or break down further?
2. **Direction**: Are connections inherently bidirectional or do we need A→B and B→A separately?
3. **Usage**: How will teachers use this? For planning? For showing students curriculum alignment?
4. **Maintenance**: Who will maintain connections when curricula update?
5. **Integration**: Should connections influence unit plan content suggestions?

---

## Example Enhanced Visualization Mockup

```
BUP: Laipsnis su sveikuoju rodikliu
┌─────────────────────────────────┐
│ 🔵 Skaičiai ir skaičiavimai     │
│                                 │
│ Powers with integer exponents  │
│ • Natural exponents            │
│ • Zero and negative exponents  │
│ • Standard form (a×10^k)       │
│                                 │
│ 🔗 2 verified connections       │
│ 💡 1 suggested connection       │
└─────────────────────────────────┘
          │ ⭐ Direct (0.95)
          ├──────────────────────────► Cambridge 8Ni.05: Indices
          │ 🔗 Conceptual (0.70)
          └──────────────────────────► Cambridge 8Ni.03: Standard form
```

---

*Last Updated: October 22, 2025*
*Status: Proposal Document*
*Next: Review and select approach*



