import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import { ProductCardSkeleton } from '../../../components/ui/Skeleton';
import { EmptyProductsState } from '../../../components/ui/EmptyState';

/* ── Icons ─────────────────────────────────────────────── */
const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);
const GridIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
);
const ListIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);
const ArrowRightIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
);

/* ── Product Card ──────────────────────────────────────── */
function ProductCard({ product, onView }) {
    const mainImage = product.images?.[0]?.url;
    const price = formatPrice(product.price);

    return (
        <div
            onClick={() => onView(product._id)}
            className="group bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 flex flex-col"
        >
            {/* Image */}
            <div className="relative h-52 bg-[#09090b] overflow-hidden flex-shrink-0">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
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
                {/* Price badge */}
                <div className="absolute top-3 right-3 bg-[#09090b]/90 backdrop-blur-sm border border-[#3f3f46]/60 text-[#f59e0b] font-bold text-xs px-2.5 py-1 rounded-lg font-mono shadow-lg">
                    {price}
                </div>
                {/* Image count */}
                {product.images?.length > 1 && (
                    <div className="absolute bottom-3 left-3 bg-[#09090b]/80 backdrop-blur-sm border border-[#27272a] text-[#71717a] text-[10px] font-mono px-2 py-0.5 rounded-md">
                        +{product.images.length - 1} more
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                    <h3 className="font-semibold text-[#fafafa] text-sm leading-snug line-clamp-1 group-hover:text-[#f59e0b] transition-colors duration-200 mb-1.5">
                        {product.title || 'Untitled Product'}
                    </h3>
                    <p className="text-[#71717a] text-xs leading-relaxed line-clamp-2">
                        {product.description || 'No description provided.'}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#27272a]">
                    <span className="text-[11px] font-mono text-[#52525b]">
                        {formatDate(product.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#f59e0b] text-xs font-semibold group-hover:gap-2 transition-all duration-200">
                        View <ArrowRightIcon />
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ── Helpers ───────────────────────────────────────────── */
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

function formatDate(iso) {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Home Page ─────────────────────────────────────────── */
const Home = () => {
    const { handleGetAllProducts } = useProduct();
    const navigate = useNavigate();

    const rawProducts = useSelector(state => state.product.products);
    const products = useMemo(() => {
        if (Array.isArray(rawProducts)) return rawProducts;
        if (rawProducts && Array.isArray(rawProducts.products)) return rawProducts.products;
        return [];
    }, [rawProducts]);

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');

    const fetchProducts = async () => {
        setLoading(true);
        try { await handleGetAllProducts(); }
        catch (err) { console.error('Failed to fetch products:', err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, []);

    const filteredProducts = useMemo(() => {
        let result = [...products];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.title?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
            );
        }
        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            if (sortBy === 'price-high') return parseFloat(b.price?.amount || 0) - parseFloat(a.price?.amount || 0);
            if (sortBy === 'price-low') return parseFloat(a.price?.amount || 0) - parseFloat(b.price?.amount || 0);
            if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
            return 0;
        });
        return result;
    }, [products, searchQuery, sortBy]);

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa]">

            {/* ── Hero Section ─────────────────────────────── */}
            <section className="relative overflow-hidden border-b border-[#18181b]">
                {/* Ambient glows */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#f59e0b]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#f59e0b]/3 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-20 md:py-28 relative z-10">
                    <div className="max-w-2xl z-animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                                Live Marketplace
                            </span>
                            <span className="text-[11px] font-mono uppercase tracking-widest text-[#52525b]">
                                {products.length} Products
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#fafafa] leading-[1.1] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            Premium Products,{' '}
                            <span className="text-[#f59e0b]">Curated</span>{' '}
                            for You.
                        </h1>

                        <p className="text-[#a1a1aa] text-lg leading-relaxed mb-10 max-w-xl">
                            Discover and shop from a handpicked selection of premium products. Seamless checkout, verified sellers.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <a
                                href="#marketplace"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#f59e0b] text-[#09090b] font-bold text-sm rounded-xl hover:bg-[#d97706] transition-all duration-200 shadow-[0_8px_24px_rgba(245,158,11,0.3)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.45)] active:scale-[0.98]"
                            >
                                Shop Now
                                <ArrowRightIcon />
                            </a>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent text-[#a1a1aa] font-semibold text-sm border border-[#3f3f46] rounded-xl hover:border-[#52525b] hover:text-[#fafafa] transition-all duration-200"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Marketplace Section ───────────────────────── */}
            <section id="marketplace" className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-14">

                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-[#fafafa] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            All Products
                        </h2>
                        <p className="text-sm text-[#71717a] mt-1">
                            {loading ? 'Loading…' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} available`}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#52525b]">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search products…"
                                className="w-52 md:w-64 pl-9 pr-4 py-2.5 bg-[#18181b] border border-[#27272a] focus:border-[#f59e0b]/50 rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none transition-colors duration-200"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-2 flex items-center px-1 text-[#52525b] hover:text-[#a1a1aa] cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2 bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2.5">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#52525b]">Sort</span>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="bg-transparent text-xs text-[#fafafa] focus:outline-none cursor-pointer"
                            >
                                <option value="newest" className="bg-[#18181b]">Newest</option>
                                <option value="oldest" className="bg-[#18181b]">Oldest</option>
                                <option value="price-high" className="bg-[#18181b]">Price ↓</option>
                                <option value="price-low" className="bg-[#18181b]">Price ↑</option>
                                <option value="title" className="bg-[#18181b]">A–Z</option>
                            </select>
                        </div>

                        {/* View toggle */}
                        <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${viewMode === 'grid' ? 'bg-[#f59e0b]/15 text-[#f59e0b]' : 'text-[#52525b] hover:text-[#a1a1aa]'}`}
                                title="Grid view"
                            >
                                <GridIcon />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${viewMode === 'table' ? 'bg-[#f59e0b]/15 text-[#f59e0b]' : 'text-[#52525b] hover:text-[#a1a1aa]'}`}
                                title="List view"
                            >
                                <ListIcon />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Content ─── */}
                {loading ? (
                    /* Skeleton grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl">
                        <EmptyProductsState
                            hasSearch={!!searchQuery}
                            onClear={() => setSearchQuery('')}
                        />
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid view */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product, i) => (
                            <div key={product._id} className="z-animate-fade-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
                                <ProductCard product={product} onView={id => navigate(`/product/${id}`)} />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List view */
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[#27272a] bg-[#09090b]">
                                        <th className="py-4 px-5 text-[11px] font-mono uppercase tracking-widest text-[#52525b]">Product</th>
                                        <th className="py-4 px-5 text-[11px] font-mono uppercase tracking-widest text-[#52525b]">Price</th>
                                        <th className="py-4 px-5 text-[11px] font-mono uppercase tracking-widest text-[#52525b] hidden md:table-cell">Listed</th>
                                        <th className="py-4 px-5 text-[11px] font-mono uppercase tracking-widest text-[#52525b] text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272a]">
                                    {filteredProducts.map(product => {
                                        const img = product.images?.[0]?.url;
                                        return (
                                            <tr
                                                key={product._id}
                                                className="hover:bg-[#27272a]/40 transition-colors duration-150 cursor-pointer"
                                                onClick={() => navigate(`/product/${product._id}`)}
                                            >
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-[#09090b] border border-[#27272a] overflow-hidden shrink-0">
                                                            {img
                                                                ? <img src={img} alt={product.title} className="w-full h-full object-cover" />
                                                                : <div className="w-full h-full flex items-center justify-center text-[#3f3f46]">
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                                                    </svg>
                                                                </div>
                                                            }
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-[#fafafa] line-clamp-1">{product.title || 'Untitled'}</div>
                                                            <div className="text-xs text-[#71717a] line-clamp-1 max-w-[240px]">{product.description || 'No description'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <span className="font-bold font-mono text-[#f59e0b] text-sm">{formatPrice(product.price)}</span>
                                                </td>
                                                <td className="py-4 px-5 hidden md:table-cell text-xs font-mono text-[#52525b]">
                                                    {formatDate(product.createdAt)}
                                                </td>
                                                <td className="py-4 px-5 text-right">
                                                    <span className="inline-flex items-center gap-1 text-[#f59e0b] text-xs font-semibold hover:gap-2 transition-all duration-200">
                                                        View <ArrowRightIcon />
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            {/* ── Features strip ──────────────────────────── */}
            <section className="border-t border-[#18181b] bg-[#18181b]/30">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                            {
                                icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                    </svg>
                                ),
                                title: 'Verified Sellers',
                                desc: 'Every seller on Zentra is verified and trusted.'
                            },
                            {
                                icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                                    </svg>
                                ),
                                title: 'Secure Checkout',
                                desc: 'Powered by Razorpay for safe, encrypted payments.'
                            },
                            {
                                icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                ),
                                title: 'Fast Delivery',
                                desc: 'Express shipping available on all eligible orders.'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] shrink-0">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-[#fafafa] mb-1">{feature.title}</h3>
                                    <p className="text-xs text-[#71717a] leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;