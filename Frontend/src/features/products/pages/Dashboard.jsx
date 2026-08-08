import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';

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
const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const BoxIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
);
const ChartIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
);
const PhotoIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);
const CopyIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
);
const CheckIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

export function Dashboard() {
    const { handleGetSellerProduct } = useProduct();
    const rawSellerProducts = useSelector(state => state.product.sellerProducts);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [copiedId, setCopiedId] = useState(null);

    const navigate = useNavigate();

    // Parse products
    const products = useMemo(() => {
        if (Array.isArray(rawSellerProducts)) return rawSellerProducts;
        if (rawSellerProducts && Array.isArray(rawSellerProducts.products)) return rawSellerProducts.products;
        return [];
    }, [rawSellerProducts]);

    const fetchProducts = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        try {
            await handleGetSellerProduct();
        } catch (err) {
            console.error("Failed to fetch seller products:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Portfolio Metrics
    const metrics = useMemo(() => {
        const totalProducts = products.length;
        const totalImages = products.reduce((acc, p) => acc + (p.images?.length || 0), 0);

        const valueByCurrency = products.reduce((acc, p) => {
            const curr = p.price?.currency || 'USD';
            const amt = parseFloat(p.price?.amount || 0);
            acc[curr] = (acc[curr] || 0) + (isNaN(amt) ? 0 : amt);
            return acc;
        }, {});

        const formattedTotalValue = Object.entries(valueByCurrency)
            .map(([curr, total]) => {
                try {
                    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(total);
                } catch {
                    return `${curr} ${total.toFixed(2)}`;
                }
            })
            .join(' + ') || '$0.00';

        return { totalProducts, totalImages, formattedTotalValue };
    }, [products]);

    // Filter & Sort
    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.title?.toLowerCase().includes(query) ||
                    p.description?.toLowerCase().includes(query) ||
                    p._id?.toLowerCase().includes(query)
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

    const formatPrice = (price) => {
        if (!price) return '$0.00';
        const amount = parseFloat(price.amount || 0);
        const currency = price.currency || 'USD';
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                maximumFractionDigits: 2,
            }).format(amount);
        } catch {
            return `${currency} ${amount.toFixed(2)}`;
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const copyToClipboard = (id, e) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa]">
            <main className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 relative">

                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f59e0b]/5 rounded-full blur-[140px] pointer-events-none" />

                {/* Page Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 z-10 relative">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2.5 py-0.5 rounded-full">
                                Seller Portal
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-2.5 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                                Live Sync
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#fafafa]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            Dashboard
                        </h1>
                        <p className="text-sm text-[#71717a] mt-1">Manage and analyze your product portfolio.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchProducts(true)}
                            disabled={refreshing}
                            className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-all cursor-pointer disabled:opacity-50"
                            title="Refresh Data"
                        >
                            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin text-[#f59e0b]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <Link
                            to="/seller/create-product"
                            className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#09090b] font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-[0_4px_12px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)]"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Product
                        </Link>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 relative z-10">
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 relative overflow-hidden group hover:border-[#3f3f46] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-mono uppercase tracking-widest text-[#71717a]">Total Products</span>
                            <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
                                <BoxIcon />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-[#fafafa] tracking-tight">
                            {loading ? <div className="h-9 w-20 bg-[#27272a] rounded-lg animate-pulse" /> : metrics.totalProducts}
                        </div>
                        <div className="text-xs text-[#52525b] mt-2">Active listings in inventory</div>
                    </div>

                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 relative overflow-hidden group hover:border-[#3f3f46] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-mono uppercase tracking-widest text-[#71717a]">Portfolio Value</span>
                            <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                                <ChartIcon />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-[#fafafa] tracking-tight">
                            {loading ? <div className="h-9 w-28 bg-[#27272a] rounded-lg animate-pulse" /> : metrics.formattedTotalValue}
                        </div>
                        <div className="text-xs text-[#52525b] mt-2">Combined valuation across items</div>
                    </div>

                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 relative overflow-hidden group hover:border-[#3f3f46] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-mono uppercase tracking-widest text-[#71717a]">Media Assets</span>
                            <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6]">
                                <PhotoIcon />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-[#fafafa] tracking-tight">
                            {loading ? <div className="h-9 w-16 bg-[#27272a] rounded-lg animate-pulse" /> : metrics.totalImages}
                        </div>
                        <div className="text-xs text-[#52525b] mt-2">High-res images hosted</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 mb-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 relative z-10">
                    <div className="relative flex-grow max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#52525b]">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, desc, or ID…"
                            className="w-full pl-11 pr-4 py-2.5 bg-[#09090b] border border-[#27272a] focus:border-[#f59e0b]/50 rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#52525b] hover:text-[#fafafa]"
                            >
                                <CloseIcon />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2">
                            <span className="text-[11px] font-mono uppercase tracking-widest text-[#52525b]">Sort</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-xs text-[#fafafa] focus:outline-none cursor-pointer pr-1"
                            >
                                <option value="newest" className="bg-[#18181b]">Newest</option>
                                <option value="oldest" className="bg-[#18181b]">Oldest</option>
                                <option value="price-high" className="bg-[#18181b]">Price ↓</option>
                                <option value="price-low" className="bg-[#18181b]">Price ↑</option>
                                <option value="title" className="bg-[#18181b]">Title A-Z</option>
                            </select>
                        </div>

                        <div className="flex items-center bg-[#09090b] border border-[#27272a] rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-[#f59e0b]/15 text-[#f59e0b]' : 'text-[#52525b] hover:text-[#fafafa]'}`}
                            >
                                <GridIcon />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'bg-[#f59e0b]/15 text-[#f59e0b]' : 'text-[#52525b] hover:text-[#fafafa]'}`}
                            >
                                <ListIcon />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-4 text-xs font-mono text-[#71717a]">
                    Showing <strong className="text-[#fafafa]">{filteredProducts.length}</strong> of {products.length} products
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden animate-pulse">
                                <div className="h-52 bg-[#27272a]/50" />
                                <div className="p-5 space-y-3">
                                    <div className="h-5 bg-[#3f3f46]/50 rounded w-3/4" />
                                    <div className="h-4 bg-[#27272a] rounded w-full" />
                                    <div className="h-4 bg-[#27272a] rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-16 text-center max-w-2xl mx-auto flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#52525b] mb-6">
                            <SearchIcon />
                        </div>
                        <h3 className="text-xl font-semibold text-[#fafafa] mb-2">No products found</h3>
                        <p className="text-sm text-[#71717a] mb-6 max-w-sm">
                            {searchQuery ? `No items matched "${searchQuery}". Try a different term.` : "You haven't listed any products yet."}
                        </p>
                        {!searchQuery && (
                            <Link to="/seller/create-product" className="px-5 py-2.5 bg-[#f59e0b] text-[#09090b] font-bold text-sm rounded-xl hover:bg-[#d97706] transition-all">
                                Add Product
                            </Link>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => {
                            const mainImg = product.images?.[0]?.url;
                            return (
                                <div
                                    key={product._id}
                                    onClick={() => navigate(`/seller/product/${product._id}`)}
                                    className="group bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="relative h-48 bg-[#09090b] border-b border-[#27272a] flex items-center justify-center overflow-hidden">
                                        {mainImg ? (
                                            <img src={mainImg} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <span className="text-xs text-[#52525b]">No Image</span>
                                        )}
                                        <div className="absolute top-3 right-3 bg-[#09090b]/90 border border-[#3f3f46]/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[#f59e0b] font-bold font-mono text-xs">
                                            {formatPrice(product.price)}
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow justify-between">
                                        <div>
                                            <h3 className="font-semibold text-sm text-[#fafafa] mb-1.5 line-clamp-1 group-hover:text-[#f59e0b] transition-colors">{product.title || 'Untitled'}</h3>
                                            <p className="text-xs text-[#71717a] line-clamp-2">{product.description || 'No description'}</p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-[#27272a] flex items-center justify-between">
                                            <span className="text-[10px] font-mono text-[#52525b]">{formatDate(product.createdAt)}</span>
                                            <span className="text-xs font-semibold text-[#f59e0b] group-hover:underline">Manage</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#09090b] border-b border-[#27272a] text-[11px] font-mono uppercase tracking-widest text-[#52525b]">
                                        <th className="py-4 px-5">Product</th>
                                        <th className="py-4 px-5">Price</th>
                                        <th className="py-4 px-5">ID</th>
                                        <th className="py-4 px-5 hidden md:table-cell">Created</th>
                                        <th className="py-4 px-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272a]">
                                    {filteredProducts.map(product => {
                                        const mainImg = product.images?.[0]?.url;
                                        const isCopied = copiedId === product._id;
                                        return (
                                            <tr key={product._id} className="hover:bg-[#27272a]/30 transition-colors cursor-pointer" onClick={() => navigate(`/seller/product/${product._id}`)}>
                                                <td className="py-3 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-[#09090b] border border-[#27272a] overflow-hidden shrink-0 flex items-center justify-center">
                                                            {mainImg ? <img src={mainImg} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] text-[#52525b]">N/A</span>}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-[#fafafa] line-clamp-1">{product.title || 'Untitled'}</div>
                                                            <div className="text-xs text-[#71717a] line-clamp-1 max-w-[200px]">{product.description || 'No desc'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-5">
                                                    <span className="font-mono text-sm font-bold text-[#f59e0b]">{formatPrice(product.price)}</span>
                                                </td>
                                                <td className="py-3 px-5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-[11px] text-[#71717a]">{product._id?.substring(0, 8)}…</span>
                                                        <button onClick={(e) => copyToClipboard(product._id, e)} className="text-[#52525b] hover:text-[#fafafa] transition-colors p-1" title="Copy ID">
                                                            {isCopied ? <CheckIcon /> : <CopyIcon />}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-5 hidden md:table-cell text-[11px] font-mono text-[#52525b]">{formatDate(product.createdAt)}</td>
                                                <td className="py-3 px-5 text-right">
                                                    <span className="text-xs font-semibold text-[#f59e0b] hover:underline">Manage</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
