import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

/* ─── colour detection helpers ───────────────────────────────────── */
const COLOUR_MAP = {
    red: '#ef4444', green: '#22c55e', blue: '#3b82f6', yellow: '#eab308',
    pink: '#ec4899', orange: '#f97316', purple: '#a855f7', brown: '#92400e',
    black: '#1f2937', white: '#f9fafb', grey: '#9ca3af', gray: '#9ca3af',
    navy: '#1e3a5f', beige: '#d4b896', cream: '#fef3c7', gold: '#f59e0b',
    silver: '#d1d5db', maroon: '#7f1d1d', teal: '#14b8a6', cyan: '#06b6d4',
    olive: '#65a30d', coral: '#f87171', lavender: '#c4b5fd', violet: '#7c3aed',
    indigo: '#4f46e5', lime: '#84cc16', turquoise: '#2dd4bf', magenta: '#c026d3',
};
const COLOR_KEYS = new Set(Object.keys(COLOUR_MAP));
const isColorAttr = (key, values) =>
    key.toLowerCase().includes('color') ||
    key.toLowerCase().includes('colour') ||
    values.some(v => COLOR_KEYS.has(String(v).toLowerCase().trim()));

/* ─── tiny SVGs ─────────────────────────────────────────────────── */
const ChevronDown = ({ cls = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);
const ChevronUp = ({ cls = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
);

export default function ProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { handleGetProductById } = useProduct();
    const { handleLogout } = useAuth();

    const rawUser = useSelector(s => s.auth.user);
    const user = useMemo(() => (rawUser?.user ? rawUser.user : rawUser), [rawUser]);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* UI */
    const [imgIdx, setImgIdx] = useState(0);
    const [qty, setQty] = useState(1);
    const [toast, setToast] = useState(null);
    const [wishlisted, setWL] = useState(false);
    const [pincode, setPincode] = useState('');
    const [dMsg, setDMsg] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    /* variant selection: { attrKey: value } */
    const [sel, setSel] = useState({});

    /* ─── helpers ─── */
    const getUrl = img => {
        if (!img) return null;
        if (typeof img === 'string') return img;
        return img.url || img.secure_url || img.path || null;
    };

    const fmt = priceObj => {
        if (!priceObj) return '₹0';
        try {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency', currency: priceObj.currency || 'INR', maximumFractionDigits: 0,
            }).format(parseFloat(priceObj.amount || 0));
        } catch { return `₹${priceObj.amount}`; }
    };

    const fmtDate = d => {
        try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
        catch { return d; }
    };

    const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2800); };

    /* ─── fetch ─── */
    async function fetchProduct() {
        if (!productId) { setError('No product ID'); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const data = await handleGetProductById(productId);
            const p = data?.product || data?.data || data;
            setProduct((p?._id || p?.title) ? p : data || null);
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to load product');
        } finally { setLoading(false); }
    }

    useEffect(() => { fetchProduct(); window.scrollTo(0, 0); }, [productId]);
    useEffect(() => { setSel({}); setImgIdx(0); }, [product?._id]);

    /* ─── variants ─── */
    const variants = useMemo(() => Array.isArray(product?.varient) ? product.varient : [], [product]);

    const attrOptions = useMemo(() => {
        const map = {};
        variants.forEach(v => {
            const attrs = v.attridutes || v.attributes || {};
            Object.entries(attrs).forEach(([k, val]) => {
                if (!map[k]) map[k] = new Set();
                map[k].add(String(val));
            });
        });
        return Object.fromEntries(Object.entries(map).map(([k, s]) => [k, [...s]]));
    }, [variants]);

    const hasVariants = variants.length > 0;

    const activeVariant = useMemo(() => {
        if (!hasVariants) return null;
        const keys = Object.keys(sel);
        if (!keys.length) return variants[0];
        const exact = variants.find(v => {
            const a = v.attridutes || v.attributes || {};
            return keys.every(k => a[k] !== undefined && String(a[k]) === sel[k]);
        });
        if (exact) return exact;
        let best = null, bestScore = -1;
        variants.forEach(v => {
            const a = v.attridutes || v.attributes || {};
            const score = keys.filter(k => a[k] !== undefined && String(a[k]) === sel[k]).length;
            if (score > bestScore) { best = v; bestScore = score; }
        });
        return best;
    }, [variants, sel, hasVariants]);

    /* effective values (variant → fallback to product) */
    const effPrice = useMemo(() =>
        activeVariant?.price?.amount !== undefined ? activeVariant.price : product?.price,
        [activeVariant, product]);

    const effStock = useMemo(() => activeVariant?.stock ?? null, [activeVariant]);

    /* ─── images ─── */
    const FALLBACK = [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1483181957632-8bda974cbc91?w=800',
    ];

    const images = useMemo(() => {
        const vi = activeVariant?.images;
        if (vi?.length) { const ex = vi.map(getUrl).filter(Boolean); if (ex.length) return ex; }
        if (product?.images?.length) { const ex = product.images.map(getUrl).filter(Boolean); if (ex.length) return ex; }
        return FALLBACK;
    }, [product, activeVariant]);

    const activeImg = images[imgIdx] || images[0];

    const handleSel = (key, val) => { setSel(p => ({ ...p, [key]: val })); setImgIdx(0); };

    const handleLogoutClick = async () => {
        try { await handleLogout(); navigate('/login'); } catch { }
    };

    const checkDelivery = () => {
        if (/^\d{6}$/.test(pincode)) {
            const d = new Date(Date.now() + 2 * 86400000);
            setDMsg(`Delivery by ${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} — Free`);
        } else setDMsg('Please enter a valid 6-digit PIN code.');
    };

    /* ════════════════════ RENDER ════════════════════ */
    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

            {/* ── Toast ── */}
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2"
                    style={{ animation: 'fadeIn .2s ease' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" className="w-4 h-4 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {toast}
                </div>
            )}

            {/* ════ HEADER ════ */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
                <div className="max-w-screen-xl mx-auto px-5 h-14 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-black flex items-center justify-center text-white font-black text-sm">Z</div>
                        <span className="font-extrabold text-base tracking-[0.18em] uppercase text-gray-900">Zentra</span>
                    </Link>

                    {/* Search */}
                    <div className="hidden md:block relative w-96">
                        <input placeholder="Search for products, brands…"
                            className="w-full bg-gray-100 border border-transparent focus:border-gray-300 focus:bg-white rounded px-10 py-2 text-sm focus:outline-none transition-all" />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                        </svg>
                    </div>

                    {/* Nav icons */}
                    <div className="flex items-center gap-5 text-xs text-gray-500">
                        {user ? (
                            <>
                                <div className="flex flex-col items-center gap-0.5">
                                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
                                        {(user.fullname || 'U')[0].toUpperCase()}
                                    </div>
                                    <span>{user.fullname?.split(' ')[0] || 'Profile'}</span>
                                </div>
                                <button onClick={handleLogoutClick} className="hover:text-gray-900 transition-colors cursor-pointer">Logout</button>
                            </>
                        ) : (
                            <Link to="/login" className="hover:text-gray-900 transition-colors flex flex-col items-center gap-0.5">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Profile</span>
                            </Link>
                        )}
                        <button onClick={() => showToast('Wishlist coming soon!')} className="flex flex-col items-center gap-0.5 hover:text-gray-900 transition-colors cursor-pointer">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>Wishlist</span>
                        </button>
                        <button onClick={() => showToast('Bag coming soon!')} className="flex flex-col items-center gap-0.5 hover:text-gray-900 transition-colors cursor-pointer">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>Bag</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ════ BREADCRUMB ════ */}
            <div className="border-b border-gray-100">
                <nav className="max-w-screen-xl mx-auto px-5 py-2 text-[11px] text-gray-400 flex items-center gap-1.5">
                    <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-gray-600 truncate max-w-xs">
                        {loading ? 'Loading…' : product?.title || 'Product'}
                    </span>
                </nav>
            </div>

            {/* ════ MAIN ════ */}
            <main className="flex-1 max-w-screen-xl mx-auto w-full px-5 py-6">

                {/* LOADING */}
                {loading ? (
                    <div className="flex gap-5 animate-pulse">
                        <div className="hidden sm:flex flex-col gap-2 w-[70px]">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-[70px] h-[88px] bg-gray-100 rounded" />)}
                        </div>
                        <div className="flex-1 max-w-[420px] bg-gray-100 rounded" style={{ height: 540 }} />
                        <div className="flex-1 max-w-[440px] space-y-4 pt-2">
                            <div className="h-3 w-20 bg-gray-100 rounded" />
                            <div className="h-7 w-3/4 bg-gray-100 rounded" />
                            <div className="h-5 w-1/3 bg-gray-100 rounded" />
                            <div className="h-5 w-1/4 bg-gray-100 rounded" />
                            <div className="h-10 bg-gray-100 rounded" />
                            <div className="h-10 bg-gray-100 rounded" />
                            <div className="h-12 bg-gray-100 rounded" />
                        </div>
                    </div>
                ) : error ? (
                    /* ERROR */
                    <div className="text-center py-24">
                        <p className="text-5xl mb-4">😕</p>
                        <h2 className="text-xl font-bold mb-2">Product not found</h2>
                        <p className="text-sm text-gray-500 mb-6">{error}</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={fetchProduct} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-700 transition-colors cursor-pointer">Retry</button>
                            <Link to="/" className="px-6 py-2.5 border border-gray-300 text-sm rounded hover:border-gray-500 transition-colors">Home</Link>
                        </div>
                    </div>
                ) : (

                    /* ════════════ PRODUCT LAYOUT ════════════
                       [thumb strip] [main image] [info panel]
                    ══════════════════════════════════════════ */
                    <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">

                        {/* ──────────────────────────────────────────
                        LEFT: Thumbnail strip + main image
                    ────────────────────────────────────────── */}
                        <div className="flex gap-3 lg:flex-1 lg:max-w-[600px]">

                            {/* Vertical thumbnail strip */}
                            <div className="hidden sm:flex flex-col gap-2 w-[72px] shrink-0 pt-1">
                                {images.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setImgIdx(i)}
                                        className={`w-[72px] h-[90px] rounded-sm overflow-hidden border-2 transition-all cursor-pointer
                                        ${i === imgIdx ? 'border-gray-900' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <img src={url} alt={`view ${i + 1}`} className="w-full h-full object-cover"
                                            onError={e => { e.target.onerror = null; e.target.src = FALLBACK[0]; }} />
                                    </button>
                                ))}
                            </div>

                            {/* Main image */}
                            <div className="relative flex-1 overflow-hidden rounded-sm bg-gray-50 group select-none"
                                style={{ maxHeight: 600, minHeight: 360 }}>
                                <img
                                    key={activeImg}
                                    src={activeImg}
                                    alt={product?.title || 'Product image'}
                                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                                    style={{ minHeight: 360 }}
                                    onError={e => { e.target.onerror = null; e.target.src = FALLBACK[0]; }}
                                />

                                {/* Stock badge */}
                                {effStock !== null && effStock <= 10 && (
                                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                                        Only {effStock} left
                                    </div>
                                )}

                                {/* Wishlist heart */}
                                <button
                                    onClick={() => { setWL(w => !w); showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!'); }}
                                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center border shadow-sm transition-all cursor-pointer
                                    ${wishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:text-red-400'}`}
                                >
                                    <svg viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>

                                {/* Arrows */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setImgIdx(p => p > 0 ? p - 1 : images.length - 1)}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rotate-90"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        <button
                                            onClick={() => setImgIdx(p => p < images.length - 1 ? p + 1 : 0)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 -rotate-90"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                    </>
                                )}

                                {/* Mobile dot indicators */}
                                {images.length > 1 && (
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
                                        {images.map((_, i) => (
                                            <button key={i} onClick={() => setImgIdx(i)}
                                                className={`h-1.5 rounded-full transition-all cursor-pointer ${i === imgIdx ? 'w-4 bg-gray-900' : 'w-1.5 bg-gray-400'}`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ──────────────────────────────────────────
                        RIGHT: Info panel — matches screenshot
                    ────────────────────────────────────────── */}
                        <div className="flex-1 lg:max-w-[440px] pt-4 lg:pt-1 space-y-5">

                            {/* Seller / brand name */}
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                                {typeof product?.seller === 'object'
                                    ? product.seller.fullname || 'Zentra Brand'
                                    : 'Zentra Brand'}
                            </p>

                            {/* Product title */}
                            <h1 className="text-2xl font-bold text-gray-900 leading-snug -mt-2">
                                {product?.title || 'Unnamed Product'}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2 text-xs -mt-1">
                                <span className="inline-flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded-sm font-bold">
                                    4.3
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                </span>
                                <span className="text-gray-400">1,248 Ratings & 86 Reviews</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3 flex-wrap">
                                <span className="text-2xl font-extrabold text-gray-900">
                                    {fmt(effPrice)}
                                </span>
                                {activeVariant?.price?.amount !== undefined && product?.price && (
                                    <>
                                        <span className="text-sm text-gray-400 line-through">{fmt(product.price)}</span>
                                        <span className="text-sm font-bold text-green-600">
                                            {Math.round((1 - parseFloat(activeVariant.price.amount) / parseFloat(product.price.amount)) * 100)}% OFF
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* ═══ VARIANT ATTRIBUTE CHIPS ═══
                            Shown directly after price, exactly like screenshot.
                            Each attribute key gets its own labelled row.
                        ════════════════════════════════ */}
                            {hasVariants && Object.entries(attrOptions).map(([attrKey, values]) => {
                                const isColor = isColorAttr(attrKey, values);
                                return (
                                    <div key={attrKey}>
                                        {/* Attribute label row */}
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-2">
                                            {attrKey}
                                            {sel[attrKey] && (
                                                <span className="ml-2 text-gray-900 normal-case tracking-normal font-bold">{sel[attrKey]}</span>
                                            )}
                                        </p>

                                        {/* Chips row */}
                                        <div className="flex flex-wrap gap-2">
                                            {values.map(val => {
                                                const isActive = sel[attrKey] === val;
                                                const isAvail = variants.some(v => {
                                                    const a = v.attridutes || v.attributes || {};
                                                    return String(a[attrKey]) === val;
                                                });

                                                if (isColor) {
                                                    const hex = COLOUR_MAP[val.toLowerCase().trim()] || '#e5e7eb';
                                                    return (
                                                        <button
                                                            key={val}
                                                            onClick={() => isAvail && handleSel(attrKey, val)}
                                                            disabled={!isAvail}
                                                            title={val}
                                                            className={`relative w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center
                                                            ${isActive ? 'border-gray-900 scale-110 shadow' : 'border-transparent hover:border-gray-400'}
                                                            ${!isAvail ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                            style={{ backgroundColor: hex }}
                                                        >
                                                            {isActive && (
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3.5 h-3.5 drop-shadow">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    );
                                                }

                                                /* Text chip — matches screenshot exactly */
                                                return (
                                                    <button
                                                        key={val}
                                                        onClick={() => isAvail && handleSel(attrKey, val)}
                                                        disabled={!isAvail}
                                                        className={`relative px-4 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer rounded-sm
                                                        ${isActive
                                                                ? 'bg-gray-900 border-gray-900 text-white'
                                                                : isAvail
                                                                    ? 'bg-white border-gray-300 text-gray-700 hover:border-gray-600'
                                                                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        {!isAvail && (
                                                            <span className="absolute inset-0 overflow-hidden rounded-sm pointer-events-none">
                                                                <span className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 -rotate-6 origin-center" />
                                                            </span>
                                                        )}
                                                        {val}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Stock */}
                            {effStock !== null && (
                                <p className={`text-xs font-semibold uppercase tracking-widest
                                ${effStock > 10 ? 'text-green-600' : effStock > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                                    {effStock > 10 ? `${effStock} In Stock` : effStock > 0 ? `Only ${effStock} Left!` : 'Out of Stock'}
                                </p>
                            )}

                            {/* Quantity */}
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Qty</span>
                                <div className="flex items-center border border-gray-300 rounded-sm">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-lg cursor-pointer">−</button>
                                    <span className="w-10 text-center text-sm font-bold text-gray-900">{qty}</span>
                                    <button onClick={() => { const max = effStock ?? 10; setQty(q => q < max ? q + 1 : q); }}
                                        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-lg cursor-pointer">+</button>
                                </div>
                            </div>

                            {/* The Details — collapsible (matches screenshot label) */}
                            <div className="border-t border-gray-200 pt-3">
                                <button
                                    onClick={() => setDetailOpen(o => !o)}
                                    className="w-full flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 cursor-pointer hover:text-gray-800 transition-colors"
                                >
                                    The Details
                                    {detailOpen ? <ChevronUp /> : <ChevronDown />}
                                </button>
                                {detailOpen && (
                                    <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                        {product?.description || 'No description available for this product.'}
                                    </p>
                                )}
                            </div>

                            {/* CTA buttons — matches screenshot */}
                            <div className="flex flex-col gap-3 pt-1">
                                <button
                                    onClick={() => showToast(`${qty} × "${product?.title}" added to cart!`)}
                                    className="w-full py-3.5 bg-gray-900 text-white font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-gray-700 active:scale-[0.98] transition-all cursor-pointer"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => showToast(`Proceeding to checkout…`)}
                                    className="w-full py-3.5 border-2 border-gray-900 text-gray-900 font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
                                >
                                    Buy Now
                                </button>
                            </div>

                            {/* Bottom info strip — matches screenshot footer row */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2 border-t border-gray-100 text-[10px] uppercase tracking-wider">
                                {[
                                    ['Shipping', 'Complimentary over INR 3,000'],
                                    ['Returns', 'Within 14 days of delivery'],
                                    ['Authenticity', '100% Guaranteed'],
                                    ['Seller', typeof product?.seller === 'object'
                                        ? product.seller.fullname || product.seller._id
                                        : product?.seller || 'Zentra Verified'],
                                ].map(([label, val]) => (
                                    <div key={label}>
                                        <span className="text-gray-400">{label}  </span>
                                        <span className="text-gray-700 font-semibold">{val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Delivery check */}
                            <div className="border-t border-gray-100 pt-3 space-y-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Check Delivery</p>
                                <div className="flex gap-2">
                                    <input
                                        value={pincode}
                                        onChange={e => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setDMsg(null); }}
                                        placeholder="Enter PIN code"
                                        className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-gray-600 transition-colors"
                                    />
                                    <button onClick={checkDelivery}
                                        className="px-4 py-2 text-sm font-bold border border-gray-300 rounded-sm hover:border-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                                        Check
                                    </button>
                                </div>
                                {dMsg && <p className={`text-xs ${dMsg.startsWith('Delivery') ? 'text-green-600' : 'text-red-500'}`}>{dMsg}</p>}
                            </div>

                        </div>
                        {/* ── end right panel ── */}

                    </div>
                    /* ── end product grid ── */
                )}
            </main>

            {/* ════ FOOTER ════ */}
            <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-auto">
                <p className="font-extrabold tracking-[0.18em] uppercase text-gray-700 text-sm mb-1">Zentra</p>
                <p>© 2026 Zentra Trade Network. All rights reserved.</p>
                <div className="flex justify-center gap-6 mt-3">
                    <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
                    <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
                </div>
            </footer>

            {/* keyframe for toast */}
            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateX(-50%) translateY(-8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
        </div>
    );
}
