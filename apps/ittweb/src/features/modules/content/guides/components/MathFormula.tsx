import React from "react";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

interface MathFormulaProps {
  /** LaTeX formula string */
  formula: string;
  /** Whether to render as block (centered, larger) or inline */
  block?: boolean;
  /** Optional className for styling */
  className?: string;
}

/**
 * Component to render LaTeX math formulas using KaTeX
 */
export function MathFormula({ formula, block = false, className = "" }: MathFormulaProps) {
  if (block) {
    return (
      <div className={className}>
        <BlockMath math={formula} />
      </div>
    );
  }
  return (
    <span className={className}>
      <InlineMath math={formula} />
    </span>
  );
}

export default MathFormula;
