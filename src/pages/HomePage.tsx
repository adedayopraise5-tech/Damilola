import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FRAGRANCE_FAMILIES, IMG_ATELIER_CRAFT, IMG_GIFT_COFFRET, IMG_HERO } from '../data/seedCatalog';
import { subscribeNewsletter } from '../lib/firestoreService';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

export const HomePage: React.FC = () => {
  const {
    products,
    categories,
    settings,
    reviews,
    navigate,
    openShopWithFilter,
    addToCart,
  } = useStore();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [newsletterError, setNewsletterError] = useState('');

  const activeCategories = useMemo(
    () => categories.filter((c) => c.active).sort((a, b) => a.displayOrder - b.displayOrder),
    [categories],
  );

  const bestSellers = useMemo(
    () => products.filter((p) => p.isBestSeller).slice(0, 4),
    [products],
  );

  const newArrivals = useMemo(
    () => products.filter((p) => p.isNewArrival).slice(0, 4),
    [products],
  );

  const featuredProducts = useMemo(() => {
    if (settings.featuredProductIds && settings.featuredProductIds.length > 0) {
      const matched = settings.featuredProductIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));
      if (matched.length > 0) return matched.slice(0, 3);
    }
    return products.filter((p) => p.isFeatured).slice(0, 3);
  }, [products, settings.featuredProductIds]);

  const giftProducts = useMemo(
    () => products.filter((p) => p.isGiftWorthy || p.category === 'Gift Sets').slice(0, 3),
    [products],
  );

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newsletterEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setNewsletterState('error');
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    setNewsletterState('submitting');
    setNewsletterError('');
    try {
      await subscribeNewsletter(cleaned);
      setNewsletterState('success');
      setNewsletterEmail('');
    } catch {
      setNewsletterState('error');
      setNewsletterError('Unable to save your subscription right now. Please try again shortly.');
    }
  };

  return (
    <div>
      {/* C. Hero Section */}
      <section className="relative bg-[#141210] text-[#FAF7F2] overflow-hidden">
        <div className="relative min-h-[78vh] lg:min-h-[84vh] flex items-end lg:items-center">
          <div className="absolute inset-0">
            <SafeImage
              src={IMG_HERO}
              alt="Fragrance Chamber Concept luxury perfume flacons on dark travertine"
              className="w-full h-full object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#141210]/90 via-[#141210]/55 to-[#141210]/20"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#141210]/80 via-transparent to-transparent"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-8 py-16 lg:py-24">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.26em] text-[#C5A264] mb-4">
                Discover Your Signature Scent
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.06] tracking-tight text-balance">
                Find the Scent That Defines You.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-[#FAF7F2]/80 leading-relaxed max-w-lg">
                Explore an exquisite collection of fragrances curated to inspire
                confidence, elegance and unforgettable impressions.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => openShopWithFilter({})}
                  className="px-7 py-3.5 bg-[#FAF7F2] text-[#141210] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#C5A264] hover:text-[#141210] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Shop All Fragrances
                </button>
                <button
                  type="button"
                  onClick={() => openShopWithFilter({ category: 'Niche Fragrances' })}
                  className="px-7 py-3.5 border border-[#FAF7F2]/45 text-[#FAF7F2] text-xs uppercase tracking-[0.18em] hover:border-[#C5A264] hover:text-[#C5A264] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Explore Collections
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D. Shop by Category */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-2">
              Curated Departments
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141210]">
              Shop by Category
            </h2>
          </div>
          <p className="text-sm text-[#2B211B]/70 max-w-md">
            Where fragrance becomes an experience—browse extraits, pure oils, and giftable coffrets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                cat.slug === 'new-arrivals'
                  ? openShopWithFilter({ newArrivalsOnly: true })
                  : openShopWithFilter({ category: cat.name })
              }
              className="group text-left border border-[#E8DFD1] bg-[#F3EDE2]/40 hover:border-[#B69354] transition-colors cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F3EDE2]">
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  fallbackTitle={cat.name}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#141210] group-hover:text-[#B69354] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#2B211B]/70 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[#141210]">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* E. Best Sellers */}
      <section className="border-t border-[#E8DFD1] bg-[#F3EDE2]/35">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-2">
                Signature Creations
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141210]">
                Most Coveted Scents
              </h2>
            </div>
            <button
              type="button"
              onClick={() => openShopWithFilter({ bestSellersOnly: true })}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#141210] border-b border-[#141210] pb-1 hover:text-[#B69354] hover:border-[#B69354] transition-colors cursor-pointer self-start sm:self-auto"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* F. Shop by Fragrance Family */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-2">
            Olfactory Architecture
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141210] text-balance">
            Explore by Fragrance Family
          </h2>
          <p className="mt-3 text-sm text-[#2B211B]/75 leading-relaxed">
            Every scent tells a story. Select an olfactory profile to filter our
            cellar by the raw ingredients that speak to you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FRAGRANCE_FAMILIES.map((family) => (
            <button
              key={family.name}
              type="button"
              onClick={() => openShopWithFilter({ family: family.name })}
              className="group relative aspect-[4/3] overflow-hidden border border-[#E8DFD1] text-left cursor-pointer bg-[#141210]"
            >
              <SafeImage
                src={family.image}
                alt={`${family.name} fragrance family`}
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#141210]/90 via-[#141210]/40 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute inset-x-5 bottom-5 text-[#FAF7F2]">
                <h3 className="font-serif text-2xl font-medium">{family.name}</h3>
                <p className="mt-1 text-xs text-[#C5A264] tracking-wide">
                  {family.notes}
                </p>
                <p className="mt-1 text-xs text-[#FAF7F2]/75 line-clamp-1">
                  {family.mood}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* G. Featured Collection (Configurable from Admin) */}
      <section className="bg-[#141210] text-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <p className="text-xs uppercase tracking-[0.24em] text-[#C5A264] mb-3">
                Featured Editorial
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium leading-tight text-balance">
                {settings.featuredTitle}
              </h2>
              <p className="mt-4 text-sm text-[#FAF7F2]/75 leading-relaxed">
                {settings.featuredSubtitle}
              </p>
              <p className="mt-4 text-xs italic font-serif text-[#C5A264]">
                “Elevate your presence. Define your essence.”
              </p>
              <button
                type="button"
                onClick={() => openShopWithFilter({})}
                className="mt-8 px-6 py-3 border border-[#C5A264] text-[#C5A264] text-xs uppercase tracking-[0.18em] hover:bg-[#C5A264] hover:text-[#141210] transition-colors cursor-pointer"
              >
                Explore the Edit
              </button>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {featuredProducts.map((item) => (
                <div
                  key={item.id}
                  className="group border border-[#2B211B] bg-[#1C1815] flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${item.slug}`)}
                    className="aspect-[4/3] w-full overflow-hidden bg-[#2B211B] cursor-pointer"
                  >
                    <SafeImage
                      src={item.images[0]}
                      alt={item.name}
                      fallbackTitle={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </button>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#C5A264]">
                        {item.brand}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/product/${item.slug}`)}
                        className="mt-1 font-serif text-xl text-left text-[#FAF7F2] hover:text-[#C5A264] cursor-pointer"
                      >
                        {item.name}
                      </button>
                      <p className="mt-1 text-xs text-[#FAF7F2]/65 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-[#2B211B] flex items-center justify-between">
                      <span className="text-sm tabular-nums text-[#FAF7F2]">
                        ${item.price.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCart(item, item.sizes[0]?.label, 1)}
                        className="text-[11px] uppercase tracking-[0.16em] text-[#C5A264] hover:underline cursor-pointer"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* H. New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-2">
                Just Bottled
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141210]">
                New Arrivals
              </h2>
            </div>
            <button
              type="button"
              onClick={() => openShopWithFilter({ newArrivalsOnly: true })}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#141210] border-b border-[#141210] pb-1 hover:text-[#B69354] hover:border-[#B69354] transition-colors cursor-pointer self-start sm:self-auto"
            >
              Shop New Arrivals <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} badgeText="New Arrival" />
            ))}
          </div>
        </section>
      )}

      {/* I. Brand Story Preview */}
      <section className="border-y border-[#E8DFD1] bg-[#F3EDE2]/45">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 aspect-[4/3] overflow-hidden border border-[#E8DFD1]">
              <SafeImage
                src={IMG_ATELIER_CRAFT}
                alt="Perfumer atelier desk with amber essence vials and raw botanicals"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-6 lg:pl-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-3">
                Our Philosophy
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141210] leading-tight text-balance">
                More Than a Fragrance. An Expression of You.
              </h2>
              <p className="mt-5 text-base text-[#2B211B]/80 leading-relaxed">
                At Fragrance Chamber Concept, we believe fragrance is more than just a
                scent. It is an expression of identity, a memory in the making and a
                subtle statement of elegance. Our collection is curated for those who
                appreciate the art of fragrance and the power of a memorable impression.
              </p>
              <p className="mt-4 text-sm italic font-serif text-[#2B211B]/75">
                “A scent that speaks before you do.”
              </p>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="mt-8 px-7 py-3.5 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] hover:bg-[#2B211B] transition-colors cursor-pointer"
              >
                Discover Our Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* J. Fragrance Gift Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-3">
              Bespoke Presentation
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141210] leading-tight text-balance">
              Give the Gift of a Beautiful Scent.
            </h2>
            <p className="mt-4 text-base text-[#2B211B]/80 leading-relaxed">
              Celebrate special moments with fragrances that leave lasting impressions.
              Every gift-ready order may be dressed in our warm ivory keepsake box,
              champagne grosgrain ribbon, and handwritten note card.
            </p>

            <div className="mt-6 space-y-3 border-t border-[#E8DFD1] pt-5">
              {giftProducts.map((gift) => (
                <div
                  key={gift.id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${gift.slug}`)}
                    className="font-serif text-lg text-[#141210] hover:text-[#B69354] cursor-pointer text-left"
                  >
                    {gift.name}
                  </button>
                  <span className="tabular-nums text-[#2B211B]/80">
                    ${gift.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => openShopWithFilter({ category: 'Gift Sets' })}
              className="mt-8 px-7 py-3.5 border border-[#141210] text-[#141210] text-xs uppercase tracking-[0.18em] hover:bg-[#141210] hover:text-[#FAF7F2] transition-colors cursor-pointer"
            >
              Shop Gift Sets & Sets
            </button>
          </div>

          <div className="lg:col-span-7 aspect-[4/3] overflow-hidden border border-[#E8DFD1]">
            <SafeImage
              src={IMG_GIFT_COFFRET}
              alt="Fragrance Chamber Concept luxury keepsake gift coffret"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* K. Genuine Customer Testimonials (Rendered ONLY when genuine Firestore reviews exist) */}
      {reviews.length > 0 && (
        <section className="border-t border-[#E8DFD1] bg-[#F3EDE2]/35">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
            <div className="max-w-xl mb-12">
              <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-2">
                Client Impressions
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141210]">
                Words from Our Patrons
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((review) => (
                <article
                  key={review.id}
                  className="bg-[#FAF7F2] border border-[#E8DFD1] p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-4" aria-label={`Rated ${review.rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            idx < review.rating
                              ? 'fill-[#B69354] text-[#B69354]'
                              : 'text-[#E8DFD1]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-[#2B211B]/85 leading-relaxed">
                      “{review.comment}”
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#E8DFD1] text-xs text-[#2B211B]/70">
                    <p className="font-medium text-[#141210]">{review.authorName}</p>
                    <p className="mt-0.5">{review.productName}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* L. Newsletter Subscription */}
      <section className="border-t border-[#E8DFD1] bg-[#FAF7F2]">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-3">
            Private Dispatches
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141210]">
            Stay in the Fragrance Circle.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#2B211B]/75 max-w-lg mx-auto">
            Be the first to discover new arrivals, exclusive offers, fragrance
            inspiration and special collections.
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              aria-label="Email address"
              className="flex-1 px-4 py-3.5 bg-[#F3EDE2]/60 border border-[#E8DFD1] text-sm text-[#141210] placeholder:text-[#2B211B]/45 focus:outline-none focus:border-[#B69354]"
            />
            <button
              type="submit"
              disabled={newsletterState === 'submitting'}
              className="px-7 py-3.5 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] hover:bg-[#2B211B] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
            >
              {newsletterState === 'submitting' ? 'Joining...' : 'Subscribe'}
            </button>
          </form>

          {newsletterState === 'success' && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#2B211B]">
              <Check className="w-4 h-4 text-[#B69354]" />
              Welcome to the Fragrance Circle. Your address has been saved.
            </p>
          )}
          {newsletterState === 'error' && (
            <p className="mt-4 text-xs text-red-700">{newsletterError}</p>
          )}
        </div>
      </section>

      {/* M. Final CTA */}
      <section className="bg-[#2B211B] text-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="font-serif text-3xl sm:text-5xl font-medium text-balance">
            Your Next Signature Scent Awaits.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#FAF7F2]/80 max-w-md mx-auto">
            Explore our collection and discover the fragrance that speaks your language.
          </p>
          <button
            type="button"
            onClick={() => openShopWithFilter({})}
            className="mt-8 px-8 py-4 bg-[#C5A264] text-[#141210] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            Shop Fragrances
          </button>
        </div>
      </section>
    </div>
  );
};
