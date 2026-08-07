import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCart } from '../../cart/hook/useCart';

export default function ProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { handleGetProductById } = useProduct();
    const { handleLogout } = useAuth();
    const { handleAddItem } = useCart();

    const rawUser = useSelector(s => s.auth.user);
    const user = useMemo(() => (rawUser?.user ? rawUser.user : rawUser), [rawUser]);
    const cartItems = useSelector(state => state.cart.items);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* Selection State: null = Base Product, or variant object */
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [imgIdx, setImgIdx] = useState(0);
    const [qty, setQty] = useState(1);
    const [toast, setToast] = useState(null);
    const [pincode, setPincode] = useState('');
    const [dMsg, setDMsg] = useState(null);
    const [detailOpen, setDetailOpen] = useState(true);

    /* Total items count in cart */
    const totalCartCount = useMemo(() => {
        if (!Array.isArray(cartItems)) return 0;
        return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    }, [cartItems]);

    /* Image helper */
    const getUrl = img => {
        if (!img) return null;
        if (typeof img === 'string') return img;
        return img.url || img.secure_url || img.path || null;
    };

    /* Format currency */
    const formatCurrency = priceObj => {
        if (!priceObj) return '₹0';
        const amount = parseFloat(priceObj.amount || 0);
        const currency = priceObj.currency || 'INR';
        try {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currency,
                maximumFractionDigits: 0,
            }).format(amount);
        } catch {
            return `₹${amount}`;
        }
    };

    const showToast = msg => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    /* Fetch Product */
    async function fetchProduct() {
        if (!productId) {
            setError('No product ID provided');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await handleGetProductById(productId);
            const p = data?.product || data?.data || data;
            setProduct((p?._id || p?.title) ? p : data || null);
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to load product details');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [productId]);

    useEffect(() => {
        setSelectedVariant(null);
        setImgIdx(0);
        setQty(1);
    }, [product?._id]);

    /* Variants array */
    const variants = useMemo(() => {
        return Array.isArray(product?.variants) ? product.variants : [];
    }, [product]);

    /* Helper to format variant attribute summary string */
    const getVariantLabel = (variant) => {
        if (!variant) return 'Base Model';
        const attrs = variant.attributes || {};
        const entries = Object.entries(attrs);
        if (entries.length === 0) return `Variant #${variant._id?.slice(-4) || '1'}`;
        return entries.map(([k, v]) => `${k}: ${v}`).join(' | ');
    };

    /* Base Fallback Image */
    const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

    /* Combined Image Gallery (Base Product Images + All Variant Images) */
    const allImages = useMemo(() => {
        const list = [];

        // Base Product Images
        if (product?.images?.length) {
            product.images.forEach((img, i) => {
                const url = getUrl(img);
                if (url) {
                    list.push({
                        url,
                        label: `Base Image ${i + 1}`,
                        isVariant: false,
                        variantId: null,
                    });
                }
            });
        }

        // Variant Images
        variants.forEach((v) => {
            if (v.images?.length) {
                v.images.forEach((img) => {
                    const url = getUrl(img);
                    if (url) {
                        list.push({
                            url,
                            label: getVariantLabel(v),
                            isVariant: true,
                            variantId: v._id,
                        });
                    }
                });
            }
        });

        if (list.length === 0) {
            list.push({
                url: DEFAULT_FALLBACK,
                label: 'Product View',
                isVariant: false,
                variantId: null,
            });
        }

        return list;
    }, [product, variants]);

    /* Active Image */
    const activeImageObj = allImages[imgIdx] || allImages[0];

    /* Effective Price & Stock */
    const effectivePrice = useMemo(() => {
        if (selectedVariant?.price?.amount !== undefined) {
            return selectedVariant.price;
        }
        return product?.price || { amount: 0, currency: 'INR' };
    }, [selectedVariant, product]);

    const effectiveStock = useMemo(() => {
        if (selectedVariant !== null) {
            return selectedVariant.stock ?? 0;
        }
        // Total stock of all variants or fallback
        if (variants.length > 0) {
            return variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        }
        return 10;
    }, [selectedVariant, variants]);

    /* Select Variant Handler */
    const handleSelectVariant = (variantObj) => {
        setSelectedVariant(variantObj);

        if (variantObj) {
            // Find first image matching this variant if available
            const matchingImgIndex = allImages.findIndex(img => img.variantId === variantObj._id);
            if (matchingImgIndex !== -1) {
                setImgIdx(matchingImgIndex);
            }
        } else {
            // Reset to base product image (0)
            setImgIdx(0);
        }
    };

    /* Add to Cart Handler */
    const handleAddToCartClick = async () => {
        if (!product) return;

        // Use selected variant ID or default to first variant if product has variants
        const targetVariantId = selectedVariant?._id || (variants.length > 0 ? variants[0]._id : null);

        if (variants.length > 0 && !targetVariantId) {
            showToast('Please select a product variant');
            return;
        }

        try {
            await handleAddItem({
                productId: product._id,
                variantsId: targetVariantId,
                quantity: qty,
            });

            const targetLabel = selectedVariant ? getVariantLabel(selectedVariant) : 'Base Product';
            showToast(`Added ${qty} × "${product.title}" (${targetLabel}) to Cart!`);
        } catch (err) {
            console.error('Failed to add item to cart:', err);
            showToast('Failed to add product to cart');
        }
    };

    const handleLogoutClick = async () => {
        try {
            await handleLogout();
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const checkDelivery = () => {
        if (/^\d{6}$/.test(pincode)) {
            const d = new Date(Date.now() + 2 * 86400000);
            setDMsg(`Delivery by ${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} — Free Express Shipping`);
        } else {
            setDMsg('Please enter a valid 6-digit PIN code');
        }
    };

    return (
        <div className="min-h-screen bg-[#0c1324] text-[#dce1fb] font-sans antialiased flex flex-col">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#f59e0b] text-[#0c1324] font-bold text-xs px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-[#f59e0b]/40 animate-bounce">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{toast}</span>
                </div>
            )}

            {/* Header Navigation */}
            <header className="w-full bg-[#0c1324] border-b border-[#2e3447]/50 sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
                <div className="flex justify-between items-center w-full px-4 md:px-12 py-4 max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#f59e0b] tracking-tighter hover:opacity-90 transition-opacity">
                            ZENTRA
                        </Link>
                        <nav className="hidden md:flex gap-6 items-center">
                            <Link
                                to="/"
                                className="text-[#a08e7a] hover:text-[#f59e0b] transition-colors duration-300 font-['JetBrains_Mono'] text-xs font-medium tracking-[0.05em] uppercase"
                            >
                                MARKETPLACE
                            </Link>
                            {user && user.role === 'seller' && (
                                <Link
                                    to="/seller/dashboard"
                                    className="text-[#a08e7a] hover:text-[#f59e0b] transition-colors duration-300 font-['JetBrains_Mono'] text-xs font-medium tracking-[0.05em] uppercase"
                                >
                                    DASHBOARD
                                </Link>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/cart" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#191f31] border border-[#2e3447] text-[#f59e0b] hover:border-[#f59e0b]/40 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span className="font-['JetBrains_Mono'] text-xs font-semibold">{totalCartCount} {totalCartCount === 1 ? 'ITEM' : 'ITEMS'}</span>
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-white text-xs font-semibold leading-none">{user.fullname || 'Zentra User'}</span>
                                    <span className="text-[10px] font-mono text-[#f59e0b] uppercase tracking-wider mt-1 bg-[#f59e0b]/10 px-1.5 py-0.2 rounded border border-[#f59e0b]/20">
                                        {user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogoutClick}
                                    className="text-xs font-['JetBrains_Mono'] text-[#a08e7a] hover:text-red-400 transition-colors uppercase border border-[#2e3447] px-3 py-1.5 rounded-md hover:border-red-500/40 cursor-pointer"
                                >
                                    LOGOUT
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="text-xs font-['JetBrains_Mono'] text-[#f59e0b] hover:underline uppercase bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-4 py-1.5 rounded-md"
                            >
                                LOGIN
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-12 py-8 md:py-10">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#a08e7a] uppercase mb-8">
                    <Link to="/" className="hover:text-[#f59e0b] transition-colors">HOME</Link>
                    <span>/</span>
                    <Link to="/" className="hover:text-[#f59e0b] transition-colors">MARKETPLACE</Link>
                    <span>/</span>
                    <span className="text-[#f59e0b] truncate max-w-xs">{loading ? 'LOADING...' : product?.title || 'PRODUCT'}</span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-[#131b2e]/40 rounded-2xl border border-[#2e3447]/40">
                        <div className="w-12 h-12 border-4 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin mb-4"></div>
                        <p className="font-['JetBrains_Mono'] text-[#a08e7a] text-sm tracking-wider uppercase animate-pulse">Loading Product & Variants Details...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 bg-[#131b2e]/40 rounded-2xl border border-[#2e3447]/60 text-center">
                        <div className="w-16 h-16 rounded-full bg-[#191f31] border border-[#2e3447] flex items-center justify-center text-red-400 mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-white mb-2">PRODUCT NOT FOUND</h2>
                        <p className="text-[#a08e7a] text-sm max-w-md mb-6">{error}</p>
                        <Link
                            to="/"
                            className="bg-[#f59e0b] text-[#0c1324] font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg"
                        >
                            Return to Marketplace
                        </Link>
                    </div>
                ) : (
                    /* Product Grid Layout */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                        {/* Left Column: Image Viewer & Gallery */}
                        <div className="lg:col-span-6 space-y-4">
                            {/* Main Image Frame */}
                            <div className="relative w-full h-[450px] md:h-[520px] bg-[#131b2e] border border-[#2e3447] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center group">
                                <img
                                    src={activeImageObj.url}
                                    alt={product.title}
                                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK; }}
                                />

                                {/* Active Image Tag Badge */}
                                <div className="absolute top-4 left-4 bg-[#0c1324]/90 backdrop-blur-md border border-[#2e3447] text-[#f59e0b] font-['JetBrains_Mono'] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                                    {selectedVariant ? `VARIANT: ${getVariantLabel(selectedVariant)}` : 'SELECTED BASE PRODUCT'}
                                </div>

                                {/* Stock Status Badge */}
                                <div className="absolute top-4 right-4 bg-[#0c1324]/90 backdrop-blur-md border border-[#2e3447] px-3 py-1 rounded-full font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider">
                                    {effectiveStock > 0 ? (
                                        <span className="text-emerald-400">{effectiveStock} IN STOCK</span>
                                    ) : (
                                        <span className="text-red-400">OUT OF STOCK</span>
                                    )}
                                </div>

                                {/* Image Controls (Arrows) */}
                                {allImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setImgIdx(p => (p > 0 ? p - 1 : allImages.length - 1))}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0c1324]/80 border border-[#2e3447] text-white flex items-center justify-center hover:border-[#f59e0b] hover:text-[#f59e0b] transition-all cursor-pointer shadow-lg"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setImgIdx(p => (p < allImages.length - 1 ? p + 1 : 0))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0c1324]/80 border border-[#2e3447] text-white flex items-center justify-center hover:border-[#f59e0b] hover:text-[#f59e0b] transition-all cursor-pointer shadow-lg"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* All Images Thumbnail Bar (Base Product Images + Variant Images) */}
                            <div>
                                <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] text-[#a08e7a] mb-2 uppercase">
                                    <span>GALLERY VISUALS ({allImages.length})</span>
                                    <span>CLICK THUMBNAIL TO PREVIEW</span>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                                    {allImages.map((img, idx) => {
                                        const isSelected = imgIdx === idx;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setImgIdx(idx)}
                                                className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-[#0c1324] ${isSelected ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/30' : 'border-[#2e3447] opacity-60 hover:opacity-100 hover:border-gray-500'}`}
                                            >
                                                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                                                <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono text-[#f59e0b] px-1 py-0.5 truncate text-center">
                                                    {img.isVariant ? 'VARIANT' : 'BASE'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Product Details & Variant Cards */}
                        <div className="lg:col-span-6 space-y-6">

                            {/* Title & Seller Header */}
                            <div className="border-b border-[#2e3447]/60 pb-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-mono text-[#f59e0b] uppercase bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2.5 py-0.5 rounded-full">
                                        VERIFIED ASSET
                                    </span>
                                    <span className="text-xs font-mono text-[#a08e7a]">
                                        SELLER: <span className="text-white font-semibold">{typeof product.seller === 'object' ? (product.seller.fullname || product.seller._id) : (product.seller || 'Zentra Seller')}</span>
                                    </span>
                                </div>
                                <h1 className="font-['Hanken_Grotesk'] text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                                    {product.title}
                                </h1>
                            </div>

                            {/* Price Breakdown Banner */}
                            <div className="bg-[#131b2e] border border-[#2e3447] rounded-xl p-4 flex items-baseline justify-between">
                                <div>
                                    <span className="text-xs font-['JetBrains_Mono'] text-[#a08e7a] uppercase block">
                                        {selectedVariant ? `VARIANT PRICE (${getVariantLabel(selectedVariant)})` : 'BASE PRODUCT PRICE'}
                                    </span>
                                    <div className="flex items-baseline gap-3 mt-1">
                                        <span className="font-['Hanken_Grotesk'] text-3xl font-extrabold text-[#f59e0b]">
                                            {formatCurrency(effectivePrice)}
                                        </span>
                                        {selectedVariant && product.price?.amount && parseFloat(selectedVariant.price?.amount || 0) !== parseFloat(product.price.amount) && (
                                            <span className="text-xs font-mono text-[#a08e7a] line-through">
                                                Base: {formatCurrency(product.price)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-xs font-['JetBrains_Mono'] text-emerald-400 font-semibold block">
                                        ✔ IN STOCK & READY
                                    </span>
                                    <span className="text-[11px] text-[#a08e7a]">Includes taxes & warranty</span>
                                </div>
                            </div>

                            {/* Visual Variant Selector Cards */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-['JetBrains_Mono'] text-[#a08e7a] uppercase font-semibold">
                                        SELECT PRODUCT MODEL / VARIANT ({variants.length + 1} OPTIONS)
                                    </label>
                                    {selectedVariant && (
                                        <button
                                            onClick={() => handleSelectVariant(null)}
                                            className="text-[11px] font-['JetBrains_Mono'] text-[#f59e0b] hover:underline cursor-pointer"
                                        >
                                            RESET TO BASE PRODUCT
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Base Product Option Card */}
                                    <div
                                        onClick={() => handleSelectVariant(null)}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${selectedVariant === null ? 'bg-[#191f31] border-[#f59e0b] ring-1 ring-[#f59e0b]/40 shadow-lg' : 'bg-[#131b2e] border-[#2e3447] hover:border-gray-500'}`}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-[#0c1324] border border-[#2e3447] overflow-hidden shrink-0">
                                            <img src={getUrl(product.images?.[0]) || DEFAULT_FALLBACK} alt="Base Product" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-white truncate">BASE MODEL</span>
                                                {selectedVariant === null && (
                                                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                                                )}
                                            </div>
                                            <span className="text-[11px] font-mono text-[#f59e0b] block mt-0.5">{formatCurrency(product.price)}</span>
                                            <span className="text-[10px] font-mono text-[#a08e7a] block">Original Product</span>
                                        </div>
                                    </div>

                                    {/* Variant Cards */}
                                    {variants.map((v, i) => {
                                        const isSelected = selectedVariant?._id === v._id;
                                        const vImgUrl = getUrl(v.images?.[0]) || getUrl(product.images?.[0]) || DEFAULT_FALLBACK;
                                        const label = getVariantLabel(v);
                                        const vPrice = v.price?.amount ? v.price : product.price;

                                        return (
                                            <div
                                                key={v._id || i}
                                                onClick={() => handleSelectVariant(v)}
                                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${isSelected ? 'bg-[#191f31] border-[#f59e0b] ring-1 ring-[#f59e0b]/40 shadow-lg' : 'bg-[#131b2e] border-[#2e3447] hover:border-gray-500'}`}
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-[#0c1324] border border-[#2e3447] overflow-hidden shrink-0">
                                                    <img src={vImgUrl} alt={label} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-white truncate">{label}</span>
                                                        {isSelected && (
                                                            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] font-mono text-[#f59e0b] block mt-0.5">{formatCurrency(vPrice)}</span>
                                                    <span className={`text-[10px] font-mono block ${v.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {v.stock > 0 ? `${v.stock} Available` : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center gap-4 pt-2">
                                <span className="text-xs font-['JetBrains_Mono'] text-[#a08e7a] uppercase font-semibold">QUANTITY</span>
                                <div className="flex items-center bg-[#0c1324] border border-[#2e3447] rounded-lg p-1">
                                    <button
                                        onClick={() => setQty(q => Math.max(1, q - 1))}
                                        disabled={qty <= 1}
                                        className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#191f31] disabled:opacity-30 rounded-md transition-colors cursor-pointer text-lg font-bold"
                                    >
                                        −
                                    </button>
                                    <span className="w-12 text-center font-['JetBrains_Mono'] text-sm font-bold text-white">
                                        {qty}
                                    </span>
                                    <button
                                        onClick={() => setQty(q => (q < effectiveStock ? q + 1 : q))}
                                        disabled={qty >= effectiveStock}
                                        className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#191f31] disabled:opacity-30 rounded-md transition-colors cursor-pointer text-lg font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Primary Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button
                                    onClick={handleAddToCartClick}
                                    className="flex-1 bg-[#f59e0b] hover:bg-[#ffb95f] text-[#472a00] font-['Hanken_Grotesk'] font-bold text-sm py-4 rounded-xl shadow-lg shadow-[#f59e0b]/20 hover:shadow-[#f59e0b]/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.99]"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <span>ADD TO CART</span>
                                </button>
                                <button
                                    onClick={async () => {
                                        await handleAddToCartClick();
                                        navigate('/cart');
                                    }}
                                    className="flex-1 bg-[#191f31] hover:bg-[#23293c] border border-[#f59e0b]/40 hover:border-[#f59e0b] text-[#f59e0b] font-['Hanken_Grotesk'] font-bold text-sm py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>BUY NOW</span>
                                </button>
                            </div>

                            {/* Details Accordion */}
                            <div className="border-t border-[#2e3447]/80 pt-4">
                                <button
                                    onClick={() => setDetailOpen(o => !o)}
                                    className="w-full flex items-center justify-between text-xs font-['JetBrains_Mono'] uppercase text-[#a08e7a] hover:text-white cursor-pointer transition-colors py-2"
                                >
                                    <span>PRODUCT DESCRIPTION & SPECIFICATIONS</span>
                                    <svg className={`w-4 h-4 transition-transform ${detailOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {detailOpen && (
                                    <div className="mt-3 bg-[#131b2e] border border-[#2e3447]/60 rounded-xl p-4 text-xs text-[#dce1fb] leading-relaxed whitespace-pre-line">
                                        {product.description || 'No detailed description provided for this product.'}
                                    </div>
                                )}
                            </div>

                            {/* Check Delivery PIN code */}
                            <div className="border-t border-[#2e3447]/80 pt-4 space-y-2">
                                <label className="block text-xs font-['JetBrains_Mono'] text-[#a08e7a] uppercase">
                                    CHECK EXPRESS DELIVERY
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={pincode}
                                        onChange={e => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setDMsg(null); }}
                                        placeholder="ENTER 6-DIGIT PIN CODE"
                                        className="flex-1 bg-[#0c1324] border border-[#2e3447] focus:border-[#f59e0b] text-white text-xs px-3.5 py-2.5 rounded-lg outline-none font-['JetBrains_Mono'] transition-colors"
                                    />
                                    <button
                                        onClick={checkDelivery}
                                        className="bg-[#191f31] hover:bg-[#23293c] text-[#f59e0b] font-['JetBrains_Mono'] font-semibold text-xs px-4 py-2.5 rounded-lg border border-[#f59e0b]/30 hover:border-[#f59e0b] transition-all cursor-pointer"
                                    >
                                        CHECK
                                    </button>
                                </div>
                                {dMsg && (
                                    <p className={`text-xs font-['JetBrains_Mono'] mt-1 ${dMsg.startsWith('Delivery') ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {dMsg}
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="w-full bg-[#0c1324] border-t border-[#2e3447]/50 mt-auto py-8 text-center text-xs font-['JetBrains_Mono'] text-[#a08e7a]">
                <div className="max-w-[1400px] mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span>© {new Date().getFullYear()} ZENTRA LUXURY MARKETPLACE. ALL RIGHTS RESERVED.</span>
                    <div className="flex items-center gap-6">
                        <Link to="/" className="hover:text-[#f59e0b] transition-colors">HOME</Link>
                        <Link to="/" className="hover:text-[#f59e0b] transition-colors">MARKETPLACE</Link>
                        <Link to="/cart" className="hover:text-[#f59e0b] transition-colors">CART</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
