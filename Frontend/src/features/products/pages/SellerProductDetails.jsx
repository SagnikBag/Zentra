import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { useProduct } from '../hooks/useProduct';

/* ─── Icons ───────────────────────────────────────────────────────── */
const IconArrowLeft = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const IconPlus = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IconCheck = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;
const IconMinus = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>;
const IconTrash = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const IconClose = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconUpload = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>;
const IconImage = () => <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0Z" /></svg>;
const IconPackage = () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>;

/* ─── Helpers ─────────────────────────────────────────────────────── */
const formatPrice = (price) => {
    if (!price) return '$0.00';
    const amount = parseFloat(price.amount || 0);
    const currency = price.currency || 'USD';
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
};

const getStockStatus = (stock) => {
    if (stock > 20) return { label: 'In Stock', bg: 'rgba(52,211,153,0.1)', color: '#34d399', dot: '#34d399' };
    if (stock > 0) return { label: 'Low Stock', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', dot: '#f59e0b' };
    return { label: 'Out of Stock', bg: 'rgba(248,113,113,0.1)', color: '#f87171', dot: '#f87171' };
};

const getAttrsDisplay = (attrObj) => {
    if (!attrObj) return [];
    if (typeof attrObj !== 'object') return [];
    return Object.entries(attrObj);
};

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
            const draft = {};
            (data?.variants || []).forEach(v => { draft[v._id] = v.stock ?? 0; });
            setStockDraft(draft);
        } catch (err) {
            console.error('Failed to fetch product', err);
            showToast('error', 'Could not load product details.');
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => { fetchProduct(); }, [fetchProduct]);

    const variants = product?.variants || [];
    const totalInventory = variants.reduce((acc, v) => acc + (v.stock || 0), 0);

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

    const doDelete = async (variantId) => {
        setDeletingId(variantId);
        try {
            const updated = await handleDeleteVariant(productId, variantId);
            setProduct(updated);
            const draft = {};
            (updated?.variants || []).forEach(v => { draft[v._id] = v.stock ?? 0; });
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

    const handleAttrChange = (idx, field, val) => setAttributes(prev => prev.map((a, i) => i === idx ? { ...a, [field]: val } : a));
    const addAttr = () => setAttributes(prev => [...prev, { key: '', value: '' }]);
    const removeAttr = (idx) => setAttributes(prev => prev.filter((_, i) => i !== idx));

    const processFiles = (files) => {
        const newImgs = Array.from(files).slice(0, 5 - variantImages.length).map(file => ({
            file, preview: URL.createObjectURL(file),
        }));
        setVariantImages(prev => [...prev, ...newImgs]);
    };
    const handleFileChange = (e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ''; };
    const removePreview = (idx) => setVariantImages(prev => prev.filter((_, i) => i !== idx));

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) processFiles(e.dataTransfer.files); };

    const handleSubmitVariant = async () => {
        if (!priceAmount || isNaN(Number(priceAmount))) return showToast('error', 'Please enter a valid price.');
        if (!stock || isNaN(Number(stock))) return showToast('error', 'Please enter a valid stock quantity.');

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
            (updated?.variants || []).forEach(v => { draft[v._id] = v.stock ?? 0; });
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

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans pb-24 relative">
            {/* Top Bar */}
            <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a] h-16 flex items-center justify-between px-6 lg:px-12">
                <Link to="/" className="text-xl font-bold tracking-tight text-[#fafafa]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    ZENTR<span className="text-[#f59e0b]">A</span>
                </Link>
                <div className="flex gap-3">
                    <Link to="/seller/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-[#71717a] border border-[#27272a] rounded-xl hover:text-[#fafafa] hover:bg-[#27272a] transition-all">
                        <IconArrowLeft /> Dashboard
                    </Link>
                    <button onClick={openModal} className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#09090b] font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-md active:scale-95">
                        <IconPlus /> Add Variant
                    </button>
                </div>
            </header>

            <main className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-12 relative">
                {/* Ambient glow */}
                <div className="absolute top-0 right-10 w-[400px] h-[400px] bg-[#f59e0b]/5 rounded-full blur-[140px] pointer-events-none" />

                {loading ? (
                    /* Skeleton */
                    <div className="animate-pulse">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                            <div>
                                <div className="aspect-[4/3] bg-[#27272a]/50 rounded-2xl mb-4" />
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(n => <div key={n} className="w-16 h-16 bg-[#27272a]/50 rounded-xl" />)}
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 pt-2">
                                <div className="h-6 w-32 bg-[#27272a]/50 rounded" />
                                <div className="h-10 w-full bg-[#27272a]/50 rounded" />
                                <div className="h-20 w-3/4 bg-[#27272a]/50 rounded" />
                                <div className="grid grid-cols-3 gap-3 mt-6">
                                    {[1, 2, 3].map(n => <div key={n} className="h-24 bg-[#27272a]/50 rounded-xl" />)}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : product ? (
                    <>
                        {/* Hero Section */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                            <div className="flex flex-col gap-3">
                                <div className="aspect-[4/3] bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden flex items-center justify-center">
                                    {product.images?.length > 0 ? (
                                        <img src={product.images[activeImage]?.url} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <IconImage />
                                    )}
                                </div>
                                {product.images?.length > 1 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {product.images.map((img, idx) => (
                                            <div
                                                key={img._id || idx}
                                                onClick={() => setActiveImage(idx)}
                                                className={`w-16 h-16 rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${activeImage === idx ? 'border-[#f59e0b] scale-105' : 'border-[#27272a] hover:border-[#3f3f46]'}`}
                                            >
                                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-5 pt-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2 py-0.5 rounded-md">Seller Listing</span>
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a] bg-[#27272a] border border-[#3f3f46] px-2 py-0.5 rounded-md">{product._id?.slice(-8)}</span>
                                </div>
                                
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#fafafa] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        {product.title}
                                    </h1>
                                    <p className="text-sm text-[#a1a1aa] leading-relaxed">{product.description}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-[#f59e0b] font-mono">{formatPrice(product.price)}</span>
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a] bg-[#27272a] px-2 py-0.5 rounded-md">Base Price</span>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex flex-col gap-1">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Variants</span>
                                        <span className="text-xl font-bold text-[#fafafa]">{variants.length}</span>
                                    </div>
                                    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex flex-col gap-1">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Inventory</span>
                                        <span className="text-xl font-bold text-[#fafafa]">{totalInventory}</span>
                                    </div>
                                    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex flex-col gap-1">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Images</span>
                                        <span className="text-xl font-bold text-[#fafafa]">{product.images?.length || 0}</span>
                                    </div>
                                </div>

                                <p className="text-[10px] font-mono text-[#52525b] uppercase mt-2">
                                    Created {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '—'}
                                </p>
                            </div>
                        </section>

                        <div className="h-px w-full bg-gradient-to-r from-[#27272a] to-transparent mb-12" />

                        {/* Variants Section */}
                        <section>
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                                <h2 className="text-2xl font-bold text-[#fafafa] flex items-center gap-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    Product Variants
                                    <span className="text-sm font-normal font-mono text-[#71717a]">{variants.length} {variants.length === 1 ? 'variant' : 'variants'}</span>
                                </h2>
                                <button onClick={openModal} className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#09090b] font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-md">
                                    <IconPlus /> New Variant
                                </button>
                            </div>

                            {variants.length === 0 ? (
                                <div className="bg-[#18181b] border border-dashed border-[#3f3f46] rounded-2xl p-16 text-center flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
                                        <IconPackage />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#fafafa]">No Variants Yet</h3>
                                    <p className="text-sm text-[#71717a] max-w-sm">Add your first product variant with unique attributes like Color, Size, or Material and set initial stock levels.</p>
                                    <button onClick={openModal} className="mt-2 flex items-center gap-2 bg-[#f59e0b] text-[#09090b] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#d97706] transition-all shadow-md">
                                        <IconPlus /> Create First Variant
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {variants.map(variant => {
                                        const stockStatus = getStockStatus(variant.stock ?? 0);
                                        const attrs = getAttrsDisplay(variant.attridutes);
                                        const thumbImg = variant.images?.[0]?.url;
                                        const isSaving = savingStock[variant._id];
                                        const isSaved = savedStock[variant._id];
                                        const isDeleting = deletingId === variant._id;
                                        const isConfirming = confirmDelete === variant._id;

                                        return (
                                            <div key={variant._id} className="relative bg-[#18181b] border border-[#27272a] hover:border-[#f59e0b]/40 rounded-2xl p-6 flex flex-col gap-5 transition-all shadow-lg">
                                                
                                                {/* Delete Overlay */}
                                                {isConfirming && (
                                                    <div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-sm rounded-2xl z-10 flex flex-col items-center justify-center gap-3 p-6 text-center border border-[#f87171]/20">
                                                        <div className="text-[#f87171]"><IconTrash /></div>
                                                        <p className="text-sm font-semibold text-[#fafafa]">Delete this variant?</p>
                                                        <p className="text-xs text-[#71717a] mb-2">This action cannot be undone.</p>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-[#fafafa] bg-[#27272a] rounded-lg hover:bg-[#3f3f46] transition-colors">Cancel</button>
                                                            <button onClick={() => doDelete(variant._id)} disabled={isDeleting} className="px-4 py-2 text-sm text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-lg hover:bg-[#f87171]/20 transition-colors">
                                                                {isDeleting ? 'Deleting…' : 'Delete'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Delete Btn */}
                                                <button onClick={() => setConfirmDelete(variant._id)} className="absolute top-4 right-4 w-8 h-8 rounded-lg text-[#52525b] hover:text-[#f87171] hover:bg-[#f87171]/10 flex items-center justify-center transition-all cursor-pointer">
                                                    <IconTrash />
                                                </button>

                                                {/* Info */}
                                                <div className="flex gap-4 pr-8">
                                                    <div className="w-16 h-16 shrink-0 bg-[#09090b] border border-[#27272a] rounded-xl flex items-center justify-center overflow-hidden text-[#3f3f46]">
                                                        {thumbImg ? <img src={thumbImg} alt="variant" className="w-full h-full object-cover" /> : <IconImage />}
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-bold font-mono text-[#f59e0b] mb-2">{formatPrice(variant.price)}</div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {attrs.length > 0 ? attrs.map(([k, v]) => (
                                                                <span key={k} className="px-2 py-0.5 bg-[#27272a] border border-[#3f3f46] rounded-md text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider">
                                                                    <strong className="text-[#fafafa]">{k}:</strong> {v}
                                                                </span>
                                                            )) : <span className="text-[10px] font-mono text-[#52525b]">No attributes</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Badge */}
                                                <div>
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-widest border" style={{ backgroundColor: stockStatus.bg, color: stockStatus.color, borderColor: `${stockStatus.color}40` }}>
                                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stockStatus.dot }} />
                                                        {stockStatus.label}
                                                    </span>
                                                </div>

                                                {/* Controls */}
                                                <div className="pt-4 border-t border-[#27272a] flex items-center justify-between gap-2 flex-wrap">
                                                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a] w-full mb-1">Manage Stock</span>
                                                    <div className="flex items-center gap-1 bg-[#09090b] border border-[#27272a] rounded-lg p-1">
                                                        <button onClick={() => setStockDraft(prev => ({ ...prev, [variant._id]: Math.max(0, (prev[variant._id] ?? 0) - 1) }))} className="w-7 h-7 flex items-center justify-center rounded-md text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa] transition-colors cursor-pointer"><IconMinus /></button>
                                                        <input type="number" min="0" value={stockDraft[variant._id] ?? variant.stock ?? 0} onChange={e => setStockDraft(prev => ({ ...prev, [variant._id]: Math.max(0, parseInt(e.target.value) || 0) }))} className="w-12 h-7 bg-transparent text-center font-mono text-sm text-[#fafafa] outline-none" />
                                                        <button onClick={() => setStockDraft(prev => ({ ...prev, [variant._id]: (prev[variant._id] ?? 0) + 1 }))} className="w-7 h-7 flex items-center justify-center rounded-md text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa] transition-colors cursor-pointer"><IconPlus /></button>
                                                    </div>
                                                    <button onClick={() => saveStock(variant._id)} disabled={isSaving} className="h-9 px-4 rounded-lg bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#f59e0b] text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer">
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
                    <div className="flex flex-col items-center justify-center py-20 mt-10 bg-[#18181b] border border-dashed border-[#27272a] rounded-2xl text-center">
                        <div className="text-[#3f3f46] mb-4"><IconPackage /></div>
                        <h3 className="text-xl font-bold text-[#fafafa] mb-2">Product Not Found</h3>
                        <p className="text-[#71717a] text-sm mb-6">This product doesn't exist or you don't have access to it.</p>
                        <Link to="/seller/dashboard" className="bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                            <IconArrowLeft /> Back to Dashboard
                        </Link>
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in flex flex-col">
                        
                        <div className="sticky top-0 bg-[#18181b] z-10 flex items-center justify-between p-6 border-b border-[#27272a]">
                            <h2 className="text-xl font-bold text-[#fafafa]">Add New Variant</h2>
                            <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-[#27272a] transition-all cursor-pointer"><IconClose /></button>
                        </div>

                        <div className="p-6 flex flex-col gap-6">
                            
                            {/* Attributes */}
                            <div>
                                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#71717a] mb-2">Attributes</label>
                                <div className="flex flex-col gap-3">
                                    {attributes.map((attr, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <input className="flex-1 bg-[#09090b] border border-[#27272a] px-3 py-2.5 rounded-lg text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#f59e0b]/50 transition-colors" placeholder="e.g. Color" value={attr.key} onChange={e => handleAttrChange(idx, 'key', e.target.value)} />
                                            <input className="flex-1 bg-[#09090b] border border-[#27272a] px-3 py-2.5 rounded-lg text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#f59e0b]/50 transition-colors" placeholder="e.g. Black" value={attr.value} onChange={e => handleAttrChange(idx, 'value', e.target.value)} />
                                            {attributes.length > 1 && <button onClick={() => removeAttr(idx)} className="w-10 h-10 flex items-center justify-center border border-[#27272a] rounded-lg text-[#71717a] hover:text-[#f87171] hover:border-[#f87171]/40 hover:bg-[#f87171]/10 transition-colors cursor-pointer"><IconClose /></button>}
                                        </div>
                                    ))}
                                    <button onClick={addAttr} className="self-start text-[11px] font-mono flex items-center gap-1.5 text-[#a1a1aa] hover:text-[#f59e0b] border border-dashed border-[#3f3f46] hover:border-[#f59e0b] px-3 py-1.5 rounded-md transition-colors cursor-pointer">
                                        <IconPlus /> Add Attribute
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Price */}
                                <div>
                                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[#71717a] mb-2">Pricing</label>
                                    <div className="flex gap-2">
                                        <input type="number" min="0" placeholder="Amount" value={priceAmount} onChange={e => setPriceAmount(e.target.value)} className="flex-[2] bg-[#09090b] border border-[#27272a] px-3 py-2.5 rounded-lg text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#f59e0b]/50 transition-colors" />
                                        <select value={priceCurrency} onChange={e => setPriceCurrency(e.target.value)} className="flex-1 bg-[#09090b] border border-[#27272a] px-3 py-2.5 rounded-lg text-sm text-[#fafafa] focus:outline-none focus:border-[#f59e0b]/50 appearance-none cursor-pointer text-center">
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[#71717a] mb-2">Initial Stock</label>
                                    <input type="number" min="0" placeholder="0" value={stock} onChange={e => setStock(e.target.value)} className="w-full bg-[#09090b] border border-[#27272a] px-3 py-2.5 rounded-lg text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#f59e0b]/50 transition-colors" />
                                </div>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#71717a] mb-2">Images <span className="lowercase text-[#52525b]">(up to 5)</span></label>
                                <div onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragging ? 'border-[#f59e0b] bg-[#f59e0b]/5' : 'border-[#27272a] bg-[#09090b] hover:border-[#3f3f46]'}`}>
                                    <div className="text-[#52525b] mb-2"><IconUpload /></div>
                                    <p className="text-sm text-[#a1a1aa] mb-1">Drop images or <span className="text-[#f59e0b]">browse</span></p>
                                    <p className="text-[10px] font-mono text-[#52525b]">PNG, JPG, WEBP</p>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                                
                                {variantImages.length > 0 && (
                                    <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                        {variantImages.map((img, idx) => (
                                            <div key={idx} className="relative w-16 h-16 shrink-0 rounded-lg border border-[#27272a] overflow-hidden group">
                                                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                                <button onClick={() => removePreview(idx)} className="absolute inset-0 bg-black/60 text-[#f87171] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs cursor-pointer">
                                                    <IconClose />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#27272a] bg-[#09090b] rounded-b-2xl flex justify-end gap-3 sticky bottom-0">
                            <button onClick={closeModal} disabled={modalLoading} className="px-5 py-2.5 rounded-xl border border-[#27272a] text-[#a1a1aa] text-sm font-bold hover:bg-[#27272a] hover:text-[#fafafa] transition-colors cursor-pointer">Cancel</button>
                            <button onClick={handleSubmitVariant} disabled={modalLoading} className="px-5 py-2.5 rounded-xl bg-[#f59e0b] text-[#09090b] text-sm font-bold hover:bg-[#d97706] transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50">
                                {modalLoading ? 'Creating…' : <><IconCheck /> Create Variant</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl border shadow-xl text-sm font-semibold animate-slide-up ${toast.type === 'success' ? 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]' : 'bg-[#f87171]/10 border-[#f87171]/20 text-[#f87171]'}`}>
                    {toast.type === 'success' ? <IconCheck /> : '⚠'} {toast.msg}
                </div>
            )}
            <style>{`
                @keyframes animate-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes animate-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: animate-fade-in 0.2s ease-out forwards; }
                .animate-slide-up { animation: animate-slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default SellerProductDetails;