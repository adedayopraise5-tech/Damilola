import React from 'react';
import { useStore } from '../context/StoreContext';
import { IMG_ATELIER_CRAFT, IMG_HERO } from '../data/seedCatalog';
import { SafeImage } from '../components/SafeImage';

export const AboutPage: React.FC = () => {
  const { openShopWithFilter, navigate } = useStore();

  return (
    <div>
      {/* Editorial Hero */}
      <section className="bg-[#141210] text-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C5A264] mb-4">
              The House of Fragrance Chamber Concept
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.08] text-balance">
              More Than a Fragrance. An Expression of You.
            </h1>
            <p className="mt-6 text-base text-[#FAF7F2]/80 leading-relaxed max-w-xl">
              At Fragrance Chamber Concept, we believe fragrance is more than just a
              scent. It is an expression of identity, a memory in the making and a
              subtle statement of elegance. Our collection is curated for those who
              appreciate the art of fragrance and the power of a memorable impression.
            </p>
          </div>
          <div className="lg:col-span-6 aspect-[4/3] overflow-hidden border border-[#2B211B]">
            <SafeImage
              src={IMG_ATELIER_CRAFT}
              alt="Fragrance Chamber Concept perfumer organ and raw materials"
            />
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-y border-[#E8DFD1] py-14">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#B69354] mb-2">
              01. Curated Provenance
            </p>
            <h2 className="font-serif text-2xl font-medium text-[#141210] mb-3">
              Rare Botanicals & Resins
            </h2>
            <p className="text-sm text-[#2B211B]/75 leading-relaxed">
              From Calabrian bergamot and Damask rose otto to aged Laotian oud and
              Madagascar vanilla pod, every composition begins with unadulterated raw
              essences.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#B69354] mb-2">
              02. Quiet Mastery
            </p>
            <h2 className="font-serif text-2xl font-medium text-[#141210] mb-3">
              Where Fragrance Becomes an Experience
            </h2>
            <p className="text-sm text-[#2B211B]/75 leading-relaxed">
              Whether worn as an alcohol-free skin oil or a 30% Extrait de Parfum, our
              scents are structured to evolve gracefully across hours rather than fade in
              minutes.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#B69354] mb-2">
              03. Individuality First
            </p>
            <h2 className="font-serif text-2xl font-medium text-[#141210] mb-3">
              A Scent That Speaks Before You Do
            </h2>
            <p className="text-sm text-[#2B211B]/75 leading-relaxed">
              We champion scents without loud logos—crafted to harmonize with your own
              chemistry and leave a poised, unmistakable signature.
            </p>
          </div>
        </div>
      </section>

      {/* Studio Showcase CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#F3EDE2]/55 border border-[#E8DFD1] p-8 lg:p-14">
          <div className="lg:col-span-6 aspect-[16/9] overflow-hidden border border-[#E8DFD1]">
            <SafeImage src={IMG_HERO} alt="Fragrance Chamber Concept signature bottles" />
          </div>
          <div className="lg:col-span-6 lg:pl-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141210]">
              Find the fragrance that feels like you.
            </h2>
            <p className="mt-3 text-sm text-[#2B211B]/75 leading-relaxed">
              Explore our complete boutique or reach out to our fragrance concierge for
              personalized scent guidance.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openShopWithFilter({})}
                className="px-6 py-3.5 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] hover:bg-[#2B211B] cursor-pointer"
              >
                Explore the Boutique
              </button>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="px-6 py-3.5 border border-[#141210] text-[#141210] text-xs uppercase tracking-[0.18em] hover:bg-[#141210]/5 cursor-pointer"
              >
                Speak With Concierge
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
