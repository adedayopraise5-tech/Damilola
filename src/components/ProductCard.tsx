import React from 'react';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types/store';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
  badgeText?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, badgeText }) => {
  const {
    navigate,
    addToCart,
    toggleWishlist,
    isWishlisted,
    setQuickViewProduct,
    reviews,
  } = useStore();

  const wishlisted = isWishlisted(product.id);
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const avgRating =
    productReviews.length > 0
      ? productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length
      : null;

  const hasDiscount =
    typeof product.previousPrice === 'number' && product.previousPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.previousPrice! - product.price) / product.previousPrice!) * 100)
    : 0;

  const secondaryImage = product.images[1];

  return (
    <article className="group flex flex-col bg-transparent transition-transform duration-200 hover:-translate-y-0.5">
      {/* 4:3 Studio Frame */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3EDE2] border border-[#E8DFD1]">
        <button
          type="button"
          onClick={() => navigate(`/product/${product.slug}`)}
          className="block w-full h-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B69354]"
          aria-label={`View details for ${product.name}`}
        >
          <SafeImage
            src={product.images[0]}
            alt={`${product.name} by ${product.brand}`}
            fallbackTitle={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              secondaryImage
                ? 'group-hover:opacity-0 group-hover:scale-[1.03]'
                : 'group-hover:scale-[1.03]'
            }`}
          />
          {secondaryImage && (
            <SafeImage
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fallbackTitle={product.name}
              className="absolute inset-0 w-full h-full object-cover opacity-0 scale-[1.03] group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"
            />
          )}
        </button>

        {/* Quiet Single Editorial Label (Zero-Pill Discipline) */}
        {(badgeText || hasDiscount || product.stock === 0) && (
          <span className="absolute top-3 left-3 bg-[#FAF7F2]/92 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-[#141210] border border-[#E8DFD1]">
            {product.stock === 0
              ? 'Sold Out'
              : badgeText
                ? badgeText
                : `Save ${discountPct}%`}
          </span>
        )}

        {/* Top-Right Wishlist & Quick View Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className={`w-9 h-9 flex items-center justify-center border transition-colors cursor-pointer ${
              wishlisted
                ? 'bg-[#141210] text-[#C5A264] border-[#141210]'
                : 'bg-[#FAF7F2]/90 text-[#141210] border-[#E8DFD1] hover:border-[#141210]'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setQuickViewProduct(product)}
            aria-label={`Quick view ${product.name}`}
            className="w-9 h-9 flex items-center justify-center bg-[#FAF7F2]/90 text-[#141210] border border-[#E8DFD1] hover:border-[#141210] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Hover Quick Add */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus-within:opacity-100 transition-all duration-200">
          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() => addToCart(product, product.sizes[0]?.label, 1)}
            className="w-full py-2.5 px-4 bg-[#141210]/95 text-[#FAF7F2] text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 hover:bg-[#2B211B] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.stock === 0 ? 'Out of Stock' : 'Quick Add to Bag'}</span>
          </button>
        </div>
      </div>

      {/* Product Metadata & Pricing */}
      <div className="pt-4 flex-1 flex flex-col justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[#2B211B]/65">
            <span className="truncate">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.category}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/product/${product.slug}`)}
            className="mt-1 text-left font-serif text-xl font-medium text-[#141210] hover:text-[#B69354] transition-colors cursor-pointer block w-full truncate"
          >
            {product.name}
          </button>

          <p className="mt-0.5 text-xs text-[#2B211B]/65">
            {product.sizes.map((s) => s.label).join(' · ')}
          </p>
        </div>

        <div className="pt-1 flex items-center justify-between gap-3 border-t border-[#E8DFD1]/80 mt-2">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-[15px] font-medium text-[#141210]">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#2B211B]/50 line-through">
                ${product.previousPrice!.toFixed(2)}
              </span>
            )}
          </div>

          {avgRating !== null ? (
            <div className="flex items-center gap-1 text-xs text-[#2B211B]/80 tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[#B69354] text-[#B69354]" />
              <span>{avgRating.toFixed(1)}</span>
              <span className="text-[#2B211B]/50">({productReviews.length})</span>
            </div>
          ) : (
            <span className="text-[11px] text-[#2B211B]/55 uppercase tracking-[0.1em]">
              {product.fragranceFamily}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
