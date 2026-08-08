import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { useAuth } from '../features/auth/hooks/useAuth';

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
    </svg>
);
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { handleLogout } = useAuth();

    const rawUser = useSelector(s => s.auth.user);
    const user = useMemo(() => (rawUser?.user ? rawUser.user : rawUser), [rawUser]);

    const cartItems = useSelector(s => s.cart.items);
    const cartCount = useMemo(() => {
        if (!Array.isArray(cartItems)) return 0;
        return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    }, [cartItems]);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Close mobile menu on route change
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    // Detect scroll for navbar shadow
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogoutClick = async () => {
        try { await handleLogout(); } catch (e) { console.error(e); }
        navigate('/login');
    };

    const isSeller = user?.role === 'seller';
    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) =>
        `text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${isActive(path) ? 'text-[#f59e0b]' : 'text-[#a1a1aa] hover:text-[#fafafa]'}`;

    return (
        <>
            {/* Main Navbar */}
            <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled
                ? 'bg-[#09090b]/95 backdrop-blur-xl border-b border-[#3f3f46]/80 shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
                : 'bg-[#09090b]/80 backdrop-blur-md border-b border-[#3f3f46]/40'
                }`}>
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
                    <div className="flex items-center justify-between h-16">

                        {/* Left: Logo */}
                        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                            <div className="w-7 h-7 rounded-lg bg-[#f59e0b] flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all duration-300">
                                <span className="text-[#09090b] font-bold text-xs leading-none">Z</span>
                            </div>
                            <span className="font-bold text-lg tracking-tight text-[#fafafa] group-hover:text-[#f59e0b] transition-colors duration-200" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                Zentra
                            </span>
                        </Link>

                        {/* Center: Nav Links (desktop) */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/" className={navLinkClass('/')}>Marketplace</Link>
                            {isSeller && (
                                <>
                                    <Link to="/seller/dashboard" className={navLinkClass('/seller/dashboard')}>Dashboard</Link>
                                    <Link to="/seller/create-product" className={navLinkClass('/seller/create-product')}>Add Product</Link>
                                </>
                            )}
                        </nav>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">
                            {/* Cart */}
                            <Link
                                to="/cart"
                                className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#18181b] border border-[#3f3f46] text-[#a1a1aa] hover:text-[#f59e0b] hover:border-[#f59e0b]/40 transition-all duration-200"
                                aria-label="Cart"
                            >
                                <CartIcon />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#f59e0b] text-[#09090b] text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Desktop user section */}
                            {user ? (
                                <div className="hidden sm:flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#18181b] border border-[#3f3f46]">
                                        <div className="w-6 h-6 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
                                            <UserIcon />
                                        </div>
                                        <div className="flex flex-col leading-none">
                                            <span className="text-xs font-semibold text-[#fafafa]">
                                                {user.fullname?.split(' ')[0] || 'User'}
                                            </span>
                                            <span className="text-[10px] text-[#f59e0b] uppercase tracking-wider font-mono mt-0.5">
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogoutClick}
                                        className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] hover:text-[#fafafa] bg-[#18181b] border border-[#3f3f46] hover:border-[#52525b] rounded-xl transition-all duration-200 cursor-pointer"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] hover:text-[#fafafa] transition-colors duration-200"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#f59e0b] text-[#09090b] rounded-xl hover:bg-[#d97706] transition-all duration-200 shadow-[0_4px_12px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)]"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMobileOpen(o => !o)}
                                className="flex md:hidden items-center justify-center w-9 h-9 rounded-xl bg-[#18181b] border border-[#3f3f46] text-[#a1a1aa] hover:text-[#fafafa] transition-all duration-200 cursor-pointer"
                                aria-label="Toggle menu"
                            >
                                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMobileOpen(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                </div>
            )}

            {/* Mobile Drawer */}
            <div className={`fixed top-16 right-0 bottom-0 z-30 w-72 bg-[#18181b] border-l border-[#3f3f46] md:hidden transform transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full p-6 gap-6">
                    {/* User info */}
                    {user && (
                        <div className="flex items-center gap-3 pb-6 border-b border-[#3f3f46]">
                            <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-[#fafafa]">{user.fullname || 'User'}</div>
                                <div className="text-[11px] font-mono text-[#f59e0b] uppercase tracking-wider">{user.role}</div>
                            </div>
                        </div>
                    )}

                    {/* Nav links */}
                    <nav className="flex flex-col gap-1">
                        <Link to="/" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-all duration-200">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            Marketplace
                        </Link>
                        <Link to="/cart" className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-all duration-200">
                            <span className="flex items-center gap-3">
                                <CartIcon />
                                Cart
                            </span>
                            {cartCount > 0 && (
                                <span className="min-w-[20px] h-5 px-1.5 bg-[#f59e0b] text-[#09090b] text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        {isSeller && (
                            <>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a] px-3 pt-3 pb-1">Seller</div>
                                <Link to="/seller/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-all duration-200">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                                    </svg>
                                    Dashboard
                                </Link>
                                <Link to="/seller/create-product" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-all duration-200">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Add Product
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Bottom: Auth actions */}
                    <div className="mt-auto flex flex-col gap-3">
                        {user ? (
                            <button
                                onClick={handleLogoutClick}
                                className="w-full py-3 text-sm font-semibold text-[#a1a1aa] hover:text-[#fafafa] bg-[#27272a] border border-[#3f3f46] rounded-xl transition-all duration-200 cursor-pointer"
                            >
                                Sign out
                            </button>
                        ) : (
                            <>
                                <Link to="/login" className="w-full py-3 text-sm font-semibold text-center text-[#a1a1aa] bg-[#27272a] border border-[#3f3f46] rounded-xl hover:text-[#fafafa] transition-all duration-200">
                                    Sign In
                                </Link>
                                <Link to="/register" className="w-full py-3 text-sm font-bold text-center bg-[#f59e0b] text-[#09090b] rounded-xl hover:bg-[#d97706] transition-all duration-200 shadow-[0_4px_12px_rgba(245,158,11,0.25)]">
                                    Create Account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
