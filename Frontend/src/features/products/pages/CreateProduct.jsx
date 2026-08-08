import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { useProduct } from "../hooks/useProduct";

export function CreateProduct() {
    const { handleCreateProduct } = useProduct();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priceAmount: "",
        priceCurrency: "USD",
    });
    const [images, setImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [focusedField, setFocusedField] = useState(null);

    const MAX_IMAGES = 7;

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (e) => {
        setFormData((prev) => ({ ...prev, priceCurrency: e.target.value }));
    };

    const processFiles = (files) => {
        const remaining = MAX_IMAGES - images.length;
        if (remaining <= 0) return;
        const newFiles = Array.from(files).slice(0, remaining);
        const newImages = newFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
    };

    const handleFileChange = (e) => {
        if (e.target.files) processFiles(e.target.files);
        e.target.value = "";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    };

    const removeImage = (index) => {
        setImages((prev) => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", message: "" });
        try {
            const submitData = new FormData();
            submitData.append("title", formData.title);
            submitData.append("description", formData.description);
            submitData.append("priceAmount", formData.priceAmount);
            submitData.append("priceCurrency", formData.priceCurrency);
            images.forEach((img) => {
                submitData.append("images", img.file);
            });
            await handleCreateProduct(submitData);
            setStatus({ type: "success", message: "Product created successfully!" });
            setTimeout(() => {
                navigate("/seller/dashboard");
            }, 1500);
        } catch (err) {
            console.error(err);
            setStatus({
                type: "error",
                message: err.response?.data?.message || "Failed to create product. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] py-10 px-4 md:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <nav className="flex items-center gap-2 text-xs text-[#52525b] mb-4">
                        <Link to="/seller/dashboard" className="hover:text-[#a1a1aa] transition-colors">Dashboard</Link>
                        <span>/</span>
                        <span className="text-[#a1a1aa]">Add Product</span>
                    </nav>
                    <h1 className="text-3xl font-bold tracking-tight text-[#fafafa] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Create New Listing</h1>
                    <p className="text-sm text-[#71717a]">Add a new product to your marketplace portfolio.</p>
                </div>

                {/* Status Message */}
                {status.message && (
                    <div className={`mb-8 p-4 rounded-xl border flex items-start gap-3 z-animate-fade-in ${status.type === 'success' ? 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]' : 'bg-[#f87171]/10 border-[#f87171]/20 text-[#f87171]'}`}>
                        {status.type === 'success' ? (
                            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0Z" /></svg>
                        ) : (
                            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" /></svg>
                        )}
                        <div>
                            <h4 className="text-sm font-semibold mb-1">{status.type === 'success' ? 'Success!' : 'Error'}</h4>
                            <p className="text-xs opacity-90">{status.message}</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Basic Info Section */}
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 md:p-8">
                        <h2 className="text-lg font-bold text-[#fafafa] mb-6 border-b border-[#27272a] pb-4">Basic Information</h2>
                        
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-xs font-mono uppercase tracking-widest text-[#a1a1aa] mb-2">Product Title <span className="text-[#f87171]">*</span></label>
                                <input
                                    id="title"
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('title')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="E.g. Premium Wireless Headphones"
                                    className={`w-full bg-[#09090b] border px-4 py-3 rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none transition-all ${focusedField === 'title' ? 'border-[#f59e0b] shadow-[0_0_0_1px_rgba(245,158,11,0.2)]' : 'border-[#3f3f46]'}`}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-xs font-mono uppercase tracking-widest text-[#a1a1aa] mb-2">Description <span className="text-[#f87171]">*</span></label>
                                <textarea
                                    id="description"
                                    required
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('description')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Describe the product, its features, and benefits..."
                                    className={`w-full bg-[#09090b] border px-4 py-3 rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none transition-all resize-y ${focusedField === 'description' ? 'border-[#f59e0b] shadow-[0_0_0_1px_rgba(245,158,11,0.2)]' : 'border-[#3f3f46]'}`}
                                />
                            </div>

                            {/* Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="priceAmount" className="block text-xs font-mono uppercase tracking-widest text-[#a1a1aa] mb-2">Price Amount <span className="text-[#f87171]">*</span></label>
                                    <input
                                        id="priceAmount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.priceAmount}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('priceAmount')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="0.00"
                                        className={`w-full bg-[#09090b] border px-4 py-3 rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none transition-all ${focusedField === 'priceAmount' ? 'border-[#f59e0b] shadow-[0_0_0_1px_rgba(245,158,11,0.2)]' : 'border-[#3f3f46]'}`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="priceCurrency" className="block text-xs font-mono uppercase tracking-widest text-[#a1a1aa] mb-2">Currency</label>
                                    <div className="relative">
                                        <select
                                            id="priceCurrency"
                                            value={formData.priceCurrency}
                                            onChange={handleSelectChange}
                                            onFocus={() => setFocusedField('priceCurrency')}
                                            onBlur={() => setFocusedField(null)}
                                            className={`w-full bg-[#09090b] border px-4 py-3 rounded-xl text-sm text-[#fafafa] outline-none transition-all appearance-none cursor-pointer ${focusedField === 'priceCurrency' ? 'border-[#f59e0b] shadow-[0_0_0_1px_rgba(245,158,11,0.2)]' : 'border-[#3f3f46]'}`}
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="INR">INR (₹)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#a1a1aa]">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media Section */}
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 md:p-8">
                        <div className="flex justify-between items-end border-b border-[#27272a] pb-4 mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-[#fafafa]">Product Media</h2>
                                <p className="text-xs text-[#71717a] mt-1">Upload up to {MAX_IMAGES} high-quality images.</p>
                            </div>
                            <span className="text-xs font-mono text-[#52525b]">{images.length}/{MAX_IMAGES}</span>
                        </div>

                        {/* Dropzone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-[#f59e0b] bg-[#f59e0b]/5 scale-[0.98]' : images.length >= MAX_IMAGES ? 'border-[#27272a] bg-[#18181b] opacity-50 cursor-not-allowed' : 'border-[#3f3f46] hover:border-[#52525b] hover:bg-[#27272a]/50'}`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                disabled={images.length >= MAX_IMAGES}
                            />
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDragging ? 'bg-[#f59e0b] text-[#09090b]' : 'bg-[#27272a] text-[#a1a1aa]'}`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                            </div>
                            <p className="text-sm font-semibold text-[#fafafa] mb-1">
                                {images.length >= MAX_IMAGES ? 'Maximum images reached' : 'Click to upload or drag & drop'}
                            </p>
                            <p className="text-xs text-[#71717a]">JPEG, PNG or WEBP (Max 5MB each)</p>
                        </div>

                        {/* Image Previews */}
                        {images.length > 0 && (
                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-[#27272a] group bg-[#09090b]">
                                        <img src={img.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                                className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all cursor-pointer shadow-lg"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                        {index === 0 && (
                                            <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-[#f59e0b] text-[#09090b] px-2 py-0.5 rounded shadow">Main</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading || status.type === 'success'}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#f59e0b] text-[#09090b] font-bold text-sm py-4 rounded-xl hover:bg-[#d97706] transition-all shadow-[0_8px_24px_rgba(245,158,11,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? (
                                <><span className="w-4 h-4 border-2 border-[#09090b]/30 border-t-[#09090b] rounded-full animate-spin" /> Publishing…</>
                            ) : (
                                'Publish Listing'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/seller/dashboard')}
                            disabled={loading}
                            className="px-6 py-4 rounded-xl border border-[#3f3f46] text-[#fafafa] text-sm font-semibold hover:bg-[#27272a] transition-all disabled:opacity-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
