import React from "react";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

/**
 * Parses a string containing potential LaTeX math expressions and renders them.
 * Math expressions are expected to be enclosed in single dollar signs (e.g., $x^2$).
 *
 * @param input The string to parse and render.
 * @returns An array of React elements, with math expressions rendered using InlineMath and other parts as plain text.
 */
export function parseAndRenderMath(input: string) {
  // Split the string by dollar signs ($)
  const parts = input.split(/(\$[^$]+\$)/); // Captures math parts like `$...$`

  return parts.map((part, index) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      // Strip the dollar signs and render as math
      const mathContent = part.slice(1, -1); // Remove leading/trailing $

      // Replace deprecated LaTeX commands with modern alternatives
      const modernMathContent = mathContent
        .replace(/\\mathbb\{([^}]+)\}/g, "\\mathbf{$1}") // Replace \mathbb with \mathbf
        .replace(/\\Bbb\{([^}]+)\}/g, "\\mathbf{$1}"); // Replace \Bbb with \mathbf

      return <InlineMath key={index}>{modernMathContent}</InlineMath>;
    } else {
      // Render as plain text
      return <span key={index}>{part}</span>;
    }
  });
}
