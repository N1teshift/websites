import React from "react";

export const ScrollAnimations: React.FC = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // Smooth navigation
          document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
              e.preventDefault();
              const target = document.querySelector(this.getAttribute('href'));
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            });
          });

          // Fade in animation on scroll
          const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
          };

          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
              }
            });
          }, observerOptions);

          document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
          });
        `,
      }}
    />
  );
};
