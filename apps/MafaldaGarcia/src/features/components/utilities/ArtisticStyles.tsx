import React from 'react';

export const ArtisticStyles: React.FC = () => {
  return (
    <style jsx global>{`
      :root {
        --primary-black: #0a0a0a;
        --soft-white: #fefefe;
        --warm-gray: #8e8e78;
        --accent-gold: #d4af37;
        --deep-purple: #2d1b69;
        --soft-beige: #f7f5f0;
        --text-dark: #1a1a1a;
        --text-medium: #4a4a4a;
      }

      html {
        scroll-behavior: smooth;
      }

      .font-playfair {
        font-family: 'Playfair Display', serif;
      }

      .font-inter {
        font-family: 'Inter', sans-serif;
      }

      .fade-in {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease;
      }

      .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .gradient-text {
        background: linear-gradient(135deg, var(--accent-gold) 0%, var(--warm-gray) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .hover-lift {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .hover-lift:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      .bg-artistic-dark {
        background: linear-gradient(135deg, var(--primary-black) 0%, var(--deep-purple) 100%);
      }

      .bg-artistic-light {
        background: linear-gradient(45deg, var(--soft-beige) 0%, var(--soft-white) 100%);
      }

      .text-artistic-gold {
        color: var(--accent-gold);
      }

      .text-warm-gray {
        color: var(--warm-gray);
      }

      .border-artistic-gold {
        border-color: var(--accent-gold);
      }

      .artistic-quote::before,
      .artistic-quote::after {
        content: '"';
        font-size: 4rem;
        color: var(--accent-gold);
        position: absolute;
        font-family: 'Playfair Display', serif;
      }

      .artistic-quote::before {
        top: -20px;
        left: -40px;
      }

      .artistic-quote::after {
        bottom: -40px;
        right: -40px;
      }

      .section-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, var(--accent-gold) 50%, transparent 100%);
        opacity: 0.3;
        margin: 0 auto;
        width: 80%;
        max-width: 800px;
      }

      .section-divider.dark {
        background: linear-gradient(90deg, transparent 0%, var(--warm-gray) 50%, transparent 100%);
      }

      /* Floating footer styles */
      .floating-footer-merge {
        background: linear-gradient(to bottom, transparent 0%, var(--primary-black) 100%);
      }

      @media (max-width: 768px) {
        .artistic-quote::before,
        .artistic-quote::after {
          display: none;
        }
        
        .section-divider {
          width: 90%;
        }
      }
    `}</style>
  );
};
