import React from 'react';

/**
 * EmptyState — shown when a list has no items.
 *
 * Props:
 *   icon       — SVG element (optional)
 *   title      — Main heading string
 *   message    — Supporting text string
 *   action     — { label: string, onClick: fn } (optional)
 */
export function EmptyState({ icon, title = 'Nothing here', message, action }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 z-animate-fade-in">
            {icon && (
                <div className="w-16 h-16 rounded-2xl bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#52525b] mb-5">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-[#fafafa] mb-2">{title}</h3>
            {message && (
                <p className="text-sm text-[#71717a] max-w-sm leading-relaxed mb-6">{message}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-5 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] border border-[#3f3f46] text-[#fafafa] text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}

/**
 * Cart-specific empty state
 */
export function EmptyCartState({ onShop }) {
    return (
        <EmptyState
            icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                </svg>
            }
            title="Your cart is empty"
            message="Your cart is waiting for something beautiful. Browse the marketplace and add items you love."
            action={{ label: 'Explore Marketplace', onClick: onShop }}
        />
    );
}

/**
 * Products-specific empty state
 */
export function EmptyProductsState({ onClear, hasSearch }) {
    return (
        <EmptyState
            icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            }
            title={hasSearch ? 'No products found' : 'No products listed'}
            message={
                hasSearch
                    ? 'No items matched your search. Try a different keyword or clear the filter.'
                    : 'There are no products listed on Zentra yet. Check back soon.'
            }
            action={hasSearch ? { label: 'Clear Search', onClick: onClear } : undefined}
        />
    );
}
