import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import { useSelector } from 'react-redux';
import { useCart } from '../../cart/hook/useCart';
import { DetailPageSkeleton } from '../../../components/ui/Skeleton';

/* ────────────────────────────────────────────────────────── */
/*  All business logic is IDENTICAL to the original file.    */
/*  Only the JSX presentation layer has changed.             */
/* ────────────────────────────────────────────────────────── */

export default function ProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { handleGetProductById } = useProduct();
    const { handleAddItem } = useCart();

    const rawUser = useSelector(s => s.auth.user);
    const user = useMemo(() => (rawUser?.user ? rawUser.user : rawUser), [rawUser]);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* Identical selection state */
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [imgIdx, setImgIdx] = useState(0);
    const [qty, setQty] = useState(1);
    const [toast, setToast] = useState(null);
    const [pincode, setPincode] = useState('');
    const [dMsg, setDMsg] = useState(null);
    const [detailOpen, setDetailOpen] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);

    /* Image helper — unchanged */
    const getUrl = img => {
        if (!img) return null;
        if (typeof img === 'string') return img;
        return img.url || img.secure_url || img.path || null;
    };

    /* Format currency — unchanged */
    const formatCurrency = priceObj => {
        if (!priceObj) return '₹0';
        const amount = parseFloat(priceObj.amount || 0);
        const currency = priceObj.currency || 'INR';
        try {
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
        } catch {
            return `₹${amount}`;
        }
    };

    const showToast = msg => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    /* Fetch product — unchanged */
    async function fetchProduct() {
        if (!productId) { setError('No product ID provided'); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const data = await handleGetProductById(productId);
            const p = data?.product || data?.data || data;
            setProduct((p?._id || p?.title) ? p : data || null);
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to load product details');
        } finally { setLoading(false); }
    }

    useEffect(() => { fetchProduct(); window.scrollTo(0, 0); }, [productId]);
    useEffect(() => { setSelectedVariant(null); setImgIdx(0); setQty(1); }, [product?._id]);

    /* Variants — unchanged */
    const variants = useMemo(() => Array.isArray(product?.variants) ? product.variants : [], [product]);

    const getVariantLabel = (variant) => {
        if (!variant) return 'Base Model';
        const attrs = variant.attributes || {};
        const entries = Object.entries(attrs);
        if (entries.length === 0) return `Variant #${variant._id?.slice(-4) || '1'}`;
        return entries.map(([k, v]) => `${k}: ${v}`).join(' · ');
    };

    const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

    /* All images gallery — unchanged */
    const allImages = useMemo(() => {
        const list = [];
        if (product?.images?.length) {
            product.images.forEach((img, i) => {
                const url = getUrl(img);
                if (url) list.push({ url, label: `Image ${i + 1}`, isVariant: false, variantId: null });
            });
        }
        variants.forEach(v => {
            if (v.images?.length) {
                v.images.forEach(img => {
                    const url = getUrl(img);
                    if (url) list.push({ url, label: getVariantLabel(v), isVariant: true, variantId: v._id });
                });
            }
        });
        if (list.length === 0) list.push({ url: DEFAULT_FALLBACK, label: 'Product View', isVariant: false, variantId: null });
        return list;
    }, [product, variants]);

    const activeImageObj = allImages[imgIdx] || allImages[0];

    /* Effective price & stock — unchanged */
    const effectivePrice = useMemo(() => {
        if (selectedVariant?.price?.amount !== undefined) return selectedVariant.price;
        return product?.price || { amount: 0, currency: 'INR' };
    }, [selectedVariant, product]);

    const effectiveStock = useMemo(() => {
        if (selectedVariant !== null) return selectedVariant.stock ?? 0;
        if (variants.length > 0) return variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        return 10;
    }, [selectedVariant, variants]);

    /* Select variant handler — unchanged */
    const handleSelectVariant = (variantObj) => {
        setSelectedVariant(variantObj);
        if (variantObj) {
            const idx = allImages.findIndex(img => img.variantId === variantObj._id);
            if (idx !== -1) setImgIdx(idx);
        } else {
            setImgIdx(0);
        }
    };

    /* Add to cart handler — unchanged */
    const handleAddToCartClick = async () => {
        if (!product) return;
        const targetVariantId = selectedVariant?._id || (variants.length > 0 ? variants[0]._id : null);
        if (variants.length > 0 && !targetVariantId) { showToast('Please select a product variant'); return; }
        setAddingToCart(true);
        try {
            await handleAddItem({ productId: product._id, variantsId: targetVariantId, quantity: qty });
            const label = selectedVariant ? getVariantLabel(selectedVariant) : 'Base Product';
            showToast(`Added ${qty} × "${product.title}" to cart!`);
        } catch (err) {
            console.error('Failed to add item to cart:', err);
            showToast('Failed to add product to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    /* Delivery check — unchanged */
    const checkDelivery = () => {
        if (/^\d{6}$/.test(pincode)) {
            const d = new Date(Date.now() + 2 * 86400000);
            setDMsg(`Delivery by ${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} — Free Express Shipping`);
        } else {
            setDMsg('Please enter a valid 6-digit PIN code');
        }
    };

    /* ── Render ─────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa]">

            {/* Toast */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#18181b] border border-[#3f3f46] text-[#fafafa] text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl z-animate-scale-in">
                    <svg className="w-4 h-4 text-[#10b981] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>{toast}</span>
                </div>
            )}

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs text-[#52525b] mb-8">
                    <Link to="/" className="hover:text-[#a1a1aa] transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/" className="hover:text-[#a1a1aa] transition-colors">Marketplace</Link>
                    <span>/</span>
                    <span className="text-[#a1a1aa] truncate max-w-[200px]">
                        {loading ? 'Loading…' : (product?.title || 'Product')}
                    </span>
                </nav>

                {/* States */}
                {loading ? (
                    <DetailPageSkeleton />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-[#18181b] border border-[#27272a] rounded-2xl">
                        <div className="w-14 h-14 rounded-2xl bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#f87171] mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-[#fafafa] mb-2">Product not found</h2>
                        <p className="text-sm text-[#71717a] max-w-xs mb-6">{error}</p>
                        <Link to="/" className="px-5 py-2.5 bg-[#f59e0b] text-[#09090b] font-bold text-sm rounded-xl hover:bg-[#d97706] transition-all duration-200">
                            Back to Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

                        {/* ── Left: Gallery ─────────────────── */}
                        <div className="space-y-4 lg:sticky lg:top-24">
                            {/* Main image */}
                            <div className="relative aspect-square bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden group">
                                <img
                                    src={activeImageObj.url}
                                    alt={product.title}
                                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
                                    onError={e => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK; }}
                                />

                                {/* Stock badge */}
                                <div className={`absolute top-4 right-4 flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${effectiveStock > 0
                                    ? 'bg-[#10b981]/10 border-[#10b981]/25 text-[#10b981]'
                                    : 'bg-[#f87171]/10 border-[#f87171]/25 text-[#f87171]'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${effectiveStock > 0 ? 'bg-[#10b981]' : 'bg-[#f87171]'}`} />
                                    {effectiveStock > 0 ? `${effectiveStock} in stock` : 'Out of stock'}
                                </div>

                                {/* Variant label */}
                                {selectedVariant && (
                                    <div className="absolute top-4 left-4 text-[10px] font-mono uppercase tracking-wider bg-[#f59e0b]/15 border border-[#f59e0b]/25 text-[#f59e0b] px-2.5 py-1 rounded-lg">
                                        {getVariantLabel(selectedVariant)}
                                    </div>
                                )}

                                {/* Arrow nav */}
                                {allImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setImgIdx(p => (p > 0 ? p - 1 : allImages.length - 1))}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[#09090b]/80 border border-[#3f3f46] text-[#a1a1aa] flex items-center justify-center hover:text-[#f59e0b] hover:border-[#f59e0b]/40 transition-all cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setImgIdx(p => (p < allImages.length - 1 ? p + 1 : 0))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[#09090b]/80 border border-[#3f3f46] text-[#a1a1aa] flex items-center justify-center hover:text-[#f59e0b] hover:border-[#f59e0b]/40 transition-all cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <div className="flex gap-2.5 flex-wrap">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setImgIdx(idx)}
                                            className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${imgIdx === idx
                                                ? 'border-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                                                : 'border-[#27272a] opacity-60 hover:opacity-90 hover:border-[#3f3f46]'
                                                }`}
                                        >
                                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                                            {img.isVariant && (
                                                <span className="absolute bottom-0 inset-x-0 bg-[#f59e0b]/90 text-[7px] font-mono text-[#09090b] font-bold py-0.5 text-center">VAR</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Right: Product Info ────────────── */}
                        <div className="space-y-7">
                            {/* Header */}
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2.5 py-1 rounded-full">
                                        Verified Listing
                                    </span>
                                    <span className="text-xs text-[#71717a]">
                                        by <span className="text-[#a1a1aa] font-medium">
                                            {typeof product.seller === 'object'
                                                ? (product.seller.fullname || product.seller._id)
                                                : (product.seller || 'Zentra Seller')}
                                        </span>
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-[#fafafa] tracking-tight leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    {product.title}
                                </h1>
                            </div>

                            {/* Price */}
                            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#71717a] block mb-1">
                                            {selectedVariant ? `Variant price` : 'Base price'}
                                        </span>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl font-bold text-[#f59e0b]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                {formatCurrency(effectivePrice)}
                                            </span>
                                            {selectedVariant && product.price?.amount &&
                                                parseFloat(selectedVariant.price?.amount || 0) !== parseFloat(product.price.amount) && (
                                                    <span className="text-sm font-mono text-[#52525b] line-through">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-[#10b981] font-semibold block">✓ In stock & ready</span>
                                        <span className="text-[11px] text-[#71717a]">Incl. taxes</span>
                                    </div>
                                </div>
                            </div>

                            {/* Variant Selector */}
                            {variants.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-mono uppercase tracking-widest text-[#71717a] font-semibold">
                                            Select Variant ({variants.length + 1} options)
                                        </label>
                                        {selectedVariant && (
                                            <button
                                                onClick={() => handleSelectVariant(null)}
                                                className="text-[11px] text-[#f59e0b] hover:underline cursor-pointer font-mono"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {/* Base option */}
                                        <div
                                            onClick={() => handleSelectVariant(null)}
                                            className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all duration-200 ${selectedVariant === null
                                                ? 'bg-[#f59e0b]/8 border-[#f59e0b] shadow-[0_0_0_1px_rgba(245,158,11,0.2)]'
                                                : 'bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]'
                                                }`}
                                        >
                                            <div className="w-11 h-11 rounded-lg bg-[#09090b] border border-[#27272a] overflow-hidden shrink-0">
                                                <img
                                                    src={getUrl(product.images?.[0]) || DEFAULT_FALLBACK}
                                                    alt="Base"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-[#fafafa]">Base Model</span>
                                                    {selectedVariant === null && (
                                                        <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-mono text-[#f59e0b]">{formatCurrency(product.price)}</span>
                                            </div>
                                        </div>

                                        {/* Variant cards */}
                                        {variants.map((v, i) => {
                                            const isSelected = selectedVariant?._id === v._id;
                                            const vImg = getUrl(v.images?.[0]) || getUrl(product.images?.[0]) || DEFAULT_FALLBACK;
                                            const vPrice = v.price?.amount ? v.price : product.price;
                                            return (
                                                <div
                                                    key={v._id || i}
                                                    onClick={() => handleSelectVariant(v)}
                                                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all duration-200 ${isSelected
                                                        ? 'bg-[#f59e0b]/8 border-[#f59e0b] shadow-[0_0_0_1px_rgba(245,158,11,0.2)]'
                                                        : v.stock === 0
                                                            ? 'bg-[#18181b] border-[#27272a] opacity-50 cursor-not-allowed'
                                                            : 'bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]'
                                                        }`}
                                                >
                                                    <div className="w-11 h-11 rounded-lg bg-[#09090b] border border-[#27272a] overflow-hidden shrink-0">
                                                        <img src={vImg} alt={getVariantLabel(v)} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-semibold text-[#fafafa] truncate">{getVariantLabel(v)}</span>
                                                            {isSelected && <span className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0" />}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-mono text-[#f59e0b]">{formatCurrency(vPrice)}</span>
                                                            <span className={`text-[10px] font-mono ${v.stock > 0 ? 'text-[#10b981]' : 'text-[#f87171]'}`}>
                                                                {v.stock > 0 ? `${v.stock} avail.` : 'Out of stock'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quantity selector */}
                            <div className="flex items-center gap-5">
                                <span className="text-xs font-mono uppercase tracking-widest text-[#71717a]">Qty</span>
                                <div className="inline-flex items-center bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setQty(q => Math.max(1, q - 1))}
                                        disabled={qty <= 1}
                                        className="w-10 h-10 flex items-center justify-center text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] disabled:opacity-30 transition-all cursor-pointer text-lg font-bold"
                                    >
                                        −
                                    </button>
                                    <span className="w-12 text-center text-sm font-bold text-[#fafafa] font-mono">
                                        {qty}
                                    </span>
                                    <button
                                        onClick={() => setQty(q => (q < effectiveStock ? q + 1 : q))}
                                        disabled={qty >= effectiveStock}
                                        className="w-10 h-10 flex items-center justify-center text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] disabled:opacity-30 transition-all cursor-pointer text-lg font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-xs text-[#52525b]">{effectiveStock} available</span>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleAddToCartClick}
                                    disabled={addingToCart || effectiveStock === 0}
                                    className="flex-1 flex items-center justify-center gap-2.5 bg-[#f59e0b] text-[#09090b] font-bold text-sm py-4 rounded-xl hover:bg-[#d97706] transition-all duration-200 shadow-[0_8px_24px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {addingToCart ? (
                                        <><span className="w-4 h-4 border-2 border-[#09090b]/30 border-t-[#09090b] rounded-full animate-spin" /> Adding…</>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                                            </svg>
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={async () => { await handleAddToCartClick(); navigate('/cart'); }}
                                    disabled={effectiveStock === 0}
                                    className="flex-1 flex items-center justify-center gap-2.5 bg-[#18181b] text-[#f59e0b] font-bold text-sm py-4 rounded-xl border border-[#f59e0b]/30 hover:border-[#f59e0b] hover:bg-[#27272a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Buy Now
                                </button>
                            </div>

                            {/* Description accordion */}
                            <div className="border-t border-[#27272a] pt-5">
                                <button
                                    onClick={() => setDetailOpen(o => !o)}
                                    className="w-full flex items-center justify-between text-sm font-semibold text-[#a1a1aa] hover:text-[#fafafa] cursor-pointer transition-colors py-1"
                                >
                                    <span>Product Description</span>
                                    <svg className={`w-4 h-4 transition-transform duration-200 ${detailOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                                    </svg>
                                </button>
                                {detailOpen && (
                                    <div className="mt-4 bg-[#18181b] border border-[#27272a] rounded-xl p-4 text-sm text-[#a1a1aa] leading-relaxed whitespace-pre-line z-animate-fade-in">
                                        {product.description || 'No description available.'}
                                    </div>
                                )}
                            </div>

                            {/* Delivery check */}
                            <div className="border-t border-[#27272a] pt-5 space-y-3">
                                <label className="block text-xs font-mono uppercase tracking-widest text-[#71717a]">
                                    Check Delivery
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={pincode}
                                        onChange={e => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setDMsg(null); }}
                                        placeholder="Enter 6-digit PIN"
                                        className="flex-1 bg-[#18181b] border border-[#27272a] focus:border-[#f59e0b]/50 text-[#fafafa] text-sm px-4 py-2.5 rounded-xl outline-none transition-colors font-mono placeholder-[#52525b]"
                                    />
                                    <button
                                        onClick={checkDelivery}
                                        className="px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] font-semibold text-xs rounded-xl border border-[#3f3f46] hover:border-[#52525b] transition-all cursor-pointer"
                                    >
                                        Check
                                    </button>
                                </div>
                                {dMsg && (
                                    <p className={`text-xs font-mono ${dMsg.startsWith('Delivery') ? 'text-[#10b981]' : 'text-[#f87171]'}`}>
                                        {dMsg}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
