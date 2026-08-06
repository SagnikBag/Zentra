import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { useCart } from '../hook/useCart';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRazorpay } from 'react-razorpay'

const Cart = () => {
    const cartItems = useSelector(state => state.cart.items);

    console.log("Redux cartItems:", cartItems);
    console.log("Rendering Cart Component");
    console.log(Array.isArray(cartItems));
    console.log(cartItems);

    const { handleGetCart, handleUpdateQuantity, handleRemoveItem, handleClearCart, handleIncrementCartItem, handleCreateCartOrder } = useCart();
    const { handleLogout } = useAuth();
    const navigate = useNavigate();
    const { error, isLoading, Razorpay } = useRazorpay();
    const userName = useSelector(state => state.user)


    const rawUser = useSelector(state => state.auth.user);
    const user = useMemo(() => {
        return rawUser?.user ? rawUser.user : rawUser;
    }, [rawUser]);

    const [loading, setLoading] = useState(true);
    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0); // percentage
    const [promoMessage, setPromoMessage] = useState(null);

    useEffect(() => {
        const fetchCart = async () => {
            setLoading(true);
            try {
                await handleGetCart();
            } catch (err) {
                console.error("Failed to load cart", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, []);

    // Calculate subtotal
    const subtotal = useMemo(() => {
        if (!Array.isArray(cartItems)) return 0;
        return cartItems.reduce((acc, item) => {
            const itemPrice = item?.price?.amount ?? item?.product?.price?.amount ?? 0;
            return acc + (itemPrice * (item.quantity || 1));
        }, 0);
    }, [cartItems]);

    // Free shipping threshold (e.g. ₹999)
    const FREE_SHIPPING_THRESHOLD = 999;
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 99;
    const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
    const estimatedTax = Math.round((subtotal - discountAmount) * 0.18); // 18% GST estimate
    const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + estimatedTax);

    const handleApplyPromo = (e) => {
        e.preventDefault();
        const code = promoCode.trim().toUpperCase();
        if (code === 'ZENTRA10') {
            setAppliedDiscount(10);
            setPromoMessage({ type: 'success', text: '10% Zentra Privilege Discount Applied!' });
        } else if (code === 'ZENTRA20') {
            setAppliedDiscount(20);
            setPromoMessage({ type: 'success', text: '20% VIP Member Discount Applied!' });
        } else if (code === '') {
            setPromoMessage(null);
        } else {
            setPromoMessage({ type: 'error', text: 'Invalid promo code. Try ZENTRA10' });
        }
    };

    const handleLogoutClick = async () => {
        await handleLogout();
        navigate('/login');
    };

    // Helper to format currency
    const formatCurrency = (amount, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Calculate total item count
    const totalItemsCount = useMemo(() => {
        if (!Array.isArray(cartItems)) return 0;
        return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    }, [cartItems]);

    async function handleCheckOut() {
        const order = await handleCreateCartOrder();
        console.log(order)


        const options = {
            key: "rzp_test_TMZw0uCj7goKD6",
            amount: 50000, // Amount in paise
            currency: "INR",
            name: "Zentra",
            description: "Test Transaction",
            order_id: order.id, // Generate order_id on server
            handler: (response) => {
                console.log(response);
                alert("Payment Successful!");
            },
            prefill: {
                name: userName?.firstName + ' ' + userName?.lastName,
                email: userName?.email,
                contact: userName?.contact
            },
            theme: {
                color: "#F37254",
            },


        }
        return (
            <div className="min-h-screen bg-[#0c1324] text-[#dce1fb] font-sans antialiased flex flex-col">
                {/* Header / Top Navigation */}
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
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#191f31] border border-[#2e3447] text-[#f59e0b]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="font-['JetBrains_Mono'] text-xs font-semibold">{totalItemsCount} {totalItemsCount === 1 ? 'ITEM' : 'ITEMS'}</span>
                            </div>

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

                {/* Main Content Area */}
                <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-12 py-8 md:py-12">
                    {/* Page Title & Header Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#2e3447]/60">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#a08e7a] uppercase mb-2">
                                <Link to="/" className="hover:text-[#f59e0b]">HOME</Link>
                                <span>/</span>
                                <span className="text-[#f59e0b]">CART</span>
                            </div>
                            <h1 className="font-['Hanken_Grotesk'] text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                                SHOPPING CART
                                <span className="text-sm font-['JetBrains_Mono'] font-normal text-[#a08e7a] bg-[#191f31] px-3 py-1 rounded-full border border-[#2e3447]">
                                    {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                                </span>
                            </h1>
                        </div>

                        {cartItems && cartItems.length > 0 && (
                            <button
                                onClick={handleClearCart}
                                className="self-start sm:self-auto text-xs font-['JetBrains_Mono'] text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 bg-[#131b2e] hover:bg-red-500/10 border border-[#2e3447] hover:border-red-500/30 px-3.5 py-2 rounded-lg cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                CLEAR CART
                            </button>
                        )}
                    </div>

                    {/* Free Shipping Meter */}
                    {cartItems && cartItems.length > 0 && (
                        <div className="mb-8 p-4 rounded-xl bg-[#191f31] border border-[#2e3447] flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs font-['JetBrains_Mono']">
                                <span className="text-[#dce1fb] font-medium flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                                        <span className="text-[#f59e0b] font-bold">CONGRATULATIONS! YOU UNLOCKED FREE EXPRESS SHIPPING</span>
                                    ) : (
                                        <>ADD <span className="text-[#f59e0b] font-bold">{formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)}</span> MORE FOR FREE SHIPPING</>
                                    )}
                                </span>
                                <span className="text-[#a08e7a] hidden sm:inline">THRESHOLD: {formatCurrency(FREE_SHIPPING_THRESHOLD)}</span>
                            </div>
                            <div className="w-full h-2 bg-[#0c1324] rounded-full overflow-hidden border border-[#2e3447]/60">
                                <div
                                    className="h-full bg-gradient-to-r from-[#f59e0b]/70 to-[#f59e0b] transition-all duration-500 rounded-full"
                                    style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Content Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-[#131b2e]/40 rounded-2xl border border-[#2e3447]/40">
                            <div className="w-12 h-12 border-4 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin mb-4"></div>
                            <p className="font-['JetBrains_Mono'] text-[#a08e7a] text-sm tracking-wider uppercase animate-pulse">Loading Your Luxury Selection...</p>
                        </div>
                    ) : !cartItems || cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 px-4 bg-[#131b2e]/40 rounded-2xl border border-[#2e3447]/60 text-center">
                            <div className="w-20 h-20 rounded-full bg-[#191f31] border border-[#2e3447] flex items-center justify-center text-[#f59e0b] mb-6 shadow-lg shadow-black/40">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-white mb-2">YOUR CART IS EMPTY</h2>
                            <p className="text-[#a08e7a] text-sm max-w-md mb-8">
                                Discover our curated collection of luxury items and elevate your lifestyle with Zentra's exclusive offerings.
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#ffb95f] text-[#472a00] font-['Hanken_Grotesk'] font-bold text-sm px-8 py-3.5 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-[#f59e0b]/20"
                            >
                                EXPLORE MARKETPLACE
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Left Column: Cart Items List */}
                            <div className="lg:col-span-8 space-y-4">
                                {cartItems.map((item) => {
                                    const product = item.productId || {};
                                    const itemPrice = item.price?.amount ?? product.price?.amount ?? 0;
                                    const currency = item.price?.currency || product.price?.currency || 'INR';

                                    // Find matching variant image if any
                                    const variantObj = Array.isArray(product.variants)
                                        ? product.variants.find(v => v._id === item.variantId)
                                        : null;

                                    const imageUrl =
                                        variantObj?.images?.[0]?.url ||
                                        product.images?.[0]?.url ||
                                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

                                    const itemSubtotal = itemPrice * (item.quantity || 1);

                                    return (
                                        <div
                                            key={item._id}
                                            className="group bg-[#191f31] border border-[#2e3447] hover:border-[#3e495d] rounded-xl p-4 md:p-5 transition-all duration-300 flex flex-col sm:flex-row gap-4 md:gap-6 items-center"
                                        >
                                            {/* Product Thumbnail */}
                                            <div className="relative w-full sm:w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-[#0c1324] border border-[#2e3447]">
                                                <img
                                                    src={imageUrl}
                                                    alt={product.title || 'Product Image'}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                {variantObj && (
                                                    <span className="absolute bottom-1 left-1 right-1 bg-black/80 backdrop-blur-xs text-[10px] font-['JetBrains_Mono'] text-[#f59e0b] px-1.5 py-0.5 rounded text-center truncate">
                                                        VARIANT
                                                    </span>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 w-full flex flex-col justify-between space-y-2">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div>
                                                        <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-white group-hover:text-[#f59e0b] transition-colors line-clamp-1">
                                                            {product.title || 'Untitled Product'}
                                                        </h3>
                                                        <p className="text-[#a08e7a] text-xs line-clamp-1 mt-0.5">
                                                            {product.description || 'No description available'}
                                                        </p>
                                                    </div>

                                                    {/* Trash Button */}
                                                    <button
                                                        onClick={() => handleRemoveItem(item._id)}
                                                        className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                                                        title="Remove item"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Attributes / Stock info */}
                                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-['JetBrains_Mono'] text-[#a08e7a]">
                                                    <span className="bg-[#0c1324] px-2 py-0.5 rounded border border-[#2e3447]">
                                                        ID: {product._id?.slice(-6)}
                                                    </span>
                                                    {variantObj?.stock !== undefined && (
                                                        <span className="bg-[#f59e0b]/10 text-[#f59e0b] px-2 py-0.5 rounded border border-[#f59e0b]/30">
                                                            {variantObj.stock} IN STOCK
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Quantity and Pricing Row */}
                                                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#2e3447]/40">
                                                    {/* Quantity Selector */}
                                                    <div className="flex items-center bg-[#0c1324] border border-[#2e3447] rounded-lg p-0.5">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item._id, (item.quantity || 1) - 1)}
                                                            disabled={(item.quantity || 1) <= 1}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#191f31] disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors cursor-pointer"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                                            </svg>
                                                        </button>
                                                        <span className="w-10 text-center font-['JetBrains_Mono'] text-sm font-semibold text-white">
                                                            {item.quantity || 1}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item._id, (item.quantity || 1) + 1)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#191f31] rounded-md transition-colors cursor-pointer"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {/* Price Display */}
                                                    <div className="text-right">
                                                        <div className="text-xs text-[#a08e7a] font-['JetBrains_Mono']">
                                                            {formatCurrency(itemPrice, currency)} each
                                                        </div>
                                                        <div className="font-['Hanken_Grotesk'] text-lg font-bold text-white">
                                                            {formatCurrency(itemSubtotal, currency)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Continue Shopping Link */}
                                <div className="pt-4">
                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#f59e0b] hover:underline uppercase tracking-wider"
                                    >
                                        <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                        CONTINUE SHOPPING
                                    </Link>
                                </div>
                            </div>

                            {/* Right Column: Order Summary (Sticky Card) */}
                            <div className="lg:col-span-4 sticky top-24">
                                <div className="bg-[#191f31] border border-[#2e3447] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                                    {/* Subtle Ambient Glow */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#f59e0b]/10 rounded-full blur-3xl pointer-events-none"></div>

                                    <h2 className="font-['Hanken_Grotesk'] text-xl font-bold text-white mb-6 tracking-tight flex items-center justify-between pb-4 border-b border-[#2e3447]/80">
                                        <span>ORDER SUMMARY</span>
                                        <span className="text-xs font-['JetBrains_Mono'] font-normal text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded border border-[#f59e0b]/30">
                                            ZENTRA PAY
                                        </span>
                                    </h2>

                                    {/* Promo Code Section */}
                                    <form onSubmit={handleApplyPromo} className="mb-6 space-y-2">
                                        <label className="block text-xs font-['JetBrains_Mono'] text-[#a08e7a] uppercase">
                                            PROMO CODE / PRIVILEGE PASS
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                                placeholder="e.g. ZENTRA10"
                                                className="flex-1 bg-[#0c1324] border border-[#2e3447] focus:border-[#f59e0b] text-white text-xs px-3.5 py-2.5 rounded-lg outline-none font-['JetBrains_Mono'] transition-colors uppercase placeholder:normal-case placeholder:text-gray-600"
                                            />
                                            <button
                                                type="submit"
                                                className="bg-[#131b2e] hover:bg-[#23293c] text-[#f59e0b] font-['JetBrains_Mono'] font-semibold text-xs px-4 py-2.5 rounded-lg border border-[#f59e0b]/30 hover:border-[#f59e0b] transition-all cursor-pointer"
                                            >
                                                APPLY
                                            </button>
                                        </div>

                                        {/* Quick Coupon Hint */}
                                        <div className="flex items-center gap-2 pt-1 text-[11px] font-['JetBrains_Mono'] text-gray-400">
                                            <span>Try code:</span>
                                            <button
                                                type="button"
                                                onClick={() => { setPromoCode('ZENTRA10'); setAppliedDiscount(10); setPromoMessage({ type: 'success', text: '10% Zentra Privilege Discount Applied!' }); }}
                                                className="text-[#f59e0b] hover:underline cursor-pointer bg-[#f59e0b]/10 px-1.5 py-0.5 rounded"
                                            >
                                                ZENTRA10 (10% OFF)
                                            </button>
                                        </div>

                                        {promoMessage && (
                                            <div className={`text-xs font-['JetBrains_Mono'] mt-2 p-2 rounded ${promoMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                                                {promoMessage.text}
                                            </div>
                                        )}
                                    </form>

                                    {/* Cost Breakdown */}
                                    <div className="space-y-3.5 text-sm font-['Inter'] mb-6 pb-6 border-b border-[#2e3447]/80">
                                        <div className="flex justify-between text-[#a08e7a]">
                                            <span>Subtotal ({totalItemsCount} items)</span>
                                            <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
                                        </div>

                                        {appliedDiscount > 0 && (
                                            <div className="flex justify-between text-emerald-400 font-medium">
                                                <span>Privilege Discount ({appliedDiscount}%)</span>
                                                <span>-{formatCurrency(discountAmount)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-[#a08e7a]">
                                            <span>Estimated Express Shipping</span>
                                            <span className="text-white font-medium">
                                                {shippingFee === 0 ? (
                                                    <span className="text-[#f59e0b] font-bold">FREE</span>
                                                ) : (
                                                    formatCurrency(shippingFee)
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-[#a08e7a]">
                                            <span>Estimated GST / Tax (18%)</span>
                                            <span className="text-white font-medium">{formatCurrency(estimatedTax)}</span>
                                        </div>
                                    </div>

                                    {/* Total Price Display */}
                                    <div className="flex justify-between items-baseline mb-8">
                                        <div>
                                            <span className="text-xs font-['JetBrains_Mono'] text-[#a08e7a] uppercase block">TOTAL AMOUNT</span>
                                            <span className="text-[10px] text-gray-500">Includes taxes & shipping</span>
                                        </div>
                                        <span className="font-['Hanken_Grotesk'] text-3xl font-extrabold text-[#f59e0b] tracking-tight">
                                            {formatCurrency(grandTotal)}
                                        </span>
                                    </div>

                                    {/* Primary Checkout CTA */}
                                    <button
                                        onClick={handleCheckOut}
                                        className="w-full bg-[#f59e0b] hover:bg-[#ffb95f] text-[#472a00] font-['Hanken_Grotesk'] font-bold text-base py-4 rounded-xl shadow-lg shadow-[#f59e0b]/20 hover:shadow-[#f59e0b]/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.99]"
                                    >
                                        <span>PROCEED TO CHECKOUT</span>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>

                                    {/* Trust & Security Badges */}
                                    <div className="mt-6 pt-6 border-t border-[#2e3447]/60 flex items-center justify-center gap-6 text-[11px] font-['JetBrains_Mono'] text-[#a08e7a]">
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            256-BIT ENCRYPTED
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            EASY RETURNS
                                        </div>
                                    </div>
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
                            <Link to="/" className="hover:text-[#f59e0b] transition-colors">PRIVACY POLICY</Link>
                            <Link to="/" className="hover:text-[#f59e0b] transition-colors">TERMS OF SERVICE</Link>
                            <Link to="/" className="hover:text-[#f59e0b] transition-colors">SUPPORT</Link>
                        </div>
                    </div>
                </footer>
            </div>
        );
    };
}
export default Cart;