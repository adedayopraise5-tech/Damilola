import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Heart, Maximize2, Minus, Plus, ShoppingBag, Star, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { submitReview } from '../lib/firestoreService';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

export const ProductDetailsPage: React.FC<{ slug: string }> = ({ slug }) => {
  const {
    products,
    reviews,
    navigate,
    addToCart,
    toggleWishlist,
    isWishlisted,
    user,
    signInWithGoogle,
    showToast,
  } = useStore();

  const product = useMemo(
    () => products.find((p) => p.slug === slug) ?? products[0],
    [products, slug],
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Genuine review submission state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIdx(0);
      setSelectedSize(product.sizes[0]?.label || '');
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4">Fragrance not found</h1>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] cursor-pointer"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const sizeOption =
    product.sizes.find((s) => s.label === selectedSize) ?? product.sizes[0];
  const displayPrice = sizeOption?.price ?? product.price;
  const displayPreviousPrice = sizeOption?.previousPrice ?? product.previousPrice;
  const hasDiscount =
    typeof displayPreviousPrice === 'number' && displayPreviousPrice > displayPrice;

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const avgRating =
    productReviews.length > 0
      ? productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length
      : null;

  const related = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.fragranceFamily === product.fragranceFamily || p.category === product.category),
    )
    .slice(0, 3);

  const wishlisted = isWishlisted(product.id);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await signInWithGoogle();
      return;
    }
    if (comment.trim().length < 5) {
      showToast('Please write at least a brief impression (5+ characters).');
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReview({
        productId: product.id,
        productName: product.name,
        userId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Patron',
        rating,
        comment: comment.trim(),
        verifiedPurchase: false,
      });
      setComment('');
      setRating(5);
      showToast('Thank you. Your impression has been published.');
    } catch {
      showToast('Could not submit review right now. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-16">
      <button
        type="button"
        onClick={() => navigate('/shop')}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#2B211B]/70 hover:text-[#141210] mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Fragrances
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Sticky Gallery */}
        <div className="lg:col-span-6 lg:sticky lg:top-28 space-y-4">
          <div className="relative aspect-[4/3] w-full bg-[#F3EDE2] border border-[#E8DFD1] overflow-hidden group">
            <SafeImage
              src={product.images[activeImageIdx] || product.images[0]}
              alt={`${product.name} bottle view ${activeImageIdx + 1}`}
              fallbackTitle={product.name}
            />
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              aria-label="Enlarge product image"
              className="absolute bottom-3 right-3 px-3 py-2 bg-[#FAF7F2]/90 border border-[#E8DFD1] text-[11px] uppercase tracking-[0.14em] flex items-center gap-1.5 text-[#141210] hover:border-[#141210] cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Enlarge</span>
            </button>
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-[4/3] overflow-hidden border transition-colors cursor-pointer bg-[#F3EDE2] ${
                    activeImageIdx === idx
                      ? 'border-[#141210]'
                      : 'border-[#E8DFD1] opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt={`${product.name} thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-6">
          <div className="border-b border-[#E8DFD1] pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#B69354]">
              <span>{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span>{product.gender}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#141210] mt-2">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#2B211B]/70">
              {product.concentration && <span>{product.concentration}</span>}
              {product.sku && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">SKU {product.sku}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>
                {product.stock > 5
                  ? 'In Stock'
                  : product.stock > 0
                    ? `Only ${product.stock} remaining`
                    : 'Currently Sold Out'}
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-3 tabular-nums">
              <span className="text-2xl font-medium text-[#141210]">
                ${displayPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-[#2B211B]/45 line-through">
                    ${displayPreviousPrice!.toFixed(2)}
                  </span>
                  <span className="text-xs uppercase tracking-[0.14em] text-[#B69354]">
                    Save {Math.round(((displayPreviousPrice! - displayPrice) / displayPreviousPrice!) * 100)}%
                  </span>
                </>
              )}
            </div>

            {avgRating !== null && (
              <div className="mt-3 flex items-center gap-2 text-xs text-[#2B211B]">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(avgRating)
                          ? 'fill-[#B69354] text-[#B69354]'
                          : 'text-[#E8DFD1]'
                      }`}
                    />
                  ))}
                </div>
                <span className="tabular-nums">
                  {avgRating.toFixed(1)} ({productReviews.length} review
                  {productReviews.length === 1 ? '' : 's'})
                </span>
              </div>
            )}
          </div>

          <p className="text-base text-[#2B211B]/85 leading-relaxed">
            {product.description}
          </p>

          {/* Size Selection */}
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#2B211B]/70 mb-2.5">
              Select Volume
            </p>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((size) => {
                const active = size.label === sizeOption?.label;
                return (
                  <button
                    key={size.label}
                    type="button"
                    onClick={() => setSelectedSize(size.label)}
                    className={`px-5 py-3 text-xs border transition-colors cursor-pointer tabular-nums ${
                      active
                        ? 'bg-[#141210] text-[#FAF7F2] border-[#141210]'
                        : 'border-[#E8DFD1] text-[#141210] hover:border-[#141210]'
                    }`}
                  >
                    {size.label} — ${size.price.toFixed(2)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Buy Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center border border-[#E8DFD1] bg-[#F3EDE2]/40 h-12">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-11 h-full flex items-center justify-center hover:bg-[#E8DFD1]/60 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                aria-label="Increase quantity"
                className="w-11 h-full flex items-center justify-center hover:bg-[#E8DFD1]/60 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={product.stock === 0}
              onClick={() => addToCart(product, sizeOption?.label, quantity)}
              className="flex-1 min-w-[200px] h-12 px-7 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2 hover:bg-[#2B211B] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{product.stock === 0 ? 'Sold Out' : 'Add to Shopping Bag'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label="Save to wishlist"
              className={`w-12 h-12 border flex items-center justify-center transition-colors cursor-pointer ${
                wishlisted
                  ? 'bg-[#141210] text-[#C5A264] border-[#141210]'
                  : 'border-[#E8DFD1] text-[#141210] hover:border-[#141210]'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Olfactory Pyramid */}
          {(product.topNotes?.length || product.heartNotes?.length || product.baseNotes?.length) && (
            <div className="border-t border-[#E8DFD1] pt-6 space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] text-[#B69354]">
                Olfactory Architecture · {product.fragranceFamily}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F3EDE2]/45 border border-[#E8DFD1] p-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#2B211B]/60 mb-1.5">
                    Top Notes
                  </p>
                  <p className="text-sm text-[#141210]">
                    {product.topNotes?.join(' · ') || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#2B211B]/60 mb-1.5">
                    Heart Notes
                  </p>
                  <p className="text-sm text-[#141210]">
                    {product.heartNotes?.join(' · ') || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#2B211B]/60 mb-1.5">
                    Base Notes
                  </p>
                  <p className="text-sm text-[#141210]">
                    {product.baseNotes?.join(' · ') || '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {product.story && (
            <div className="border-t border-[#E8DFD1] pt-6">
              <h2 className="text-xs uppercase tracking-[0.2em] text-[#2B211B]/65 mb-2">
                Perfumer’s Note
              </h2>
              <p className="text-sm text-[#2B211B]/80 leading-relaxed">{product.story}</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-20 pt-14 border-t border-[#E8DFD1]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B69354] mb-2">
              Client Impressions
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#141210]">
              Share Your Experience
            </h2>
            <p className="mt-2 text-sm text-[#2B211B]/75">
              We publish only genuine impressions submitted by verified account holders.
            </p>

            <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-2">
                  Rating
                </p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} stars`}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'fill-[#B69354] text-[#B69354]'
                            : 'text-[#E8DFD1]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe how this fragrance wears on your skin..."
                  className="w-full p-3.5 bg-[#F3EDE2]/50 border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-3 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] hover:bg-[#2B211B] disabled:opacity-50 cursor-pointer"
              >
                {user
                  ? submittingReview
                    ? 'Publishing...'
                    : 'Submit Impression'
                  : 'Sign in with Google to Review'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7">
            {productReviews.length === 0 ? (
              <div className="border border-[#E8DFD1] bg-[#F3EDE2]/35 p-8 text-center">
                <p className="font-serif text-xl text-[#141210]">
                  No reviews yet for {product.name}
                </p>
                <p className="mt-2 text-sm text-[#2B211B]/70">
                  Be the first verified patron to share an authentic impression of this creation.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8DFD1] border-t border-[#E8DFD1]">
                {productReviews.map((rev) => (
                  <article key={rev.id} className="py-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-[#141210]">
                        {rev.authorName}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'fill-[#B69354] text-[#B69354]'
                                : 'text-[#E8DFD1]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[#2B211B]/85 leading-relaxed">
                      {rev.comment}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Creations */}
      {related.length > 0 && (
        <section className="mt-20 pt-14 border-t border-[#E8DFD1]">
          <h2 className="font-serif text-3xl font-medium text-[#141210] mb-8">
            Complementary Creations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Enlarged Image Modal */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#141210]/90 flex items-center justify-center p-6"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close enlarged view"
            className="absolute top-6 right-6 w-10 h-10 bg-[#FAF7F2] text-[#141210] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="max-w-4xl w-full aspect-[4/3] bg-[#F3EDE2] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <SafeImage
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.name}
            />
          </div>
        </div>
      )}
    </div>
  );
};
