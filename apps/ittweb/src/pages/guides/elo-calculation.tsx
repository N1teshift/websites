import { getStaticPropsWithTranslations } from "@websites/infrastructure/i18n/getStaticProps";
import { ErrorBoundary, Section } from "@/features/infrastructure/components";
import { MathFormula } from "@/features/modules/content/guides/components";
import Link from "next/link";

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function EloCalculationGuide() {
  return (
    <ErrorBoundary>
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="link-amber">
            ← Back to Guides
          </Link>
        </div>

        <h1 className="font-medieval-brand text-2xl md:text-4xl mb-6">Elo Calculation</h1>
        <p className="text-gray-300 mb-8">
          Learn how the Elo rating system works on this website and how your rating changes after
          each game.
        </p>

        <Section variant="medieval">
          <h2 className="font-medieval-brand text-2xl mb-4">Overview</h2>
          <p className="text-gray-300 mb-4">
            The website uses a standard Elo rating system to track player skill levels. Elo ratings
            provide a numerical representation of a player&apos;s relative skill, allowing for fair
            matchmaking and competitive rankings.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
            <p className="text-amber-200 font-semibold mb-2">Key Points:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>
                All players start with an Elo rating of{" "}
                <strong className="text-amber-400">1000</strong>
              </li>
              <li>Ratings change after each completed game</li>
              <li>Winning against stronger opponents gives more Elo</li>
              <li>Losing to weaker opponents costs more Elo</li>
              <li>Team games use average team Elo for calculations</li>
            </ul>
          </div>
        </Section>

        <Section variant="medieval">
          <h2 className="font-medieval-brand text-2xl mb-4">How Elo Changes</h2>
          <p className="text-gray-300 mb-4">
            After each game, your Elo rating is updated based on the result and the strength of your
            opponents. The calculation uses the following formula:
          </p>

          <div className="bg-black/40 border border-amber-500/30 rounded-lg p-6 mb-4">
            <div className="text-amber-400 mb-3 font-semibold">Expected Score Formula:</div>
            <div className="mb-6 flex justify-center">
              <MathFormula
                formula="E = \dfrac{1}{1 + 10^{\dfrac{R_o - R_p}{400}}}"
                block
                className="text-gray-200"
              />
            </div>
            <div className="text-xs text-gray-400 mb-4 text-center">
              Where <MathFormula formula="E" /> is the expected score, <MathFormula formula="R_p" />{" "}
              is your Elo rating, and <MathFormula formula="R_o" /> is your opponent&apos;s Elo
              rating
            </div>

            <div className="text-amber-400 mb-3 mt-6 font-semibold">Elo Change Formula:</div>
            <div className="mb-4 flex justify-center">
              <MathFormula formula="\Delta R = K \times (S - E)" block className="text-gray-200" />
            </div>
            <div className="text-sm text-gray-400 text-center">
              Where <MathFormula formula="K = 32" /> (the K-factor), <MathFormula formula="S" /> is
              the actual score (1 for win, 0 for loss, 0.5 for draw), and{" "}
              <MathFormula formula="E" /> is the expected score
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-green-400 mb-2">Winning</h3>
              <p className="text-gray-300 text-sm">
                When you win, you gain Elo. The amount depends on your opponent&apos;s rating:
              </p>
              <ul className="list-disc list-inside text-gray-300 text-sm mt-2 space-y-1">
                <li>Beating a stronger opponent (higher Elo) = More Elo gained</li>
                <li>Beating a weaker opponent (lower Elo) = Less Elo gained</li>
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-red-400 mb-2">Losing</h3>
              <p className="text-gray-300 text-sm">
                When you lose, you lose Elo. The amount depends on your opponent&apos;s rating:
              </p>
              <ul className="list-disc list-inside text-gray-300 text-sm mt-2 space-y-1">
                <li>Losing to a stronger opponent (higher Elo) = Less Elo lost</li>
                <li>Losing to a weaker opponent (lower Elo) = More Elo lost</li>
              </ul>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-400 mb-2">Draws</h3>
              <p className="text-gray-300 text-sm">
                In the case of a draw, both players receive a score of 0.5, and Elo changes are
                calculated accordingly. Draws typically result in smaller Elo changes compared to
                wins or losses.
              </p>
            </div>
          </div>
        </Section>

        <Section variant="medieval">
          <h2 className="font-medieval-brand text-2xl mb-4">Team Games</h2>
          <p className="text-gray-300 mb-4">
            In team-based games, the Elo system calculates ratings using team averages:
          </p>
          <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-4">
            <li>The average Elo of all players on each team is calculated</li>
            <li>
              Each player&apos;s Elo change is calculated against the opposing team&apos;s average
              Elo
            </li>
            <li>
              All players on the winning team gain Elo, all players on the losing team lose Elo
            </li>
            <li>Players on the same team receive the same Elo change amount</li>
          </ol>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              <strong>Example:</strong> If Team A has an average Elo of 1200 and Team B has an
              average Elo of 1000, and Team A wins, each player on Team A will gain Elo based on
              beating a 1000-rated team, while each player on Team B will lose Elo based on losing
              to a 1200-rated team.
            </p>
          </div>
        </Section>

        <Section variant="medieval">
          <h2 className="font-medieval-brand text-2xl mb-4">System Parameters</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-amber-500/20">
              <span className="text-gray-300">Starting Elo</span>
              <span className="text-amber-400 font-semibold">1000</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-amber-500/20">
              <span className="text-gray-300">K-Factor</span>
              <span className="text-amber-400 font-semibold">32</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-amber-500/20">
              <span className="text-gray-300">Rating Scale</span>
              <span className="text-amber-400 font-semibold">400 (Elo difference divisor)</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            The K-factor of 32 means that the maximum Elo change in a single game is 32 points (when
            beating a much stronger opponent or losing to a much weaker one). In practice, most
            games result in Elo changes between 10-25 points.
          </p>
        </Section>

        <Section variant="medieval">
          <h2 className="font-medieval-brand text-2xl mb-4">Categories</h2>
          <p className="text-gray-300 mb-4">
            The website supports separate Elo ratings for different game categories. This allows
            players to have different skill ratings for different types of games or game modes. Your
            Elo is tracked per category, so you can excel in one category while having a different
            rating in another.
          </p>
        </Section>
      </div>
    </ErrorBoundary>
  );
}
