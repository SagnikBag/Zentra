import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';

export default function Footer() {
    const rawUser = useSelector(s => s.auth.user);
    const user = useMemo(() => (rawUser?.user ? rawUser.user : rawUser), [rawUser]);
    const isSeller = user?.role === 'seller';
    const year = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-[#27272a] bg-[#09090b] mt-auto">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center gap-2.5 mb-4 group w-fit">
                            <div className="w-7 h-7 rounded-lg bg-[#f59e0b] flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all duration-300">
                                <span className="text-[#09090b] font-bold text-xs leading-none">Z</span>
                            </div>
                            <span className="font-bold text-lg tracking-tight text-[#fafafa] group-hover:text-[#f59e0b] transition-colors duration-200">
                                Zentra
                            </span>
                        </Link>
                        <p className="text-[#71717a] text-sm leading-relaxed max-w-xs">
                            Premium marketplace for curated products. Shop with confidence and style.
                        </p>
                        <div className="flex items-center gap-1.5 mt-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                            <span className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">Systems Online</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-xs font-mono uppercase tracking-widest text-[#71717a] mb-4">Navigation</h4>
                        <ul className="flex flex-col gap-2.5">
                            <li>
                                <Link to="/" className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors duration-200">
                                    Marketplace
                                </Link>
                            </li>
                            <li>
                                <Link to="/cart" className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors duration-200">
                                    Shopping Cart
                                </Link>
                            </li>
                            {isSeller && (
                                <>
                                    <li>
                                        <Link to="/seller/dashboard" className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors duration-200">
                                            Seller Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/seller/create-product" className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors duration-200">
                                            Add Product
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h4 className="text-xs font-mono uppercase tracking-widest text-[#71717a] mb-4">Account</h4>
                        <ul className="flex flex-col gap-2.5">
                            {!user ? (
                                <>
                                    <li>
                                        <Link to="/login" className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors duration-200">
                                            Sign In
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/register" className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors duration-200">
                                            Create Account
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <li className="text-sm text-[#a1a1aa]">
                                    Signed in as <span className="text-[#fafafa] font-medium">{user.fullname?.split(' ')[0] || 'User'}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Bottom row */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-[#27272a]">
                    <p className="text-xs text-[#52525b]">
                        © {year} Zentra. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors duration-200">Privacy</a>
                        <a href="#" className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors duration-200">Terms</a>
                        <a href="#" className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors duration-200">Support</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
