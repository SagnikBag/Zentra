import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useParams, Link } from 'react-router';

/* ─── helpers ────────────────────────────────────────────────────── */
const formatPrice = (price) => {
    if (!price) return '—';
    const amount = parseFloat(price.amount || 0);
    const currency = price.currency || 'INR';
    try {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
};

const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: '#f87171', bg: 'rgba(248,113,113,0.12)', dot: '#f87171' };
    if (stock < 10) return { label: 'Low Stock', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', dot: '#fbbf24' };
    return { label: 'In Stock', color: '#34d399', bg: 'rgba(52,211,153,0.12)', dot: '#34d399' };
};

const getAttrsDisplay = (attridutes) => {
    if (!attridutes) return [];
    if (attridutes instanceof Map) return Array.from(attridutes.entries());
    if (typeof attridutes === 'object') return Object.entries(attridutes);
    return [];
};

/* ─── icons ──────────────────────────────────────────────────────── */
const IconPlus = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const IconMinus = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
);
const IconTrash = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
);
const IconCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IconClose = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const IconArrowLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
);
const IconPackage = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 7m8 4v10" />
    </svg>
);
const IconUpload = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const IconImage = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

/* ─── styles ──────────────────────────────────────────────────────── */
const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

    .spd-root {
        min-height: 100vh;
        background: #0c1324;
        color: #dce1fb;
        font-family: 'Inter', sans-serif;
    }
    .spd-topbar {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(12, 19, 36, 0.85);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid #2e3447;
        padding: 0 48px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .spd-logo {
        font-family: 'Hanken Grotesk', sans-serif;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #dce1fb;
        text-decoration: none;
    }
    .spd-logo span { color: #f59e0b; }
    .spd-nav-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid #2e3447;
        background: transparent;
        color: #a08e7a;
        font-size: 13px;
        font-family: 'JetBrains Mono', monospace;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
    }
    .spd-nav-btn:hover { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,0.06); }
    .spd-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 48px 48px 80px;
    }
    /* Hero */
    .spd-hero {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        margin-bottom: 64px;
    }
    @media (max-width: 900px) {
        .spd-hero { grid-template-columns: 1fr; }
        .spd-container { padding: 24px 16px 64px; }
        .spd-topbar { padding: 0 16px; }
    }
    .spd-gallery {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .spd-gallery-main {
        aspect-ratio: 4/3;
        background: #131b2e;
        border-radius: 10px;
        border: 1px solid #2e3447;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .spd-gallery-main img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .spd-gallery-thumbs {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    .spd-thumb {
        width: 64px;
        height: 64px;
        border-radius: 6px;
        border: 1px solid #2e3447;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.2s;
        flex-shrink: 0;
    }
    .spd-thumb:hover, .spd-thumb.active { border-color: #f59e0b; }
    .spd-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .spd-product-info {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-top: 8px;
    }
    .spd-badge-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .spd-badge {
        padding: 4px 10px;
        border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }
    .spd-badge-amber { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.25); }
    .spd-badge-slate { background: rgba(46,52,71,0.6); color: #a08e7a; border: 1px solid #2e3447; }
    .spd-title {
        font-family: 'Hanken Grotesk', sans-serif;
        font-size: 36px;
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.02em;
        color: #dce1fb;
        margin: 0;
    }
    .spd-desc {
        font-size: 15px;
        line-height: 1.7;
        color: #a08e7a;
        margin: 0;
    }
    .spd-price-row {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .spd-price-main {
        font-family: 'Hanken Grotesk', sans-serif;
        font-size: 28px;
        font-weight: 600;
        color: #f59e0b;
        letter-spacing: -0.01em;
    }
    .spd-stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
    }
    .spd-stat {
        background: #131b2e;
        border: 1px solid #2e3447;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .spd-stat-label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: #a08e7a;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .spd-stat-value {
        font-family: 'Hanken Grotesk', sans-serif;
        font-size: 20px;
        font-weight: 600;
        color: #dce1fb;
    }
    /* Divider */
    .spd-divider {
        height: 1px;
        background: linear-gradient(to right, #2e3447, transparent);
        margin: 0 0 48px;
    }
    /* Variants section */
    .spd-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 32px;
        flex-wrap: wrap;
        gap: 16px;
    }
    .spd-section-title {
        font-family: 'Hanken Grotesk', sans-serif;
        font-size: 22px;
        font-weight: 600;
        color: #dce1fb;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .spd-section-title span {
        font-size: 14px;
        font-family: 'JetBrains Mono', monospace;
        color: #a08e7a;
        font-weight: 400;
    }
    .spd-btn-primary {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: #f59e0b;
        color: #0c1324;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        font-family: 'Inter', sans-serif;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
        white-space: nowrap;
    }
    .spd-btn-primary:hover { background: #d97706; }
    .spd-btn-primary:active { transform: scale(0.98); }
    .spd-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .spd-btn-ghost {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: transparent;
        color: #a08e7a;
        border: 1px solid #2e3447;
        border-radius: 6px;
        font-size: 13px;
        font-family: 'Inter', sans-serif;
        cursor: pointer;
        transition: all 0.2s;
    }
    .spd-btn-ghost:hover { border-color: #534434; color: #dce1fb; }
    /* Variant card */
    .spd-variants-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
    }
    .spd-variant-card {
        background: #131b2e;
        border: 1px solid #2e3447;
        border-radius: 12px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        transition: border-color 0.25s, box-shadow 0.25s;
        position: relative;
    }
    .spd-variant-card:hover { border-color: rgba(245,158,11,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
    .spd-variant-top {
        display: flex;
        align-items: flex-start;
        gap: 14px;
    }
    .spd-variant-img {
        width: 64px;
        height: 64px;
        border-radius: 8px;
        border: 1px solid #2e3447;
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0c1324;
        color: #2e3447;
    }
    .spd-variant-img img { width: 100%; height: 100%; object-fit: cover; }
    .spd-variant-info { flex: 1; min-width: 0; }
    .spd-variant-price {
        font-family: 'Hanken Grotesk', sans-serif;
        font-size: 20px;
        font-weight: 600;
        color: #ffc174;
    }
    .spd-variant-attrs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 6px;
    }
    .spd-attr-chip {
        padding: 3px 8px;
        background: rgba(46,52,71,0.7);
        border: 1px solid #2e3447;
        border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: #a08e7a;
        white-space: nowrap;
    }
    .spd-attr-chip strong { color: #dce1fb; font-weight: 500; }
    .spd-stock-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 500;
    }
    .spd-stock-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }
    /* Stock control */
    .spd-stock-ctrl {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }
    .spd-stock-ctrl-label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: #a08e7a;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        flex: 0 0 100%;
        margin-bottom: 4px;
    }
    .spd-qty-btn {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 1px solid #2e3447;
        background: #0c1324;
        color: #dce1fb;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.18s;
        flex-shrink: 0;
    }
    .spd-qty-btn:hover { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,0.08); }
    .spd-qty-input {
        width: 64px;
        height: 32px;
        background: #0c1324;
        border: 1px solid #2e3447;
        border-radius: 6px;
        color: #dce1fb;
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        text-align: center;
        outline: none;
        transition: border-color 0.18s;
    }
    .spd-qty-input:focus { border-color: #f59e0b; box-shadow: 0 0 0 1px rgba(245,158,11,0.2); }
    .spd-save-btn {
        height: 32px;
        padding: 0 12px;
        background: rgba(245,158,11,0.12);
        border: 1px solid rgba(245,158,11,0.3);
        border-radius: 6px;
        color: #f59e0b;
        font-size: 12px;
        font-family: 'JetBrains Mono', monospace;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
    }
    .spd-save-btn:hover { background: rgba(245,158,11,0.2); }
    .spd-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .spd-delete-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 30px;
        height: 30px;
        border-radius: 6px;
        border: 1px solid transparent;
        background: transparent;
        color: #534434;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }
    .spd-delete-btn:hover { color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.08); }
    /* Empty variant state */
    .spd-empty {
        background: #131b2e;
        border: 1px dashed #2e3447;
        border-radius: 12px;
        padding: 56px 24px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
    }
    .spd-empty-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        background: rgba(245,158,11,0.08);
        border: 1px solid rgba(245,158,11,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #f59e0b;
    }
    .spd-empty h3 { font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; color: #dce1fb; margin: 0; }
    .spd-empty p { font-size: 14px; color: #a08e7a; margin: 0; max-width: 340px; line-height: 1.6; }

    /* ── Modal ──────────────────────────────────────────────────── */
    .spd-overlay {
        position: fixed;
        inset: 0;
        background: rgba(7,13,31,0.75);
        backdrop-filter: blur(6px);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        animation: spd-fade-in 0.2s ease;
    }
    @keyframes spd-fade-in { from { opacity: 0; } to { opacity: 1; } }
    .spd-modal {
        background: #131b2e;
        border: 1px solid #2e3447;
        border-radius: 16px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 32px 64px rgba(0,0,0,0.6);
        animation: spd-slide-up 0.25s ease;
    }
    @keyframes spd-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .spd-modal-header {
        padding: 24px 28px 20px;
        border-bottom: 1px solid #2e3447;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .spd-modal-title {
        font-family: 'Hanken Grotesk', sans-serif;
        font-size: 20px;
        font-weight: 600;
        color: #dce1fb;
        margin: 0;
    }
    .spd-modal-close {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        border: 1px solid #2e3447;
        background: transparent;
        color: #a08e7a;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }
    .spd-modal-close:hover { color: #dce1fb; border-color: #534434; }
    .spd-modal-body { padding: 28px; display: flex; flex-direction: column; gap: 24px; }
    .spd-modal-footer {
        padding: 20px 28px 24px;
        border-top: 1px solid #2e3447;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }
    /* Form elements */
    .spd-field-group { display: flex; flex-direction: column; gap: 8px; }
    .spd-label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 500;
        color: #a08e7a;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .spd-input {
        background: #0c1324;
        border: 1px solid #2e3447;
        border-radius: 8px;
        color: #dce1fb;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        padding: 10px 14px;
        outline: none;
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.18s, box-shadow 0.18s;
    }
    .spd-input:focus { border-color: #f59e0b; box-shadow: 0 0 0 1px rgba(245,158,11,0.18); }
    .spd-input::placeholder { color: #534434; }
    .spd-select {
        background: #0c1324;
        border: 1px solid #2e3447;
        border-radius: 8px;
        color: #dce1fb;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        padding: 10px 14px;
        outline: none;
        cursor: pointer;
        transition: border-color 0.18s;
    }
    .spd-select:focus { border-color: #f59e0b; }
    .spd-row { display: flex; gap: 12px; }
    .spd-row > * { flex: 1; }
    /* Attributes */
    .spd-attr-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }
    .spd-attr-key { flex: 1; }
    .spd-attr-val { flex: 1.4; }
    .spd-attr-remove {
        width: 32px;
        height: 32px;
        background: transparent;
        border: 1px solid #2e3447;
        border-radius: 6px;
        color: #a08e7a;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.2s;
    }
    .spd-attr-remove:hover { border-color: rgba(248,113,113,0.4); color: #f87171; background: rgba(248,113,113,0.08); }
    .spd-add-attr {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border: 1px dashed #2e3447;
        border-radius: 6px;
        background: transparent;
        color: #a08e7a;
        font-size: 12px;
        font-family: 'JetBrains Mono', monospace;
        cursor: pointer;
        transition: all 0.2s;
        width: fit-content;
        margin-top: 4px;
    }
    .spd-add-attr:hover { border-color: #f59e0b; color: #f59e0b; }
    /* Image dropzone */
    .spd-dropzone {
        border: 1.5px dashed #2e3447;
        border-radius: 10px;
        padding: 28px;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        color: #a08e7a;
        background: rgba(12,19,36,0.5);
    }
    .spd-dropzone:hover, .spd-dropzone.dragging {
        border-color: #f59e0b;
        background: rgba(245,158,11,0.04);
    }
    .spd-dropzone-icon { color: #534434; }
    .spd-dropzone p { margin: 0; font-size: 13px; line-height: 1.5; }
    .spd-dropzone-sub { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #534434; text-transform: uppercase; letter-spacing: 0.05em; }
    .spd-preview-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .spd-preview-item {
        position: relative;
        width: 72px;
        height: 72px;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #2e3447;
    }
    .spd-preview-item img { width: 100%; height: 100%; object-fit: cover; }
    .spd-preview-remove {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: rgba(0,0,0,0.7);
        border: none;
        color: #f87171;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 10px;
        line-height: 1;
    }
    /* Toast */
    .spd-toast {
        position: fixed;
        bottom: 32px;
        right: 32px;
        padding: 14px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 200;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        animation: spd-slide-up 0.25s ease;
        max-width: 360px;
    }
    .spd-toast-success { background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.25); color: #34d399; }
    .spd-toast-error { background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.25); color: #f87171; }
    /* Skeleton */
    .spd-skeleton { background: #1e293b; border-radius: 6px; animation: spd-pulse 1.5s ease-in-out infinite; }
    @keyframes spd-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
    /* Confirm overlay */
    .spd-confirm {
        position: absolute;
        inset: 0;
        background: rgba(12,19,36,0.92);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        z-index: 10;
        padding: 24px;
        text-align: center;
    }
    .spd-confirm p { font-size: 14px; color: #dce1fb; margin: 0; line-height: 1.5; }
    .spd-confirm-actions { display: flex; gap: 10px; }
    .spd-btn-danger {
        padding: 8px 16px;
        background: rgba(248,113,113,0.15);
        border: 1px solid rgba(248,113,113,0.35);
        border-radius: 6px;
        color: #f87171;
        font-size: 13px;
        font-family: 'Inter', sans-serif;
        cursor: pointer;
        transition: all 0.2s;
    }
    .spd-btn-danger:hover { background: rgba(248,113,113,0.25); }

    /* Scrollbar */
    .spd-modal::-webkit-scrollbar { width: 6px; }
    .spd-modal::-webkit-scrollbar-track { background: transparent; }
    .spd-modal::-webkit-scrollbar-thumb { background: #2e3447; border-radius: 3px; }
`;

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */
const SellerProductDetails = () => {
    const { productId } = useParams();
    const { handleGetProductById, handleAddVariant, handleUpdateVariantStock, handleDeleteVariant } = useProduct();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    // Variant stock editing per card
    const [stockDraft, setStockDraft] = useState({});      // { variantId: number }
    const [savingStock, setSavingStock] = useState({});     // { variantId: bool }
    const [savedStock, setSavedStock] = useState({});       // { variantId: bool }
    const [confirmDelete, setConfirmDelete] = useState(null); // variantId or null
    const [deletingId, setDeletingId] = useState(null);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Form
    const [attributes, setAttributes] = useState([{ key: '', value: '' }]);
    const [priceAmount, setPriceAmount] = useState('');
    const [priceCurrency, setPriceCurrency] = useState('INR');
    const [stock, setStock] = useState('');
    const [variantImages, setVariantImages] = useState([]);      // { file, preview }
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Toast
    const [toast, setToast] = useState(null); // { type: 'success'|'error', msg: string }
    const toastTimer = useRef(null);

    const showToast = useCallback((type, msg) => {
        setToast({ type, msg });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3500);
    }, []);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            const data = await handleGetProductById(productId);
            setProduct(data);
            // seed stock drafts from current data
            const draft = {};
            (data?.varient || []).forEach(v => { draft[v._id] = v.stock ?? 0; });
            setStockDraft(draft);
        } catch (err) {
            console.error('Failed to fetch product', err);
            showToast('error', 'Could not load product details.');
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => { fetchProduct(); }, [fetchProduct]);

    /* ── Metric helpers ─────────────────────────────────────────── */
    const variants = product?.varient || [];
    const totalInventory = variants.reduce((acc, v) => acc + (v.stock || 0), 0);

    /* ── Stock save ─────────────────────────────────────────────── */
    const saveStock = async (variantId) => {
        setSavingStock(prev => ({ ...prev, [variantId]: true }));
        try {
            const updated = await handleUpdateVariantStock(productId, variantId, {
                stock: stockDraft[variantId],
            });
            setProduct(updated);
            setSavedStock(prev => ({ ...prev, [variantId]: true }));
            setTimeout(() => setSavedStock(prev => ({ ...prev, [variantId]: false })), 2000);
            showToast('success', 'Stock updated successfully.');
        } catch (err) {
            console.error(err);
            showToast('error', 'Failed to update stock.');
        } finally {
            setSavingStock(prev => ({ ...prev, [variantId]: false }));
        }
    };

    /* ── Delete variant ─────────────────────────────────────────── */
    const doDelete = async (variantId) => {
        setDeletingId(variantId);
        try {
            const updated = await handleDeleteVariant(productId, variantId);
            setProduct(updated);
            const draft = {};
            (updated?.varient || []).forEach(v => { draft[v._id] = v.stock ?? 0; });
            setStockDraft(draft);
            setConfirmDelete(null);
            showToast('success', 'Variant deleted.');
        } catch (err) {
            console.error(err);
            showToast('error', 'Failed to delete variant.');
        } finally {
            setDeletingId(null);
        }
    };

    /* ── Modal helpers ──────────────────────────────────────────── */
    const resetModal = () => {
        setAttributes([{ key: '', value: '' }]);
        setPriceAmount('');
        setPriceCurrency('INR');
        setStock('');
        setVariantImages([]);
        setIsDragging(false);
    };

    const openModal = () => { resetModal(); setShowModal(true); };
    const closeModal = () => setShowModal(false);

    const handleAttrChange = (idx, field, val) => {
        setAttributes(prev => prev.map((a, i) => i === idx ? { ...a, [field]: val } : a));
    };
    const addAttr = () => setAttributes(prev => [...prev, { key: '', value: '' }]);
    const removeAttr = (idx) => setAttributes(prev => prev.filter((_, i) => i !== idx));

    const processFiles = (files) => {
        const newImgs = Array.from(files).slice(0, 5 - variantImages.length).map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setVariantImages(prev => [...prev, ...newImgs]);
    };
    const handleFileChange = (e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ''; };
    const removePreview = (idx) => setVariantImages(prev => prev.filter((_, i) => i !== idx));

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) processFiles(e.dataTransfer.files); };

    const handleSubmitVariant = async () => {
        if (!priceAmount || isNaN(Number(priceAmount))) {
            showToast('error', 'Please enter a valid price.'); return;
        }
        if (!stock || isNaN(Number(stock))) {
            showToast('error', 'Please enter a valid stock quantity.'); return;
        }

        setModalLoading(true);
        try {
            const formData = new FormData();
            formData.append('priceAmount', priceAmount);
            formData.append('priceCurrency', priceCurrency);
            formData.append('stock', stock);

            const attrsObj = {};
            attributes.filter(a => a.key.trim()).forEach(a => { attrsObj[a.key.trim()] = a.value.trim(); });
            formData.append('attributes', JSON.stringify(attrsObj));

            variantImages.forEach(img => formData.append('images', img.file));

            const updated = await handleAddVariant(productId, formData);
            setProduct(updated);
            const draft = {};
            (updated?.varient || []).forEach(v => { draft[v._id] = v.stock ?? 0; });
            setStockDraft(draft);
            closeModal();
            showToast('success', 'Variant created successfully!');
        } catch (err) {
            console.error(err);
            showToast('error', 'Failed to create variant.');
        } finally {
            setModalLoading(false);
        }
    };

    /* ─────────────────────────────────────────── RENDER ─────────── */
    return (
        <>
            <style>{styles}</style>
            <div className="spd-root">
                {/* ── Top Bar ─────────────────────────────────────── */}
                <header className="spd-topbar">
                    <Link to="/" className="spd-logo">ZENTR<span>A</span></Link>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link to="/seller/dashboard" className="spd-nav-btn">
                            <IconArrowLeft /> Dashboard
                        </Link>
                        <button className="spd-btn-primary" onClick={openModal}>
                            <IconPlus /> Add Variant
                        </button>
                    </div>
                </header>

                {/* ── Main Content ────────────────────────────────── */}
                <main className="spd-container">

                    {loading ? (
                        /* Skeleton */
                        <>
                            <div className="spd-hero">
                                <div className="spd-gallery">
                                    <div className="spd-skeleton" style={{ aspectRatio: '4/3', borderRadius: 10 }} />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {[1, 2, 3].map(n => <div key={n} className="spd-skeleton" style={{ width: 64, height: 64, borderRadius: 6 }} />)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
                                    <div className="spd-skeleton" style={{ height: 20, width: 120, borderRadius: 4 }} />
                                    <div className="spd-skeleton" style={{ height: 40, width: '80%', borderRadius: 6 }} />
                                    <div className="spd-skeleton" style={{ height: 40, width: '60%', borderRadius: 6 }} />
                                    <div className="spd-skeleton" style={{ height: 80, borderRadius: 8 }} />
                                    <div className="spd-stats-grid">
                                        {[1, 2, 3].map(n => <div key={n} className="spd-skeleton" style={{ height: 80, borderRadius: 8 }} />)}
                                    </div>
                                </div>
                            </div>
                            <div className="spd-divider" />
                            <div className="spd-variants-grid">
                                {[1, 2, 3].map(n => <div key={n} className="spd-skeleton" style={{ height: 220, borderRadius: 12 }} />)}
                            </div>
                        </>
                    ) : product ? (
                        <>
                            {/* ── Hero ─────────────────────────────── */}
                            <section className="spd-hero">
                                {/* Gallery */}
                                <div className="spd-gallery">
                                    <div className="spd-gallery-main">
                                        {product.images?.length > 0 ? (
                                            <img src={product.images[activeImage]?.url} alt={product.title} />
                                        ) : (
                                            <div style={{ color: '#2e3447' }}><IconImage /></div>
                                        )}
                                    </div>
                                    {product.images?.length > 1 && (
                                        <div className="spd-gallery-thumbs">
                                            {product.images.map((img, idx) => (
                                                <div
                                                    key={img._id || idx}
                                                    className={`spd-thumb${activeImage === idx ? ' active' : ''}`}
                                                    onClick={() => setActiveImage(idx)}
                                                >
                                                    <img src={img.url} alt="" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="spd-product-info">
                                    <div className="spd-badge-row">
                                        <span className="spd-badge spd-badge-amber">Seller Listing</span>
                                        <span className="spd-badge spd-badge-slate" style={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}>
                                            {product._id?.slice(-8).toUpperCase()}
                                        </span>
                                    </div>
                                    <h1 className="spd-title">{product.title}</h1>
                                    <p className="spd-desc">{product.description}</p>
                                    <div className="spd-price-row">
                                        <span className="spd-price-main">{formatPrice(product.price)}</span>
                                        <span className="spd-badge spd-badge-slate">Base Price</span>
                                    </div>

                                    <div className="spd-stats-grid">
                                        <div className="spd-stat">
                                            <span className="spd-stat-label">Variants</span>
                                            <span className="spd-stat-value">{variants.length}</span>
                                        </div>
                                        <div className="spd-stat">
                                            <span className="spd-stat-label">Inventory</span>
                                            <span className="spd-stat-value">{totalInventory}</span>
                                        </div>
                                        <div className="spd-stat">
                                            <span className="spd-stat-label">Images</span>
                                            <span className="spd-stat-value">{product.images?.length || 0}</span>
                                        </div>
                                    </div>

                                    <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#534434', margin: 0 }}>
                                        Created {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                                    </p>
                                </div>
                            </section>

                            <div className="spd-divider" />

                            {/* ── Variants Section ─────────────────── */}
                            <section>
                                <div className="spd-section-header">
                                    <h2 className="spd-section-title">
                                        Product Variants
                                        <span>{variants.length} {variants.length === 1 ? 'variant' : 'variants'}</span>
                                    </h2>
                                    <button className="spd-btn-primary" onClick={openModal}>
                                        <IconPlus /> New Variant
                                    </button>
                                </div>

                                {variants.length === 0 ? (
                                    <div className="spd-empty">
                                        <div className="spd-empty-icon"><IconPackage /></div>
                                        <h3>No Variants Yet</h3>
                                        <p>Add your first product variant with unique attributes like Color, Size, or Material and set initial stock levels.</p>
                                        <button className="spd-btn-primary" onClick={openModal} style={{ marginTop: 8 }}>
                                            <IconPlus /> Create First Variant
                                        </button>
                                    </div>
                                ) : (
                                    <div className="spd-variants-grid">
                                        {variants.map((variant) => {
                                            const stockStatus = getStockStatus(variant.stock ?? 0);
                                            const attrs = getAttrsDisplay(variant.attridutes);
                                            const thumbImg = variant.images?.[0]?.url;
                                            const isSaving = savingStock[variant._id];
                                            const isSaved = savedStock[variant._id];
                                            const isDeleting = deletingId === variant._id;
                                            const isConfirming = confirmDelete === variant._id;

                                            return (
                                                <div key={variant._id} className="spd-variant-card">
                                                    {/* Confirm Delete overlay */}
                                                    {isConfirming && (
                                                        <div className="spd-confirm">
                                                            <div style={{ color: '#f87171' }}><IconTrash /></div>
                                                            <p>Delete this variant?<br /><span style={{ color: '#a08e7a', fontSize: 12 }}>This action cannot be undone.</span></p>
                                                            <div className="spd-confirm-actions">
                                                                <button className="spd-btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
                                                                <button
                                                                    className="spd-btn-danger"
                                                                    disabled={isDeleting}
                                                                    onClick={() => doDelete(variant._id)}
                                                                >
                                                                    {isDeleting ? 'Deleting…' : 'Delete'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Delete trigger */}
                                                    <button
                                                        className="spd-delete-btn"
                                                        onClick={() => setConfirmDelete(variant._id)}
                                                        title="Delete variant"
                                                    >
                                                        <IconTrash />
                                                    </button>

                                                    {/* Top row: image + info */}
                                                    <div className="spd-variant-top">
                                                        <div className="spd-variant-img">
                                                            {thumbImg ? <img src={thumbImg} alt="variant" /> : <IconImage />}
                                                        </div>
                                                        <div className="spd-variant-info">
                                                            <div className="spd-variant-price">{formatPrice(variant.price)}</div>
                                                            {attrs.length > 0 ? (
                                                                <div className="spd-variant-attrs">
                                                                    {attrs.map(([k, v]) => (
                                                                        <span key={k} className="spd-attr-chip">
                                                                            <strong>{k}:</strong> {v}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="spd-variant-attrs">
                                                                    <span className="spd-attr-chip" style={{ color: '#534434' }}>No attributes</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Stock badge */}
                                                    <div>
                                                        <span
                                                            className="spd-stock-badge"
                                                            style={{ background: stockStatus.bg, color: stockStatus.color }}
                                                        >
                                                            <span className="spd-stock-dot" style={{ background: stockStatus.dot }} />
                                                            {stockStatus.label}
                                                        </span>
                                                    </div>

                                                    {/* Stock Controls */}
                                                    <div className="spd-stock-ctrl">
                                                        <span className="spd-stock-ctrl-label">Manage Stock</span>
                                                        <button
                                                            className="spd-qty-btn"
                                                            onClick={() => setStockDraft(prev => ({
                                                                ...prev,
                                                                [variant._id]: Math.max(0, (prev[variant._id] ?? 0) - 1)
                                                            }))}
                                                        >
                                                            <IconMinus />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            className="spd-qty-input"
                                                            min="0"
                                                            value={stockDraft[variant._id] ?? variant.stock ?? 0}
                                                            onChange={e => setStockDraft(prev => ({
                                                                ...prev,
                                                                [variant._id]: Math.max(0, parseInt(e.target.value) || 0)
                                                            }))}
                                                        />
                                                        <button
                                                            className="spd-qty-btn"
                                                            onClick={() => setStockDraft(prev => ({
                                                                ...prev,
                                                                [variant._id]: (prev[variant._id] ?? 0) + 1
                                                            }))}
                                                        >
                                                            <IconPlus />
                                                        </button>
                                                        <button
                                                            className="spd-save-btn"
                                                            onClick={() => saveStock(variant._id)}
                                                            disabled={isSaving}
                                                        >
                                                            {isSaved ? <><IconCheck /> Saved</> : isSaving ? 'Saving…' : 'Save'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        </>
                    ) : (
                        /* Product not found */
                        <div className="spd-empty" style={{ marginTop: 80 }}>
                            <div className="spd-empty-icon"><IconPackage /></div>
                            <h3>Product Not Found</h3>
                            <p>This product doesn't exist or you don't have access to it.</p>
                            <Link to="/seller/dashboard" className="spd-btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>
                                <IconArrowLeft /> Back to Dashboard
                            </Link>
                        </div>
                    )}
                </main>

                {/* ══ Add Variant Modal ══════════════════════════════════════ */}
                {showModal && (
                    <div className="spd-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
                        <div className="spd-modal">
                            <div className="spd-modal-header">
                                <h2 className="spd-modal-title">Add New Variant</h2>
                                <button className="spd-modal-close" onClick={closeModal}><IconClose /></button>
                            </div>

                            <div className="spd-modal-body">
                                {/* Attributes */}
                                <div className="spd-field-group">
                                    <label className="spd-label">Attributes</label>
                                    {attributes.map((attr, idx) => (
                                        <div key={idx} className="spd-attr-row">
                                            <div className="spd-attr-key">
                                                <input
                                                    className="spd-input"
                                                    placeholder="e.g. Color"
                                                    value={attr.key}
                                                    onChange={e => handleAttrChange(idx, 'key', e.target.value)}
                                                />
                                            </div>
                                            <div className="spd-attr-val">
                                                <input
                                                    className="spd-input"
                                                    placeholder="e.g. Midnight Black"
                                                    value={attr.value}
                                                    onChange={e => handleAttrChange(idx, 'value', e.target.value)}
                                                />
                                            </div>
                                            {attributes.length > 1 && (
                                                <button className="spd-attr-remove" onClick={() => removeAttr(idx)}>
                                                    <IconClose />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button className="spd-add-attr" onClick={addAttr}>
                                        <IconPlus /> Add Attribute
                                    </button>
                                </div>

                                {/* Price & Currency */}
                                <div className="spd-field-group">
                                    <label className="spd-label">Pricing</label>
                                    <div className="spd-row">
                                        <input
                                            type="number"
                                            className="spd-input"
                                            placeholder="Amount"
                                            min="0"
                                            value={priceAmount}
                                            onChange={e => setPriceAmount(e.target.value)}
                                        />
                                        <select
                                            className="spd-select"
                                            value={priceCurrency}
                                            onChange={e => setPriceCurrency(e.target.value)}
                                            style={{ flex: 0.5 }}
                                        >
                                            <option value="INR">INR ₹</option>
                                            <option value="USD">USD $</option>
                                            <option value="EUR">EUR €</option>
                                            <option value="GBP">GBP £</option>
                                            <option value="JPY">JPY ¥</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Stock */}
                                <div className="spd-field-group">
                                    <label className="spd-label">Initial Stock</label>
                                    <input
                                        type="number"
                                        className="spd-input"
                                        placeholder="e.g. 25"
                                        min="0"
                                        value={stock}
                                        onChange={e => setStock(e.target.value)}
                                        style={{ maxWidth: 160 }}
                                    />
                                </div>

                                {/* Images */}
                                <div className="spd-field-group">
                                    <label className="spd-label">Variant Images <span style={{ color: '#534434', fontWeight: 400 }}>(up to 5)</span></label>
                                    <div
                                        className={`spd-dropzone${isDragging ? ' dragging' : ''}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <div className="spd-dropzone-icon"><IconUpload /></div>
                                        <p>Drop images here or <span style={{ color: '#f59e0b' }}>click to browse</span></p>
                                        <span className="spd-dropzone-sub">PNG, JPG, WEBP · Max 5MB each</span>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    {variantImages.length > 0 && (
                                        <div className="spd-preview-grid">
                                            {variantImages.map((img, idx) => (
                                                <div key={idx} className="spd-preview-item">
                                                    <img src={img.preview} alt="" />
                                                    <button className="spd-preview-remove" onClick={() => removePreview(idx)}>✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="spd-modal-footer">
                                <button className="spd-btn-ghost" onClick={closeModal} disabled={modalLoading}>Cancel</button>
                                <button className="spd-btn-primary" onClick={handleSubmitVariant} disabled={modalLoading}>
                                    {modalLoading ? 'Creating…' : <><IconCheck /> Create Variant</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Toast ─────────────────────────────────────────── */}
                {toast && (
                    <div className={`spd-toast spd-toast-${toast.type}`}>
                        {toast.type === 'success' ? <IconCheck /> : '⚠'}
                        {toast.msg}
                    </div>
                )}
            </div>
        </>
    );
};

export default SellerProductDetails;