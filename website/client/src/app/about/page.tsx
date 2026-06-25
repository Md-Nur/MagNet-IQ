import { ExternalLink, Layers, ShieldAlert, TrendingUp } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          About <span className="gradient-text">MagNet-IQ</span>
        </h1>
        <p className="mt-3 text-base text-magnet-muted">
          Machine Learning screening pipeline for the discovery of
          next-generation permanent magnets.
        </p>
      </div>

      <div className="space-y-12">
        {/* Project Overview */}
        <section className="glass rounded-2xl p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-magnet-blue" /> Project Overview &
            Motivation
          </h2>
          <p className="text-sm text-magnet-text/80 leading-relaxed">
            Permanent magnets are the silent workhorses of the modern green
            transition, serving as critical components in electric vehicle (EV)
            drivetrains, wind turbine generators, and precision electronics.
            However, conventional high-strength magnets rely heavily on critical
            Rare Earth Elements (REEs) like Neodymium (Nd), Dysprosium (Dy), and
            Samarium (Sm).
          </p>
          <p className="text-sm text-magnet-text/80 leading-relaxed">
            MagNet-IQ is a machine learning-based intelligence platform designed
            to rapidly evaluate, filter, and discover alternative permanent
            magnet materials. By leveraging public crystal databases and
            predictive analytics, MagNet-IQ bypasses expensive, time-consuming
            density functional theory (DFT) calculations.
          </p>
        </section>

        {/* Research Direction */}
        <section className="glass rounded-2xl p-6 md:p-8 space-y-4 border-l-4 border-magnet-green">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-magnet-green" /> Critical
            Supply Chain Risks (Rare-Earth-Free)
          </h2>
          <p className="text-sm text-magnet-text/80 leading-relaxed">
            Currently, global mining and refining of heavy rare earths are
            heavily centralized, with a single country controlling over 60% of
            mining and 90% of magnet production. This geopolitical
            centralization exposes critical technologies to severe supply chain
            risks.
          </p>
          <p className="text-sm text-magnet-text/80 leading-relaxed">
            MagNet-IQ focuses specifically on identifying{" "}
            <strong>Rare-Earth-Free</strong> magnetic compounds (combining
            Transition Metals like Fe, Co, and Mn with common abundant alloys).
            Exploring this chemical space offers the potential to discover
            sustainable, high-flux materials suitable for automotive and
            industrial settings.
          </p>
        </section>

        {/* Pipeline & Dataset */}
        <section className="glass rounded-2xl p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-magnet-purple" /> Dataset &
            Model Details
          </h2>
          <p className="text-sm text-magnet-text/80 leading-relaxed">
            The dataset was constructed by querying 52,205 ferromagnetic
            compounds from the Materials Project API. After applying filters to
            isolate compounds with structural, thermodynamic, and density
            properties viable for permanent magnet candidacy, 28,472 records
            were selected.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Model Specification</th>
                  <th>Configuration / Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold text-white">Algorithm</td>
                  <td>Random Forest Regressor (v2)</td>
                </tr>
                <tr>
                  <td className="font-semibold text-white">
                    Total Features Used
                  </td>
                  <td className="font-mono">25 engineered columns</td>
                </tr>
                <tr>
                  <td className="font-semibold text-white">
                    Cross-Validation R²
                  </td>
                  <td className="font-mono text-magnet-blue font-bold">
                    0.8903
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold text-white">
                    Cross-Validation MAE
                  </td>
                  <td className="font-mono">2.36 μB</td>
                </tr>
                <tr>
                  <td className="font-semibold text-white">
                    Training Sample Count
                  </td>
                  <td className="font-mono">22,777 rows</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Developer & RU Info */}
        <section className="glass rounded-2xl p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-bold text-white">Developer Profile</h2>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Image
              src="/pic.jpeg"
              alt="Developer Profile Picture"
              width={120}
              height={120}
              className="rounded-full"
            />
            <div>
              <h3 className="font-bold text-lg text-white">
                Electrical & Electronic Engineering (EEE)
              </h3>
              <p className="text-xs text-magnet-muted">
                University of Rajshahi, Bangladesh
              </p>
              <p className="text-sm text-magnet-text/80 mt-3 leading-relaxed">
                Specializing in materials science, machine learning, and
                web development. This dashboard forms part of a thesis
                research project mapping potential non-rare-earth compound
                formulations for electric motor topologies.
              </p>
            </div>
          </div>
        </section>

        {/* External Links */}
        <section className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="https://github.com/Md-Nur/MagNet-IQ"
            target="_blank"
            className="btn-outline flex items-center gap-2 text-xs w-full sm:w-auto justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            GitHub Repository
          </a>
          <a
            href="https://huggingface.co/spaces/nur9211/MagNet-IQ"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline flex items-center gap-2 text-xs w-full sm:w-auto justify-center"
          >
            <ExternalLink className="h-4 w-4 text-magnet-blue" /> Hugging Face
            Space
          </a>
          <a
            href="https://huggingface.co/nur9211/MagNet-IQ"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline flex items-center gap-2 text-xs w-full sm:w-auto justify-center"
          >
            <ExternalLink className="h-4 w-4 text-magnet-purple" /> Hugging Face
            Model Repo
          </a>
        </section>
      </div>
    </div>
  );
}
