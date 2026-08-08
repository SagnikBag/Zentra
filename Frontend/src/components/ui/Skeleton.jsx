import React from 'react';

/**
 * Skeleton loader component using the z-skeleton shimmer animation.
 * Usage: <Skeleton className="h-5 w-32 rounded-xl" />
 */
export function Skeleton({ className = '' }) {
    return (
        <div className={`z-skeleton rounded-lg ${className}`} aria-hidden="true" />
    );
}

/**
 * Product card skeleton — mirrors the real product card dimensions.
 */
export function ProductCardSkeleton() {
    return (
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden" aria-hidden="true">
            <Skeleton className="h-52 w-full rounded-none" />
            <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="pt-2 flex justify-between items-center">
                    <Skeleton className="h-7 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-24 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ cols = 5 }) {
    return (
        <tr className="border-b border-[#27272a]" aria-hidden="true">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

/**
 * Detail page skeleton
 */
export function DetailPageSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10" aria-hidden="true">
            <Skeleton className="h-[480px] rounded-2xl" />
            <div className="space-y-5">
                <Skeleton className="h-10 w-3/4 rounded-xl" />
                <Skeleton className="h-6 w-1/2 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <div className="flex gap-3">
                    <Skeleton className="h-12 flex-1 rounded-xl" />
                    <Skeleton className="h-12 flex-1 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
