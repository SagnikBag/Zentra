import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import { useCart } from '../../cart/hook/useCart';
import { ProductCardSkeleton } from '../../../components/ui/Skeleton';

/* ================================================================
   ICONS — inline SVGs for zero-dependency icons
   ================================================================ */

const ArrowRightIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
);

const HeartIcon = ({ filled, className = 'w-5 h-5' }) =>
    filled ? (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
    ) : (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    );

const StarIcon = ({ filled, className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);

const CartPlusIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
);

const ChevronLeftIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const VerifiedIcon = ({ className = 'w-3.5 h-3.5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
);

/* ================================================================
   HELPERS
   ================================================================ */

function formatPrice(price) {
    if (!price) return '$0';
    const amount = parseFloat(price.amount || 0);
    const currency = price.currency || 'USD';
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
}

function formatOriginalPrice(price) {
    if (!price) return null;
    const amount = parseFloat(price.amount || 0);
    const inflated = amount * 1.35;
    const currency = price.currency || 'USD';
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(inflated);
    } catch {
        return `${currency} ${inflated.toFixed(2)}`;
    }
}

/* ================================================================
   STATIC DATA
   ================================================================ */

const CATEGORIES = [
    {
        name: 'Electronics', icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
        ), color: 'from-blue-500/20 to-blue-600/5'
    },
    {
        name: 'Fashion', icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
        ), color: 'from-pink-500/20 to-pink-600/5'
    },
    {
        name: 'Shoes', icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V15m0 0l-2.25 1.313" />
            </svg>
        ), color: 'from-amber-500/20 to-amber-600/5'
    },
    {
        name: 'Accessories', icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
        ), color: 'from-purple-500/20 to-purple-600/5'
    },
    {
        name: 'Home & Living', icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
        ), color: 'from-emerald-500/20 to-emerald-600/5'
    },
    {
        name: 'Beauty', icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.764m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
        ), color: 'from-rose-500/20 to-rose-600/5'
    },
];

const TESTIMONIALS = [
    { name: 'Arjun Mehta', initials: 'AM', rating: 5, review: 'Absolutely love the quality! Ordered shoes and accessories — arrived perfectly packaged within 3 days. The whole experience felt premium.', verified: true },
    { name: 'Priya Sharma', initials: 'PS', rating: 5, review: 'Zentra has become my go-to marketplace. The product curation is excellent and checkout with Razorpay is seamless. Highly recommend!', verified: true },
    { name: 'Rahul Verma', initials: 'RV', rating: 4, review: 'Great selection of electronics at competitive prices. Customer support was very responsive when I had a question about my order.', verified: true },
    { name: 'Sneha Patel', initials: 'SP', rating: 5, review: 'Finally a marketplace that feels modern and trustworthy. The verified seller system gives me so much confidence shopping here.', verified: true },
];

const WHY_CHOOSE_US = [
    {
        title: 'Free Shipping',
        desc: 'Free delivery on orders above ₹499. No hidden charges, ever.',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
        ),
    },
    {
        title: 'Secure Payment',
        desc: 'Encrypted transactions powered by Razorpay. Your data stays safe.',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
    },
    {
        title: 'Easy Returns',
        desc: '7-day hassle-free returns. No questions asked, full refund guaranteed.',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
        ),
    },
    {
        title: '24/7 Support',
        desc: 'Round-the-clock customer service via chat, email, or phone.',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
        ),
    },
];

/* ================================================================
   COUNTDOWN HOOK
   ================================================================ */

function useCountdown() {
    const getTimeLeft = useCallback(() => {
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const diff = endOfDay - now;
        if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
        return {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        };
    }, []);

    const [timeLeft, setTimeLeft] = useState(getTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [getTimeLeft]);

    return timeLeft;
}

/* ================================================================
   STAR RATING COMPONENT
   ================================================================ */

function StarRating({ rating = 0, size = 'w-4 h-4' }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= rating} className={`${size} ${star <= rating ? 'text-[#f59e0b]' : 'text-[#3f3f46]'}`} />
            ))}
        </div>
    );
}

/* ================================================================
   SECTION HEADING COMPONENT
   ================================================================ */

function SectionHeading({ badge, title, subtitle }) {
    return (
        <div className="text-center mb-12">
            {badge && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-3 py-1.5 rounded-full mb-4">
                    {badge}
                </span>
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-[#fafafa] tracking-tight mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {title}
            </h2>
            {subtitle && (
                <p className="text-[#a1a1aa] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
            )}
        </div>
    );
}

/* ================================================================
   PRODUCT CARD COMPONENT
   ================================================================ */

function ProductCard({ product, onView, onAddToCart, isWishlisted, onToggleWishlist, index = 0 }) {
    const mainImage = product.images?.[0]?.url;
    const price = formatPrice(product.price);
    const originalPrice = formatOriginalPrice(product.price);
    const hasDiscount = !!product.price?.amount;

    return (
        <div
            className="group bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] hover:-translate-y-1 flex flex-col z-animate-fade-in-up"
            style={{ animationDelay: `${index * 0.06}s` }}
        >
            {/* Image */}
            <div className="relative h-56 bg-[#09090b] overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => onView(product._id)}>
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#3f3f46]">
                        <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <span className="text-xs text-[#52525b]">No image</span>
                    </div>
                )}

                {/* Discount badge */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-[#f59e0b] text-[#09090b] font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-lg">
                        26% OFF
                    </div>
                )}

                {/* Wishlist button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleWishlist(product._id); }}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-sm ${isWishlisted
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-[#09090b]/70 text-[#a1a1aa] border border-[#3f3f46]/60 hover:text-red-400 hover:border-red-500/30'
                        }`}
                    aria-label="Toggle wishlist"
                >
                    <HeartIcon filled={isWishlisted} className="w-4 h-4" />
                </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex-1">
                    <h3
                        className="font-semibold text-[#fafafa] text-sm leading-snug line-clamp-2 group-hover:text-[#f59e0b] transition-colors duration-200 mb-2 cursor-pointer"
                        onClick={() => onView(product._id)}
                    >
                        {product.title || 'Untitled Product'}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                        <StarRating rating={4} size="w-3.5 h-3.5" />
                        <span className="text-[11px] text-[#71717a]">(4.0)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#fafafa]">{price}</span>
                        {originalPrice && (
                            <span className="text-sm text-[#52525b] line-through">{originalPrice}</span>
                        )}
                    </div>
                </div>

                {/* Add to Cart */}
                <button
                    onClick={() => onAddToCart(product)}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] text-sm font-semibold rounded-xl hover:bg-[#f59e0b] hover:text-[#09090b] transition-all duration-200 cursor-pointer active:scale-[0.98]"
                >
                    <CartPlusIcon className="w-4 h-4" />
                    Add to Cart
                </button>
            </div>
        </div>
    );
}

/* ================================================================
   TRENDING PRODUCT CARD (compact for carousel)
   ================================================================ */

function TrendingCard({ product, onView, onAddToCart, index = 0 }) {
    const mainImage = product.images?.[0]?.url;
    const price = formatPrice(product.price);

    return (
        <div
            className="flex-shrink-0 w-64 md:w-72 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] snap-start"
        >
            <div className="relative h-48 bg-[#09090b] overflow-hidden cursor-pointer" onClick={() => onView(product._id)}>
                {mainImage ? (
                    <img src={mainImage} alt={product.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#3f3f46]">
                        <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                    </div>
                )}
            </div>
            <div className="p-4">
                <h4 className="text-sm font-semibold text-[#fafafa] line-clamp-1 mb-1 cursor-pointer hover:text-[#f59e0b] transition-colors duration-200" onClick={() => onView(product._id)}>
                    {product.title || 'Untitled'}
                </h4>
                <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={4} size="w-3 h-3" />
                    <span className="text-[10px] text-[#71717a]">(4.0)</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                    <span className="text-base font-bold text-[#fafafa]">{price}</span>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="w-9 h-9 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] flex items-center justify-center hover:bg-[#f59e0b] hover:text-[#09090b] transition-all duration-200 cursor-pointer"
                        aria-label="Add to cart"
                    >
                        <CartPlusIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ================================================================
   HOME PAGE
   ================================================================ */

const Home = () => {
    const { handleGetAllProducts } = useProduct();
    const { handleAddItem } = useCart();
    const navigate = useNavigate();

    const rawProducts = useSelector(state => state.product.products);
    const user = useSelector(state => state.auth.user);
    const products = useMemo(() => {
        if (Array.isArray(rawProducts)) return rawProducts;
        if (rawProducts && Array.isArray(rawProducts.products)) return rawProducts.products;
        return [];
    }, [rawProducts]);

    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState(new Set());
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

    const carouselRef = useRef(null);

    // Fetch products on mount
    useEffect(() => {
        (async () => {
            setLoading(true);
            try { await handleGetAllProducts(); }
            catch (err) { console.error('Failed to fetch products:', err); }
            finally { setLoading(false); }
        })();
    }, []);

    // Featured products = first 8
    const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

    // Trending products = shuffled differently (reverse + offset for variety)
    const trendingProducts = useMemo(() => {
        if (products.length <= 4) return [...products];
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(12, products.length));
    }, [products]);

    // Countdown
    const timeLeft = useCountdown();

    // Handlers
    const toggleWishlist = useCallback((id) => {
        setWishlist(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleAddToCart = useCallback(async (product) => {
        if (!user) {
            navigate('/login');
            return;
        }
        const variant = product.variants?.[0];
        try {
            await handleAddItem({
                productId: product._id,
                variantId: variant?._id,
                quantity: 1,
            });
        } catch (err) {
            console.error('Add to cart failed:', err);
        }
    }, [user, handleAddItem, navigate]);

    const scrollCarousel = (direction) => {
        if (!carouselRef.current) return;
        const scrollAmount = 300;
        carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    };

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (newsletterEmail.trim()) {
            setNewsletterSubmitted(true);
            setNewsletterEmail('');
            setTimeout(() => setNewsletterSubmitted(false), 4000);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa]">

            {/* ═══════════════════════════════════════════════════════════
         1. HERO SECTION
         ═══════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden">
                {/* Ambient glows */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#f59e0b]/5 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/6 w-[500px] h-[400px] bg-[#f59e0b]/3 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-purple-500/3 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-20 md:py-32 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left content */}
                        <div className="z-animate-fade-in-up">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-3 mb-8">
                                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-3 py-1.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
                                    New Collection 2025
                                </span>
                                <span className="text-[11px] font-mono uppercase tracking-widest text-[#52525b]">
                                    UP TO 50% OFF
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight text-[#fafafa] leading-[1.08] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                Elevate Your{' '}
                                <span className="text-[#f59e0b]">Style</span>
                                <br />
                                With Premium Picks.
                            </h1>

                            <p className="text-[#a1a1aa] text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
                                Discover handpicked products from verified sellers. Premium quality, seamless checkout, and doorstep delivery — all in one place.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-wrap items-center gap-4">
                                <a
                                    href="#featured"
                                    className="inline-flex items-center gap-2.5 px-7 py-4 bg-[#f59e0b] text-[#09090b] font-bold text-sm rounded-xl hover:bg-[#d97706] transition-all duration-200 shadow-[0_8px_24px_rgba(245,158,11,0.3)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.5)] active:scale-[0.98]"
                                >
                                    Shop Now
                                    <ArrowRightIcon className="w-4 h-4" />
                                </a>
                                <a
                                    href="#categories"
                                    className="inline-flex items-center gap-2.5 px-7 py-4 bg-transparent text-[#a1a1aa] font-semibold text-sm border border-[#3f3f46] rounded-xl hover:border-[#52525b] hover:text-[#fafafa] transition-all duration-200"
                                >
                                    Explore Collection
                                </a>
                            </div>

                            {/* Trust badges */}
                            <div className="flex items-center gap-6 mt-10">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-[#fafafa]">{products.length}+</span>
                                    <span className="text-xs text-[#71717a] leading-tight">Premium<br />Products</span>
                                </div>
                                <div className="w-px h-8 bg-[#27272a]" />
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-[#fafafa]">500+</span>
                                    <span className="text-xs text-[#71717a] leading-tight">Happy<br />Customers</span>
                                </div>
                                <div className="w-px h-8 bg-[#27272a]" />
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-[#fafafa]">4.8</span>
                                    <span className="text-xs text-[#71717a] leading-tight">Average<br />Rating</span>
                                </div>
                            </div>
                        </div>

                        {/* Right visual */}
                        <div className="hidden lg:block relative z-animate-slide-right">
                            <div className="relative">
                                {/* Decorative card background */}
                                <div className="w-full aspect-[4/5] rounded-3xl bg-gradient-to-br from-[#18181b] to-[#27272a] border border-[#3f3f46]/50 shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden">
                                    {/* Show first product image if available */}
                                    {products[0]?.images?.[0]?.url ? (
                                        <img
                                            src={products[0].images[0].url}
                                            alt="Featured product"
                                            className="w-full h-full object-cover opacity-80"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-20 h-20 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center mx-auto mb-4">
                                                    <svg className="w-10 h-10 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                                                    </svg>
                                                </div>
                                                <p className="text-[#52525b] text-sm">Premium Collection</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
                                </div>

                                {/* Floating discount badge */}
                                <div className="absolute -bottom-4 -left-4 bg-[#f59e0b] text-[#09090b] font-bold text-sm px-5 py-3 rounded-xl shadow-[0_8px_24px_rgba(245,158,11,0.4)] z-10">
                                    UP TO 50% OFF
                                </div>

                                {/* Floating product count badge */}
                                <div className="absolute -top-3 -right-3 bg-[#18181b] border border-[#3f3f46] text-[#fafafa] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg z-10">
                                    <span className="text-[#f59e0b] font-bold">{products.length}</span> Products Live
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
         2. SHOP BY CATEGORY
         ═══════════════════════════════════════════════════════════ */}
            {/* <section id="categories" className="bg-[#0d0d10] border-y border-[#18181b]">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-20">
                    <SectionHeading
                        badge="Categories"
                        title="Shop by Category"
                        subtitle="Browse our curated collections across popular categories"
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {CATEGORIES.map((cat, i) => (
                            <div
                                key={cat.name}
                                className={`group relative bg-[#18181b] border border-[#27272a] hover:border-[#f59e0b]/30 rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] z-animate-fade-in-up`}
                                style={{ animationDelay: `${i * 0.08}s` }}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} border border-[#3f3f46]/50 flex items-center justify-center text-[#a1a1aa] group-hover:text-[#f59e0b] transition-colors duration-300 mb-4`}>
                                    {cat.icon}
                                </div>
                                <span className="text-sm font-semibold text-[#a1a1aa] group-hover:text-[#fafafa] transition-colors duration-200">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* ═══════════════════════════════════════════════════════════
         3. FEATURED PRODUCTS
         ═══════════════════════════════════════════════════════════ */}
            <section id="featured" className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-20">
                <SectionHeading
                    badge="Featured"
                    title="Featured Products"
                    subtitle="Handpicked premium products from our top verified sellers"
                />

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                ) : featuredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-2xl bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#52525b] mx-auto mb-5">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-[#fafafa] mb-2">No products yet</h3>
                        <p className="text-sm text-[#71717a]">Check back soon for amazing products!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {featuredProducts.map((product, i) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                index={i}
                                onView={(id) => navigate(`/product/${id}`)}
                                onAddToCart={handleAddToCart}
                                isWishlisted={wishlist.has(product._id)}
                                onToggleWishlist={toggleWishlist}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ═══════════════════════════════════════════════════════════
         4. DEALS / FLASH SALE
         ═══════════════════════════════════════════════════════════ */}
            <section className="bg-gradient-to-r from-[#18181b] via-[#1a1a1f] to-[#18181b] border-y border-[#27272a]">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-16">
                    <div className="relative rounded-3xl bg-gradient-to-br from-[#f59e0b]/10 via-[#f59e0b]/5 to-transparent border border-[#f59e0b]/20 overflow-hidden">
                        {/* Glow */}
                        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-[#f59e0b]/8 rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
                            {/* Left: Text */}
                            <div>
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-3 py-1.5 rounded-full mb-4">
                                    ⚡ Flash Sale
                                </span>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-[#fafafa] tracking-tight mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    Today's Best Deals
                                </h2>
                                <p className="text-[#a1a1aa] text-base mb-6 max-w-md">
                                    Don't miss out on exclusive discounts. Limited time offers on premium products across all categories.
                                </p>

                                {/* Countdown */}
                                <div className="flex items-center gap-3 mb-8">
                                    {[
                                        { value: timeLeft.hours, label: 'HRS' },
                                        { value: timeLeft.minutes, label: 'MIN' },
                                        { value: timeLeft.seconds, label: 'SEC' },
                                    ].map((unit, i) => (
                                        <React.Fragment key={unit.label}>
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-[#09090b] border border-[#3f3f46] rounded-xl flex items-center justify-center">
                                                    <span className="text-2xl font-bold font-mono text-[#fafafa]">
                                                        {String(unit.value).padStart(2, '0')}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-mono text-[#52525b] mt-1.5 tracking-widest">{unit.label}</span>
                                            </div>
                                            {i < 2 && <span className="text-xl font-bold text-[#3f3f46] mt-[-16px]">:</span>}
                                        </React.Fragment>
                                    ))}
                                </div>

                                <a
                                    href="#featured"
                                    className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#f59e0b] text-[#09090b] font-bold text-sm rounded-xl hover:bg-[#d97706] transition-all duration-200 shadow-[0_8px_24px_rgba(245,158,11,0.3)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.5)] active:scale-[0.98]"
                                >
                                    Shop Deals
                                    <ArrowRightIcon className="w-4 h-4" />
                                </a>
                            </div>

                            {/* Right: Visual */}
                            <div className="hidden md:flex items-center justify-center">
                                <div className="relative">
                                    <div className="w-48 h-48 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-5xl font-extrabold text-[#f59e0b]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>50%</div>
                                            <div className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-wider mt-1">OFF</div>
                                        </div>
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#f59e0b] rounded-full flex items-center justify-center text-[#09090b] text-xs font-bold shadow-[0_4px_12px_rgba(245,158,11,0.5)] animate-bounce">
                                        ⚡
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
         5. TRENDING PRODUCTS (Horizontal Carousel)
         ═══════════════════════════════════════════════════════════ */}
            {!loading && trendingProducts.length > 0 && (
                <section className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-20">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-3 py-1.5 rounded-full mb-4">
                                🔥 Trending
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#fafafa] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                Trending Now
                            </h2>
                            <p className="text-[#a1a1aa] text-base mt-2">Most popular products this week</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <button
                                onClick={() => scrollCarousel('left')}
                                className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa] hover:text-[#fafafa] flex items-center justify-center transition-all duration-200 cursor-pointer"
                                aria-label="Scroll left"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => scrollCarousel('right')}
                                className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa] hover:text-[#fafafa] flex items-center justify-center transition-all duration-200 cursor-pointer"
                                aria-label="Scroll right"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div
                        ref={carouselRef}
                        className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {trendingProducts.map((product, i) => (
                            <TrendingCard
                                key={product._id + '-trending'}
                                product={product}
                                index={i}
                                onView={(id) => navigate(`/product/${id}`)}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ═══════════════════════════════════════════════════════════
         6. WHY CHOOSE US
         ═══════════════════════════════════════════════════════════ */}
            <section className="bg-[#0d0d10] border-y border-[#18181b]">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-20">
                    <SectionHeading
                        badge="Why Zentra"
                        title="Why Choose Us"
                        subtitle="We go the extra mile to ensure a premium shopping experience"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {WHY_CHOOSE_US.map((item, i) => (
                            <div
                                key={item.title}
                                className="bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] z-animate-fade-in-up"
                                style={{ animationDelay: `${i * 0.08}s` }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] mb-5">
                                    {item.icon}
                                </div>
                                <h3 className="text-base font-semibold text-[#fafafa] mb-2">{item.title}</h3>
                                <p className="text-sm text-[#71717a] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
         7. CUSTOMER REVIEWS
         ═══════════════════════════════════════════════════════════ */}
            <section className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-20">
                <SectionHeading
                    badge="Testimonials"
                    title="What Our Customers Say"
                    subtitle="Real reviews from verified Zentra shoppers"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {TESTIMONIALS.map((t, i) => (
                        <div
                            key={t.name}
                            className="bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] z-animate-fade-in-up"
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            {/* Stars */}
                            <StarRating rating={t.rating} />

                            {/* Review text */}
                            <p className="text-sm text-[#a1a1aa] leading-relaxed mt-4 mb-6 line-clamp-4">
                                "{t.review}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-4 border-t border-[#27272a]">
                                <div className="w-10 h-10 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] text-xs font-bold shrink-0">
                                    {t.initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-[#fafafa]">{t.name}</div>
                                    {t.verified && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <VerifiedIcon className="w-3.5 h-3.5 text-[#10b981]" />
                                            <span className="text-[10px] text-[#10b981] font-mono uppercase tracking-wider">Verified Buyer</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
         8. NEWSLETTER
         ═══════════════════════════════════════════════════════════ */}
            <section className="border-t border-[#18181b]">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-20">
                    <div className="relative bg-[#18181b] border border-[#27272a] rounded-3xl p-8 md:p-14 text-center overflow-hidden">
                        {/* Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#f59e0b]/6 rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-3 py-1.5 rounded-full mb-4">
                                Newsletter
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#fafafa] tracking-tight mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                Stay in the Loop
                            </h2>
                            <p className="text-[#a1a1aa] text-base max-w-lg mx-auto mb-8">
                                Subscribe to get exclusive deals, new arrivals, and curated recommendations delivered to your inbox.
                            </p>

                            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full sm:flex-1 px-5 py-3.5 bg-[#09090b] border border-[#3f3f46] focus:border-[#f59e0b]/50 rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none transition-colors duration-200"
                                />
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-7 py-3.5 bg-[#f59e0b] text-[#09090b] font-bold text-sm rounded-xl hover:bg-[#d97706] transition-all duration-200 shadow-[0_4px_12px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)] cursor-pointer active:scale-[0.98]"
                                >
                                    Subscribe
                                </button>
                            </form>

                            {newsletterSubmitted && (
                                <p className="text-[#10b981] text-sm mt-4 z-animate-fade-in">
                                    ✓ Thanks for subscribing! You'll hear from us soon.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;