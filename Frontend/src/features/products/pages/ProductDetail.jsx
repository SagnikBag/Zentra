import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { handleGetProductById } = useProduct();
    const { handleLogout } = useAuth();

    const rawUser = useSelector(state => state.auth.user);
    const user = useMemo(() => {
        return rawUser?.user ? rawUser.user : rawUser;
    }, [rawUser]);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI state
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [toastMessage, setToastMessage] = useState(null);
    const [copiedId, setCopiedId] = useState(false);

    // Helper to safely extract image URLs
    const extractImageUrl = (img) => {
        if (!img) return null;
        if (typeof img === 'string') return img;
        return img.url || img.secure_url || img.path || img.src || img.preview || null;
    };

    // Helper to format currency
    const formatPrice = (priceObj) => {
        if (!priceObj) return '₹0.00';
        const amount = parseFloat(priceObj.amount || 0);
        const currency = priceObj.currency || 'INR';

        try {
            return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
                style: 'currency',
                currency: currency,
                maximumFractionDigits: 2,
            }).format(amount);
        } catch {
            return `${currency} ${amount.toLocaleString()}`;
        }
    };

    // Format date string
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Trigger temporary feedback toasts for button actions
    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    const handleCopyId = (id) => {
        if (!id) return;
        navigator.clipboard.writeText(id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    async function fetchProductDetails() {
        if (!productId) {
            setError("No product ID provided");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await handleGetProductById(productId);
            const fetchedProduct = data?.product || data?.data || data;

            if (fetchedProduct && (fetchedProduct._id || fetchedProduct.title)) {
                setProduct(fetchedProduct);
            } else {
                // If API returns empty or invalid structure, set null
                setProduct(data || null);
            }
        } catch (err) {
            console.error("Failed to fetch product details:", err);
            setError(err?.response?.data?.message || "Failed to load product details");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProductDetails();
        window.scrollTo(0, 0);
    }, [productId]);

    // Fallback sample product images if list is empty or unavailable
    const defaultPlaceholderImages = [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop"
    ];

    const productImages = useMemo(() => {
        if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
            const extracted = product.images.map(extractImageUrl).filter(Boolean);
            if (extracted.length > 0) return extracted;
        }
        return defaultPlaceholderImages;
    }, [product]);

    const activeImageUrl = productImages[selectedImageIndex] || productImages[0];

    const handleLogoutClick = async () => {
        try {
            await handleLogout();
            navigate('/login');
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0c1324] text-[#a08e7a] font-sans flex flex-col selection:bg-[#f59e0b] selection:text-[#0c1324]">
            {/* Notification Toast */}
            {toastMessage && (
                <div className="fixed top-20 right-6 z-50 bg-[#131b2e] border border-[#f59e0b]/40 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                    <p className="text-sm font-medium">{toastMessage}</p>
                </div>
            )}

            {/* Top Navigation Bar */}
            <header className="border-b border-[#2e3447]/60 bg-[#0c1324]/90 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-[1400px] mx-auto px-4 md:px-12 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-[#f59e0b] flex items-center justify-center text-[#0c1324] font-black text-lg group-hover:scale-105 transition-transform">
                                Z
                            </div>
                            <span className="font-['Hanken_Grotesk'] text-xl font-bold text-white tracking-wider">
                                ZENTRA
                            </span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                to="/"
                                className="text-white hover:text-[#f59e0b] transition-colors duration-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Products
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-white text-xs font-semibold leading-none">{user.fullname || 'Zentra User'}</span>
                                    <span className="text-[10px] font-mono text-[#f59e0b] uppercase tracking-wider mt-1 bg-[#f59e0b]/10 px-1.5 py-0.5 rounded border border-[#f59e0b]/20">
                                        {user.role || 'Member'}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogoutClick}
                                    className="border border-[#2e3447] hover:border-rose-500/40 text-[#a08e7a] hover:text-rose-400 bg-[#131b2e] text-xs font-semibold uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="text-white hover:text-[#f59e0b] text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-lg transition-all"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-[#f59e0b] hover:bg-[#d97706] text-[#0c1324] font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-all shadow-lg shadow-[#f59e0b]/10"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 md:px-12 py-8 relative">
                {/* Ambient glow backgrounds */}
                <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-[#f59e0b]/5 rounded-full blur-[140px] pointer-events-none"></div>
                <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#f59e0b]/2 rounded-full blur-[120px] pointer-events-none"></div>

                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-2 text-xs font-mono text-[#a08e7a]/80 mb-6 flex-wrap">
                    <Link to="/" className="hover:text-[#f59e0b] transition-colors">Marketplace</Link>
                    <span>/</span>
                    <span className="text-white font-medium truncate max-w-[200px] sm:max-w-md">
                        {loading ? 'Loading Asset...' : (product?.title || 'Product Details')}
                    </span>
                </nav>

                {/* Loading Skeleton */}
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
                        <div className="lg:col-span-6 space-y-4">
                            <div className="h-[420px] bg-[#131b2e] rounded-2xl border border-[#2e3447]/60"></div>
                            <div className="grid grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-20 bg-[#131b2e] rounded-xl border border-[#2e3447]/40"></div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-6 space-y-6">
                            <div className="h-4 w-32 bg-[#131b2e] rounded"></div>
                            <div className="h-10 w-3/4 bg-[#131b2e] rounded-xl"></div>
                            <div className="h-6 w-1/2 bg-[#131b2e] rounded"></div>
                            <div className="h-24 bg-[#131b2e] rounded-xl"></div>
                            <div className="h-12 bg-[#131b2e] rounded-xl"></div>
                        </div>
                    </div>
                ) : error ? (
                    /* Error State */
                    <div className="bg-[#131b2e] border border-rose-500/30 rounded-2xl p-8 md:p-12 text-center max-w-xl mx-auto my-12">
                        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Product Not Found</h2>
                        <p className="text-[#a08e7a] text-sm mb-6">{error}</p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={fetchProductDetails}
                                className="px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-[#0c1324] font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors"
                            >
                                Try Again
                            </button>
                            <Link
                                to="/"
                                className="px-5 py-2.5 bg-[#0c1324] border border-[#2e3447] text-white hover:border-[#f59e0b]/50 font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors"
                            >
                                Return to Store
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Main Product Grid */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        
                        {/* LEFT COLUMN: Gallery */}
                        <div className="lg:col-span-6 flex flex-col gap-4">
                            {/* Main Stage Image */}
                            <div className="relative group rounded-2xl overflow-hidden bg-[#131b2e] border border-[#2e3447]/80 aspect-4/3 flex items-center justify-center shadow-xl">
                                {activeImageUrl ? (
                                    <img
                                        src={activeImageUrl}
                                        alt={product?.title || "Product image"}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultPlaceholderImages[0];
                                        }}
                                    />
                                ) : (
                                    <div className="text-center p-6">
                                        <svg className="w-16 h-16 text-[#2e3447] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs font-mono text-[#a08e7a]">Image Unavailable</span>
                                    </div>
                                )}

                                {/* Overlay Badges */}
                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                    <span className="bg-[#0c1324]/80 backdrop-blur-md border border-[#f59e0b]/30 text-[#f59e0b] text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md">
                                        Verified Asset
                                    </span>
                                    <span className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        In Stock
                                    </span>
                                </div>

                                {/* Previous / Next Buttons */}
                                {productImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1))}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0c1324]/70 hover:bg-[#0c1324] border border-[#2e3447] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                            aria-label="Previous image"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            onClick={() => setSelectedImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0c1324]/70 hover:bg-[#0c1324] border border-[#2e3447] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                            aria-label="Next image"
                                        >
                                            ›
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail Row */}
                            {productImages.length > 1 && (
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                    {productImages.map((imgUrl, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`relative rounded-xl overflow-hidden border aspect-square bg-[#131b2e] transition-all cursor-pointer ${
                                                selectedImageIndex === index
                                                    ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/20 scale-[1.02]'
                                                    : 'border-[#2e3447]/60 opacity-60 hover:opacity-100 hover:border-[#a08e7a]/40'
                                            }`}
                                        >
                                            <img
                                                src={imgUrl}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = defaultPlaceholderImages[index % defaultPlaceholderImages.length];
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Trust Specs */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="bg-[#131b2e]/60 border border-[#2e3447]/50 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] flex items-center justify-center shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-white text-xs font-semibold">Instant Dispatch</h4>
                                        <p className="text-[11px] text-[#a08e7a]/70">Verified within 2 hours</p>
                                    </div>
                                </div>
                                <div className="bg-[#131b2e]/60 border border-[#2e3447]/50 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-white text-xs font-semibold">Protected Trade</h4>
                                        <p className="text-[11px] text-[#a08e7a]/70">Escrow backed guarantee</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Product Info & Actions */}
                        <div className="lg:col-span-6 flex flex-col justify-between">
                            <div className="space-y-6">
                                
                                {/* Header Info: Seller & Date */}
                                <div className="flex items-center justify-between gap-4 border-b border-[#2e3447]/60 pb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-[#a08e7a]">Seller:</span>
                                        <span className="text-xs font-mono text-white bg-[#131b2e] border border-[#2e3447] px-2.5 py-1 rounded-md flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                                            {product?.seller ? (typeof product.seller === 'object' ? (product.seller.fullname || product.seller._id) : product.seller) : 'Zentra Verified Merchant'}
                                        </span>
                                    </div>
                                    <div className="text-xs font-mono text-[#a08e7a]/70">
                                        Listed: {formatDate(product?.createdAt)}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <h1 className="font-['Hanken_Grotesk'] text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
                                        {product?.title || 'Unnamed Asset'}
                                    </h1>
                                    
                                    {/* Product ID & Rating */}
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                                        <div className="flex items-center gap-1 text-[#f59e0b]">
                                            {'★'.repeat(5)}
                                            <span className="text-white font-bold ml-1">4.9</span>
                                            <span className="text-[#a08e7a]">(32 reviews)</span>
                                        </div>
                                        <span className="text-[#2e3447]">|</span>
                                        <div className="flex items-center gap-1.5 text-[#a08e7a]">
                                            <span>ID:</span>
                                            <code className="text-[#f59e0b] bg-[#131b2e] px-1.5 py-0.5 rounded">
                                                {product?._id || productId || 'N/A'}
                                            </code>
                                            <button
                                                onClick={() => handleCopyId(product?._id || productId)}
                                                className="hover:text-white transition-colors"
                                                title="Copy ID"
                                            >
                                                {copiedId ? '✓' : '📋'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Box */}
                                <div className="bg-gradient-to-r from-[#131b2e] to-[#0c1324] border border-[#2e3447] rounded-2xl p-5 shadow-lg relative overflow-hidden">
                                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-[#f59e0b]/10 rounded-full blur-2xl pointer-events-none"></div>
                                    <span className="text-xs font-mono uppercase tracking-widest text-[#a08e7a]">Price</span>
                                    <div className="flex items-baseline gap-3 mt-1">
                                        <span className="font-['Hanken_Grotesk'] text-3xl sm:text-4xl font-extrabold text-[#f59e0b]">
                                            {formatPrice(product?.price)}
                                        </span>
                                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                            Tax Included
                                        </span>
                                    </div>
                                    <p className="text-[#a08e7a]/70 text-xs mt-2">
                                        Free express shipping on all domestic orders • 7-day hassle-free replacement
                                    </p>
                                </div>

                                {/* Quantity Selector */}
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase tracking-wider text-[#a08e7a]">Quantity</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-[#2e3447] rounded-xl bg-[#131b2e] overflow-hidden">
                                            <button
                                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                                className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#2e3447]/50 text-lg transition-colors cursor-pointer"
                                                aria-label="Decrease quantity"
                                            >
                                                -
                                            </button>
                                            <span className="w-12 text-center text-sm font-bold text-white font-mono">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity((q) => q + 1)}
                                                className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#2e3447]/50 text-lg transition-colors cursor-pointer"
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-xs font-mono text-[#a08e7a]/70">
                                            Only {Math.floor(Math.random() * 15) + 3} items left in stock
                                        </span>
                                    </div>
                                </div>

                                {/* REQUIRED TWO ACTION BUTTONS */}
                                <div className="pt-2 flex flex-col sm:flex-row gap-4">
                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={() => showToast(`[Demo] ${quantity} x "${product?.title || 'Product'}" added to cart!`)}
                                        className="flex-1 py-3.5 px-6 rounded-xl font-bold text-white bg-[#131b2e] hover:bg-[#1c273e] border border-[#2e3447] hover:border-[#f59e0b]/50 transition-all flex items-center justify-center gap-2.5 active:scale-95 shadow-md group cursor-pointer"
                                    >
                                        <svg className="w-5 h-5 text-[#f59e0b] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" />
                                        </svg>
                                        <span>Add to Cart</span>
                                    </button>

                                    {/* Buy Now Button */}
                                    <button
                                        onClick={() => showToast(`[Demo] Proceeding to checkout for "${product?.title || 'Product'}"...`)}
                                        className="flex-1 py-3.5 px-6 rounded-xl font-bold text-[#0c1324] bg-[#f59e0b] hover:bg-[#d97706] transition-all flex items-center justify-center gap-2.5 active:scale-95 shadow-lg shadow-[#f59e0b]/20 group cursor-pointer"
                                    >
                                        <svg className="w-5 h-5 text-[#0c1324] group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>Buy Now</span>
                                    </button>
                                </div>

                                {/* Information Tabs */}
                                <div className="border border-[#2e3447]/60 rounded-2xl bg-[#131b2e]/40 overflow-hidden mt-6">
                                    <div className="flex border-b border-[#2e3447]/60 bg-[#0c1324]/50 font-mono text-xs">
                                        <button
                                            onClick={() => setActiveTab('description')}
                                            className={`flex-1 py-3 px-4 font-semibold transition-colors cursor-pointer ${
                                                activeTab === 'description'
                                                    ? 'text-[#f59e0b] border-b-2 border-[#f59e0b] bg-[#131b2e]'
                                                    : 'text-[#a08e7a] hover:text-white'
                                            }`}
                                        >
                                            Description
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('details')}
                                            className={`flex-1 py-3 px-4 font-semibold transition-colors cursor-pointer ${
                                                activeTab === 'details'
                                                    ? 'text-[#f59e0b] border-b-2 border-[#f59e0b] bg-[#131b2e]'
                                                    : 'text-[#a08e7a] hover:text-white'
                                            }`}
                                        >
                                            Details & Metadata
                                        </button>
                                    </div>

                                    <div className="p-5 text-sm leading-relaxed text-[#a08e7a]">
                                        {activeTab === 'description' ? (
                                            <div className="space-y-3">
                                                <p className="whitespace-pre-line text-white/90">
                                                    {product?.description || 'No description provided for this product.'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 font-mono text-xs">
                                                <div className="flex justify-between py-1.5 border-b border-[#2e3447]/40">
                                                    <span className="text-[#a08e7a]">Object ID:</span>
                                                    <span className="text-white font-medium">{product?._id || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between py-1.5 border-b border-[#2e3447]/40">
                                                    <span className="text-[#a08e7a]">Seller Reference:</span>
                                                    <span className="text-white font-medium">
                                                        {typeof product?.seller === 'object' ? product?.seller?._id : (product?.seller || 'N/A')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-1.5 border-b border-[#2e3447]/40">
                                                    <span className="text-[#a08e7a]">Created At:</span>
                                                    <span className="text-white font-medium">{product?.createdAt || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between py-1.5 border-b border-[#2e3447]/40">
                                                    <span className="text-[#a08e7a]">Updated At:</span>
                                                    <span className="text-white font-medium">{product?.updatedAt || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between py-1.5">
                                                    <span className="text-[#a08e7a]">Currency & Amount:</span>
                                                    <span className="text-white font-medium">
                                                        {product?.price?.currency || 'INR'} {product?.price?.amount || '0'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-[#2e3447]/60 bg-[#0c1324] py-8 text-center text-xs font-mono text-[#a08e7a]/60 mt-auto">
                <div className="max-w-[1400px] mx-auto px-4">
                    <p>© 2026 Zentra Trade Network. Product detail preview environment.</p>
                </div>
            </footer>
        </div>
    );
}