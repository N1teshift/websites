import React from "react";

export const PerformancesSection: React.FC = () => {
  return (
    <section id="performances" className="py-20 lg:py-32 bg-artistic-light">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="font-playfair text-5xl lg:text-6xl text-center mb-20 text-gray-900">
          Artistic Performances and Collaborations
        </h2>
        <div className="max-w-4xl mx-auto space-y-8 text-lg leading-relaxed text-gray-700">
          <p>
            Throughout my career, I have had the privilege of collaborating with diverse artists,
            institutions, and communities across different countries and cultural contexts. These
            collaborations have enriched my practice and expanded my understanding of performance as
            a universal language.
          </p>
          <p>
            My work has been presented at international festivals, galleries, and unconventional
            spaces, including street theater festivals, contemporary art venues, and community
            centers. Each performance is a unique encounter between the artist, the space, and the
            audience.
          </p>
          <p>
            Notable collaborations include partnerships with Sofia Lacerda (multidisciplinary artist
            and finalist of the Prémio Sonae Media Arte 2022), Rui Alemão (sound artist), and
            various collectives focused on feminist art and social engagement.
          </p>
          <p>
            My performances have been featured at events such as the XXII INTERNATIONAL STREET
            THEATRE FESTIVAL "ŠERMUKŠNIS" in Klaipeda, Lithuania, and various contemporary art
            exhibitions showcasing women artists and experimental performance practices.
          </p>
        </div>
      </div>
    </section>
  );
};
