import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { userProduct } from '../hooks/useProduct';

export default function Dashboard() {
    const { handleGetSellerProduct } = userProduct();
    const rawSellerProducts = useSelector(state => state.product.sellerProducts);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [copiedId, setCopiedId] = useState(null);

    const navigate = useNavigate();

    // Safely parse seller products array from Redux state
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

    // Calculated Portfolio Metrics
    const metrics = useMemo(() => {
        const totalProducts = products.length;
        const totalImages = products.reduce((acc, p) => acc + (p.images?.length || 0), 0);

        // Group total value by currency
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

        return {
            totalProducts,
            totalImages,
            formattedTotalValue,
        };
    }, [products]);

    // Filter & Sort products
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
            if (sortBy === 'newest') {
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
            if (sortBy === 'oldest') {
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            }
            if (sortBy === 'price-high') {
                return parseFloat(b.price?.amount || 0) - parseFloat(a.price?.amount || 0);
            }
            if (sortBy === 'price-low') {
                return parseFloat(a.price?.amount || 0) - parseFloat(b.price?.amount || 0);
            }
            if (sortBy === 'title') {
                return (a.title || '').localeCompare(b.title || '');
            }
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
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const copyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0c1324] text-[#dce1fb] font-sans antialiased flex flex-col">
            {/* Header / Top Nav */}
            <header className="w-full bg-[#0c1324] border-b border-[#2e3447]/50 sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
                <div className="flex justify-between items-center w-full px-4 md:px-12 py-4 max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#f59e0b] tracking-tighter hover:opacity-90 transition-opacity">
                            ZENTRA
                        </Link>
                        <nav className="hidden md:flex gap-6 items-center">
                            <Link
                                to="/seller/dashboard"
                                className="text-[#f59e0b] font-bold font-['JetBrains_Mono'] text-xs tracking-[0.05em] uppercase flex items-center gap-1.5"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                                DASHBOARD
                            </Link>
                            <Link
                                to="/seller/create-product"
                                className="text-[#a08e7a] hover:text-[#f59e0b] transition-colors duration-300 font-['JetBrains_Mono'] text-xs font-medium tracking-[0.05em] uppercase"
                            >
                                ADD PRODUCT
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchProducts(true)}
                            disabled={refreshing}
                            className="p-2 rounded-lg bg-[#131b2e] border border-[#2e3447]/60 text-[#a08e7a] hover:text-white hover:border-[#f59e0b]/40 transition-all cursor-pointer"
                            title="Refresh Data"
                        >
                            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#f59e0b]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <Link
                            to="/seller/create-product"
                            className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#0c1324] font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-[#f59e0b]/10"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Create Product
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 md:px-12 py-8 relative">
                {/* Ambient glow */}
                <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[#f59e0b]/5 rounded-full blur-[140px] pointer-events-none"></div>

                {/* Page Title & Status */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[#f59e0b] text-[10px] font-mono uppercase tracking-widest bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2.5 py-0.5 rounded-full">
                                Seller Portal
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Live Syncing
                            </span>
                        </div>
                        <h1 className="font-['Hanken_Grotesk'] text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">
                            Seller Dashboard
                        </h1>
                        <p className="text-[#a08e7a] text-sm mt-1">
                            Manage, analyze, and monitor your listed products portfolio.
                        </p>
                    </div>
                </div>

                {/* Performance Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                    {/* Card 1: Total Listed Products */}
                    <div className="bg-[#131b2e] border border-[#2e3447]/60 rounded-xl p-5 relative overflow-hidden group hover:border-[#f59e0b]/30 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#f59e0b]/5 rounded-bl-full group-hover:bg-[#f59e0b]/10 transition-colors pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[#a08e7a] text-xs font-mono uppercase tracking-wider">Total Products</span>
                            <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white tracking-tight">
                            {loading ? (
                                <div className="h-8 w-20 bg-[#2e3447]/50 rounded animate-pulse"></div>
                            ) : (
                                metrics.totalProducts
                            )}
                        </div>
                        <div className="text-xs text-[#a08e7a] mt-2 flex items-center gap-1.5">
                            <span className="text-emerald-400 font-medium">Active listings</span> in inventory
                        </div>
                    </div>

                    {/* Card 2: Total Portfolio Value */}
                    <div className="bg-[#131b2e] border border-[#2e3447]/60 rounded-xl p-5 relative overflow-hidden group hover:border-[#f59e0b]/30 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#f59e0b]/5 rounded-bl-full group-hover:bg-[#f59e0b]/10 transition-colors pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[#a08e7a] text-xs font-mono uppercase tracking-wider">Portfolio Value</span>
                            <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white tracking-tight">
                            {loading ? (
                                <div className="h-8 w-28 bg-[#2e3447]/50 rounded animate-pulse"></div>
                            ) : (
                                metrics.formattedTotalValue
                            )}
                        </div>
                        <div className="text-xs text-[#a08e7a] mt-2 flex items-center gap-1.5">
                            Combined valuation across items
                        </div>
                    </div>

                    {/* Card 3: Media Assets */}
                    <div className="bg-[#131b2e] border border-[#2e3447]/60 rounded-xl p-5 relative overflow-hidden group hover:border-[#f59e0b]/30 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#f59e0b]/5 rounded-bl-full group-hover:bg-[#f59e0b]/10 transition-colors pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[#a08e7a] text-xs font-mono uppercase tracking-wider">Media Assets</span>
                            <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white tracking-tight">
                            {loading ? (
                                <div className="h-8 w-16 bg-[#2e3447]/50 rounded animate-pulse"></div>
                            ) : (
                                metrics.totalImages
                            )}
                        </div>
                        <div className="text-xs text-[#a08e7a] mt-2 flex items-center gap-1.5">
                            High-res images hosted on CDN
                        </div>
                    </div>
                </div>

                {/* Filter & Control Bar */}
                <div className="bg-[#131b2e] border border-[#2e3447]/60 rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-grow max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a08e7a]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, description, or ID..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[#0c1324] border border-[#2e3447] rounded-lg text-sm text-white placeholder-[#a08e7a]/60 focus:outline-none focus:border-[#f59e0b]/60 transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a08e7a] hover:text-white"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Sorting & View Layout Controls */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-[#0c1324] border border-[#2e3447] rounded-lg px-3 py-1.5">
                            <span className="text-xs text-[#a08e7a] uppercase font-mono">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-2"
                            >
                                <option value="newest" className="bg-[#131b2e] text-white">Newest First</option>
                                <option value="oldest" className="bg-[#131b2e] text-white">Oldest First</option>
                                <option value="price-high" className="bg-[#131b2e] text-white">Price: High to Low</option>
                                <option value="price-low" className="bg-[#131b2e] text-white">Price: Low to High</option>
                                <option value="title" className="bg-[#131b2e] text-white">Title (A-Z)</option>
                            </select>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-[#0c1324] border border-[#2e3447] rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'text-[#a08e7a] hover:text-white'} transition-colors cursor-pointer`}
                                title="Grid View"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'text-[#a08e7a] hover:text-white'} transition-colors cursor-pointer`}
                                title="List/Table View"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Section Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-mono text-[#a08e7a]">
                        Showing <span className="text-white font-bold">{filteredProducts.length}</span> of{' '}
                        <span className="text-white">{products.length}</span> products
                    </div>
                </div>

                {/* Loading Skeleton */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-[#131b2e] border border-[#2e3447]/60 rounded-xl overflow-hidden animate-pulse">
                                <div className="h-48 bg-[#1e293b]"></div>
                                <div className="p-5 space-y-3">
                                    <div className="h-5 bg-[#2e3447] rounded w-3/4"></div>
                                    <div className="h-4 bg-[#2e3447]/60 rounded w-full"></div>
                                    <div className="h-4 bg-[#2e3447]/60 rounded w-1/2"></div>
                                    <div className="pt-4 flex justify-between">
                                        <div className="h-6 bg-[#f59e0b]/20 rounded w-20"></div>
                                        <div className="h-6 bg-[#2e3447] rounded w-16"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    /* Empty State */
                    <div className="bg-[#131b2e] border border-[#2e3447]/60 rounded-2xl p-12 text-center my-8 max-w-xl mx-auto">
                        <div className="w-16 h-16 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {searchQuery ? 'No matching products found' : 'No Products Listed Yet'}
                        </h3>
                        <p className="text-[#a08e7a] text-sm mb-6 max-w-md mx-auto">
                            {searchQuery
                                ? `No items matched "${searchQuery}". Try clearing your search query or sorting settings.`
                                : 'Start building your portfolio by publishing your first product listing on Zentra.'}
                        </p>
                        {searchQuery ? (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-4 py-2 bg-[#2e3447] hover:bg-[#3b435b] text-white text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                                Clear Search Filter
                            </button>
                        ) : (
                            <Link
                                to="/seller/create-product"
                                className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#0c1324] font-semibold text-xs uppercase tracking-wider px-5 py-3 rounded-lg transition-all shadow-lg shadow-[#f59e0b]/10"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Your First Product
                            </Link>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    /* GRID VIEW */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => {
                            const mainImage = product.images && product.images.length > 0 ? product.images[0]?.url : null;
                            const isCopied = copiedId === product._id;

                            return (
                                <div
                                    key={product._id}
                                    className="bg-[#131b2e] border border-[#2e3447]/60 hover:border-[#f59e0b]/50 rounded-xl overflow-hidden transition-all duration-300 flex flex-col group shadow-lg shadow-black/20"
                                >
                                    {/* Product Image Container */}
                                    <div className="relative h-52 bg-[#080e1a] overflow-hidden flex items-center justify-center">
                                        {mainImage ? (
                                            <img
                                                src={mainImage}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-[#a08e7a]">
                                                <svg className="w-10 h-10 mb-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-xs">No Image Available</span>
                                            </div>
                                        )}

                                        {/* Price Tag Badge */}
                                        <div className="absolute top-3 right-3 bg-[#0c1324]/90 border border-[#f59e0b]/40 backdrop-blur-md px-3 py-1 rounded-full text-[#f59e0b] font-bold font-mono text-xs shadow-md">
                                            {formatPrice(product.price)}
                                        </div>

                                        {/* Media Count Badge */}
                                        {product.images?.length > 0 && (
                                            <div className="absolute bottom-3 left-3 bg-[#0c1324]/80 backdrop-blur-sm border border-[#2e3447] text-[#a08e7a] px-2.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1">
                                                <svg className="w-3 h-3 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {product.images.length} {product.images.length === 1 ? 'Image' : 'Images'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Body */}
                                    <div className="p-5 flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="font-semibold text-lg text-white group-hover:text-[#f59e0b] transition-colors line-clamp-1">
                                                    {product.title || 'Untitled Product'}
                                                </h3>
                                            </div>

                                            <p className="text-[#a08e7a] text-xs leading-relaxed line-clamp-2 mb-4">
                                                {product.description || 'No description provided for this listing.'}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-[#2e3447]/60 flex items-center justify-between gap-2">
                                            <div className="text-[11px] font-mono text-[#a08e7a]">
                                                Listed {formatDate(product.createdAt)}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => copyToClipboard(product._id)}
                                                    className="p-1.5 rounded-lg bg-[#0c1324] border border-[#2e3447] text-[#a08e7a] hover:text-white hover:border-[#f59e0b]/30 transition-colors cursor-pointer"
                                                    title="Copy ID"
                                                >
                                                    {isCopied ? (
                                                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setSelectedImageIndex(0);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#f59e0b] text-xs font-semibold tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                                                >
                                                    <span>View</span>
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* TABLE VIEW */
                    <div className="bg-[#131b2e] border border-[#2e3447]/60 rounded-xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#0c1324] border-b border-[#2e3447]/60 text-[11px] font-mono uppercase tracking-wider text-[#a08e7a]">
                                        <th className="py-3.5 px-4">Item</th>
                                        <th className="py-3.5 px-4">Price</th>
                                        <th className="py-3.5 px-4">Product ID</th>
                                        <th className="py-3.5 px-4">Created Date</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2e3447]/40 text-xs">
                                    {filteredProducts.map((product) => {
                                        const mainImage = product.images && product.images.length > 0 ? product.images[0]?.url : null;
                                        const isCopied = copiedId === product._id;

                                        return (
                                            <tr key={product._id} className="hover:bg-[#0c1324]/50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-[#0c1324] border border-[#2e3447] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {mainImage ? (
                                                                <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <svg className="w-5 h-5 text-[#a08e7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-white text-sm line-clamp-1">{product.title || 'Untitled'}</div>
                                                            <div className="text-[#a08e7a] text-[11px] line-clamp-1 max-w-xs">{product.description || 'No description'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-mono font-bold text-[#f59e0b]">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#a08e7a]">
                                                        <span>{product._id?.substring(0, 10)}...</span>
                                                        <button
                                                            onClick={() => copyToClipboard(product._id)}
                                                            className="text-[#a08e7a] hover:text-white transition-colors cursor-pointer"
                                                            title="Copy ID"
                                                        >
                                                            {isCopied ? (
                                                                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-[#a08e7a] font-mono text-[11px]">
                                                    {formatDate(product.createdAt)}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setSelectedImageIndex(0);
                                                        }}
                                                        className="px-3 py-1 rounded bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#f59e0b] text-xs font-medium cursor-pointer transition-colors"
                                                    >
                                                        Details
                                                    </button>
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

            {/* PRODUCT DETAIL MODAL */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div
                        className="bg-[#131b2e] border border-[#2e3447] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[#2e3447] flex items-center justify-between sticky top-0 bg-[#131b2e] z-10">
                            <div>
                                <span className="text-[10px] font-mono uppercase text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2 py-0.5 rounded">
                                    Product Details
                                </span>
                                <h2 className="text-xl font-bold text-white mt-1 leading-tight">
                                    {selectedProduct.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="w-8 h-8 rounded-lg bg-[#0c1324] border border-[#2e3447] text-[#a08e7a] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Main Image Gallery */}
                            {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="h-72 w-full bg-[#080e1a] rounded-xl overflow-hidden border border-[#2e3447] flex items-center justify-center relative">
                                        <img
                                            src={selectedProduct.images[selectedImageIndex]?.url}
                                            alt={selectedProduct.title}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    {/* Thumbnails */}
                                    {selectedProduct.images.length > 1 && (
                                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                            {selectedProduct.images.map((img, idx) => (
                                                <button
                                                    key={img._id || idx}
                                                    onClick={() => setSelectedImageIndex(idx)}
                                                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${selectedImageIndex === idx
                                                            ? 'border-[#f59e0b] opacity-100 scale-105'
                                                            : 'border-[#2e3447] opacity-60 hover:opacity-100'
                                                        }`}
                                                >
                                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-40 bg-[#080e1a] rounded-xl border border-[#2e3447] flex items-center justify-center text-[#a08e7a] text-sm">
                                    No images associated with this product
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-[#0c1324] border border-[#2e3447] p-4 rounded-xl">
                                    <div className="text-xs text-[#a08e7a] uppercase font-mono mb-1">Listing Price</div>
                                    <div className="text-2xl font-bold text-[#f59e0b] font-mono">
                                        {formatPrice(selectedProduct.price)}
                                    </div>
                                </div>
                                <div className="bg-[#0c1324] border border-[#2e3447] p-4 rounded-xl">
                                    <div className="text-xs text-[#a08e7a] uppercase font-mono mb-1">Created At</div>
                                    <div className="text-sm font-semibold text-white">
                                        {formatDate(selectedProduct.createdAt)}
                                    </div>
                                    <div className="text-[10px] text-[#a08e7a] font-mono mt-0.5">
                                        {selectedProduct.createdAt}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="text-xs uppercase font-mono text-[#a08e7a] mb-2">Description</h4>
                                <div className="bg-[#0c1324] border border-[#2e3447] p-4 rounded-xl text-sm text-[#dce1fb] whitespace-pre-wrap leading-relaxed">
                                    {selectedProduct.description || 'No description available for this item.'}
                                </div>
                            </div>

                            {/* Identifiers */}
                            <div className="bg-[#0c1324] border border-[#2e3447] p-4 rounded-xl space-y-2 text-xs font-mono">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#a08e7a]">Product ID:</span>
                                    <span className="text-white bg-[#131b2e] px-2 py-0.5 rounded border border-[#2e3447] select-all">
                                        {selectedProduct._id}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#a08e7a]">Seller ID:</span>
                                    <span className="text-white bg-[#131b2e] px-2 py-0.5 rounded border border-[#2e3447] select-all">
                                        {selectedProduct.seller}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[#2e3447] bg-[#0c1324] flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="px-4 py-2 rounded-lg bg-[#2e3447] hover:bg-[#3b435b] text-white text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
