import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { useCart } from '../hook/useCart';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRazorpay } from 'react-razorpay';
import { EmptyCartState } from '../../../components/ui/EmptyState';

/* ────────────────────────────────────────────────────────── */
/*  ALL business logic is IDENTICAL to the original Cart.jsx */
/*  Only the JSX presentation has changed.                   */
/* ────────────────────────────────────────────────────────── */

const Cart = () => {
    const cartItems = useSelector(state => state.cart.items);

    const { handleGetCart, handleUpdateQuantity, handleRemoveItem, handleClearCart, handleCreateCartOrder, handleVerifyCartOrder } = useCart();
    const { handleLogout } = useAuth();
    const navigate = useNavigate();
    const { error, isLoading, Razorpay } = useRazorpay();
    const userName = useSelector(state => state.user);

    const rawUser = useSelector(state => state.auth.user);
    const user = useMemo(() => {
        return rawUser?.user ? rawUser.user : rawUser;
    }, [rawUser]);

    const [loading, setLoading] = useState(true);
    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [promoMessage, setPromoMessage] = useState(null);

    useEffect(() => {
        const fetchCart = async () => {
            setLoading(true);
            try { await handleGetCart(); }
            catch (err) { console.error('Failed to load cart', err); }
            finally { setLoading(false); }
        };
        fetchCart();
    }, []);

    /* Calculations — unchanged */
    const subtotal = useMemo(() => {
        if (!Array.isArray(cartItems)) return 0;
        return cartItems.reduce((acc, item) => {
            const itemPrice = item?.price?.amount ?? item?.product?.price?.amount ?? 0;
            return acc + (itemPrice * (item.quantity || 1));
        }, 0);
    }, [cartItems]);

    const FREE_SHIPPING_THRESHOLD = 999;
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 99;
    const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
    const estimatedTax = Math.round((subtotal - discountAmount) * 0.18);
    const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + estimatedTax);

    const totalItemsCount = useMemo(() => {
        if (!Array.isArray(cartItems)) return 0;
        return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    }, [cartItems]);

    /* Promo handler — unchanged */
    const handleApplyPromo = (e) => {
        e.preventDefault();
        const code = promoCode.trim().toUpperCase();
        if (code === 'ZENTRA10') {
            setAppliedDiscount(10);
            setPromoMessage({ type: 'success', text: '10% Zentra discount applied!' });
        } else if (code === 'ZENTRA20') {
            setAppliedDiscount(20);
            setPromoMessage({ type: 'success', text: '20% VIP discount applied!' });
        } else if (code === '') {
            setPromoMessage(null);
        } else {
            setPromoMessage({ type: 'error', text: 'Invalid promo code. Try ZENTRA10' });
        }
    };

    /* Currency formatter — unchanged */
    const formatCurrency = (amount, currency = 'INR') =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0
        }).format(amount || 0);

    /* Checkout handler — unchanged */
    async function handleCheckOut() {
        const order = await handleCreateCartOrder();
        const options = {
            key: 'rzp_test_TMZw0uCj7goKD6',
            amount: order.amount,
            currency: order.currency,
            name: 'Zentra',
            description: 'Test Transaction',
            order_id: order?.id,
            handler: async (response) => {
                const isvalid = await handleVerifyCartOrder(response)

                if (isvalid) {
                    navigate(`/order-success?order_id=${response.razorpay_order_id}`)
                }
            },
            prefill: {
                name: userName?.firstName ? `${userName.firstName} ${userName.lastName || ''}` : '',
                email: userName?.email,
                contact: userName?.contact
            },
            theme: { color: '#F37254' },
        };
        if (Razorpay) {
            const rzp = new Razorpay(options);
            rzp.open();
        }
    }

    /* ── Render ──────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa]">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">

                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <div>
                        <nav className="flex items-center gap-2 text-xs text-[#52525b] mb-3">
                            <Link to="/" className="hover:text-[#a1a1aa] transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-[#a1a1aa]">Cart</span>
                        </nav>
                        <h1 className="text-3xl font-bold text-[#fafafa] tracking-tight flex items-center gap-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            Shopping Cart
                            {totalItemsCount > 0 && (
                                <span className="text-sm font-normal font-mono text-[#71717a] bg-[#27272a] border border-[#3f3f46] px-2.5 py-1 rounded-lg">
                                    {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                                </span>
                            )}
                        </h1>
                    </div>
                    {Array.isArray(cartItems) && cartItems.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            className="self-start sm:self-auto flex items-center gap-2 text-xs font-semibold text-[#71717a] hover:text-[#f87171] bg-[#18181b] hover:bg-[#f87171]/8 border border-[#27272a] hover:border-[#f87171]/30 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            Clear cart
                        </button>
                    )}
                </div>

                {/* Free shipping progress bar */}
                {Array.isArray(cartItems) && cartItems.length > 0 && (
                    <div className="mb-8 p-4 bg-[#18181b] border border-[#27272a] rounded-xl">
                        <div className="flex justify-between items-center text-xs font-mono mb-2.5">
                            <span className="text-[#a1a1aa]">
                                {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                                    <span className="text-[#10b981] font-semibold">🎉 You've unlocked free shipping!</span>
                                ) : (
                                    <>Add <span className="text-[#f59e0b] font-bold">{formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)}</span> more for free shipping</>
                                )}
                            </span>
                            <span className="text-[#52525b]">Min: {formatCurrency(FREE_SHIPPING_THRESHOLD)}</span>
                        </div>
                        <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#f59e0b] rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-[#18181b] border border-[#27272a] rounded-2xl">
                        <div className="w-10 h-10 border-2 border-[#3f3f46] border-t-[#f59e0b] rounded-full animate-spin mb-4" />
                        <p className="text-sm font-mono text-[#71717a]">Loading your cart…</p>
                    </div>
                ) : !Array.isArray(cartItems) || cartItems.length === 0 ? (
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl">
                        <EmptyCartState onShop={() => navigate('/')} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* ── Cart Items (left) ─────────────── */}
                        <div className="lg:col-span-8 space-y-3">
                            {cartItems.map((item) => {
                                const product = typeof item.product === 'object' && item.product !== null
                                    ? item.product
                                    : typeof item.productId === 'object' && item.productId !== null
                                        ? item.productId : {};

                                const variantIdStr = item.variants?._id || item.variants || item.variant?._id || item.variant || item.variantId;
                                const variantObj = Array.isArray(product.variants)
                                    ? product.variants.find(v => String(v._id) === String(variantIdStr))
                                    : null;

                                const itemPrice = item.price?.amount ?? variantObj?.price?.amount ?? product.price?.amount ?? 0;
                                const currency = item.price?.currency || variantObj?.price?.currency || product.price?.currency || 'INR';

                                const imageUrl = variantObj?.images?.[0]?.url || product.images?.[0]?.url ||
                                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

                                const itemSubtotal = itemPrice * (item.quantity || 1);

                                return (
                                    <div
                                        key={item._id}
                                        className="group bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] rounded-2xl p-4 md:p-5 transition-all duration-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                                    >
                                        {/* Image */}
                                        <div className="w-full sm:w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-[#09090b] border border-[#27272a]">
                                            <img
                                                src={imageUrl}
                                                alt={product.title || 'Product'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-sm text-[#fafafa] line-clamp-1 group-hover:text-[#f59e0b] transition-colors duration-200">
                                                        {product.title || 'Untitled Product'}
                                                    </h3>
                                                    {variantObj && (
                                                        <span className="inline-flex items-center text-[10px] font-mono text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2 py-0.5 rounded-md mt-1">
                                                            Variant
                                                        </span>
                                                    )}
                                                    <p className="text-xs text-[#71717a] line-clamp-1 mt-0.5">
                                                        {product.description || ''}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(item._id)}
                                                    className="shrink-0 p-1.5 rounded-lg text-[#52525b] hover:text-[#f87171] hover:bg-[#f87171]/8 transition-all duration-200 cursor-pointer"
                                                    title="Remove"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#27272a]">
                                                {/* Qty controls */}
                                                <div className="inline-flex items-center bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item._id, (item.quantity || 1) - 1)}
                                                        disabled={(item.quantity || 1) <= 1}
                                                        className="w-8 h-8 flex items-center justify-center text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] disabled:opacity-30 transition-all cursor-pointer"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                                        </svg>
                                                    </button>
                                                    <span className="w-9 text-center text-sm font-bold text-[#fafafa] font-mono">{item.quantity || 1}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item._id, (item.quantity || 1) + 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-all cursor-pointer"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <div className="text-[11px] text-[#52525b] font-mono">{formatCurrency(itemPrice, currency)} each</div>
                                                    <div className="text-base font-bold text-[#fafafa]">{formatCurrency(itemSubtotal, currency)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Continue shopping */}
                            <div className="pt-2">
                                <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#71717a] hover:text-[#a1a1aa] transition-colors duration-200">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                    </svg>
                                    Continue shopping
                                </Link>
                            </div>
                        </div>

                        {/* ── Order Summary (right) ─────────── */}
                        <div className="lg:col-span-4 lg:sticky lg:top-24">
                            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-[#fafafa] tracking-tight mb-6 flex items-center justify-between" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    Order Summary
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2 py-1 rounded-lg">
                                        Zentra Pay
                                    </span>
                                </h2>

                                {/* Promo code */}
                                <form onSubmit={handleApplyPromo} className="mb-6 space-y-2">
                                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#71717a]">
                                        Promo Code
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={e => setPromoCode(e.target.value)}
                                            placeholder="e.g. ZENTRA10"
                                            className="flex-1 bg-[#09090b] border border-[#27272a] focus:border-[#f59e0b]/50 text-[#fafafa] text-xs px-3 py-2.5 rounded-xl outline-none font-mono placeholder-[#52525b] uppercase transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] font-semibold text-xs rounded-xl border border-[#3f3f46] transition-all cursor-pointer"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    <p className="text-[11px] font-mono text-[#52525b]">
                                        Try: <button
                                            type="button"
                                            onClick={() => { setPromoCode('ZENTRA10'); setAppliedDiscount(10); setPromoMessage({ type: 'success', text: '10% discount applied!' }); }}
                                            className="text-[#f59e0b] hover:underline cursor-pointer"
                                        >ZENTRA10</button>
                                    </p>
                                    {promoMessage && (
                                        <div className={`text-xs font-mono p-2.5 rounded-xl border ${promoMessage.type === 'success'
                                            ? 'bg-[#10b981]/8 border-[#10b981]/20 text-[#10b981]'
                                            : 'bg-[#f87171]/8 border-[#f87171]/20 text-[#f87171]'
                                            }`}>
                                            {promoMessage.text}
                                        </div>
                                    )}
                                </form>

                                {/* Cost breakdown */}
                                <div className="space-y-3 text-sm mb-6 pb-6 border-b border-[#27272a]">
                                    <div className="flex justify-between">
                                        <span className="text-[#71717a]">Subtotal ({totalItemsCount} items)</span>
                                        <span className="font-medium text-[#fafafa]">{formatCurrency(subtotal)}</span>
                                    </div>
                                    {appliedDiscount > 0 && (
                                        <div className="flex justify-between text-[#10b981]">
                                            <span>Discount ({appliedDiscount}%)</span>
                                            <span>−{formatCurrency(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-[#71717a]">Shipping</span>
                                        <span className={shippingFee === 0 ? 'text-[#10b981] font-semibold' : 'text-[#fafafa] font-medium'}>
                                            {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#71717a]">GST (18%)</span>
                                        <span className="font-medium text-[#fafafa]">{formatCurrency(estimatedTax)}</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex items-end justify-between mb-6">
                                    <div>
                                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#71717a] block">Total</span>
                                        <span className="text-[10px] text-[#52525b]">Incl. taxes & shipping</span>
                                    </div>
                                    <span className="text-3xl font-bold text-[#f59e0b]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        {formatCurrency(grandTotal)}
                                    </span>
                                </div>

                                {/* Checkout button */}
                                <button
                                    onClick={handleCheckOut}
                                    className="w-full flex items-center justify-center gap-2.5 bg-[#f59e0b] text-[#09090b] font-bold text-sm py-4 rounded-xl hover:bg-[#d97706] transition-all duration-200 shadow-[0_8px_24px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.4)] active:scale-[0.98] cursor-pointer"
                                >
                                    Proceed to Checkout
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </button>

                                {/* Trust badges */}
                                <div className="mt-5 pt-5 border-t border-[#27272a] flex items-center justify-center gap-6 text-[10px] font-mono text-[#52525b]">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                        </svg>
                                        256-BIT SSL
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        EASY RETURNS
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;