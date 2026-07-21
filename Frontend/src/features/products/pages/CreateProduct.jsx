import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { userProduct } from "../hooks/useProduct";
export function CreateProduct() {
    const { handleCreateProduct } = userProduct();
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
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };
    const handleSelectChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            priceCurrency: e.target.value,
        }));
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
        if (e.target.files) {
            processFiles(e.target.files);
        }
        // Reset so the same file can be selected again
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
        if (e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
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
            setStatus({
                type: "success",
                message: "Product created successfully!",
            });
            setTimeout(() => {
                navigate("/seller/dashboard");
            }, 1500);
        } catch (err) {
            console.error(err);
            setStatus({
                type: "error",
                message:
                    err.response?.data?.message ||
                    "Failed to create product. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };
    const emptySlots = Math.max(0, MAX_IMAGES - images.length);
    return (
        <div className="min-h-screen bg-[#0c1324] text-[#dce1fb] antialiased flex flex-col">
            {/* Top Bar */}
            <header className="w-full bg-[#0c1324]">
                <div className="flex justify-between items-center w-full px-4 md:px-12 py-4 max-w-[1280px] mx-auto">
                    <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#f59e0b] tracking-tighter">
                        ZENTRA
                    </div>
                    <nav className="hidden md:flex gap-6 items-center">
                        <Link
                            to="/seller/dashboard"
                            className="text-[#a08e7a] hover:text-[#f59e0b] transition-colors duration-300 font-['JetBrains_Mono'] text-xs font-medium tracking-[0.05em] uppercase"
                        >
                            DASHBOARD
                        </Link>
                        <Link
                            to="/seller/create-product"
                            className="text-[#f59e0b] font-bold font-['JetBrains_Mono'] text-xs tracking-[0.05em] uppercase"
                        >
                            LIST ITEM
                        </Link>
                    </nav>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-20 px-4 relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#f59e0b]/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="w-full max-w-2xl relative z-10">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="font-['Hanken_Grotesk'] text-[32px] md:text-[40px] font-semibold text-white tracking-tight leading-tight">
                            Add New Product
                        </h1>
                        <p className="text-[#a08e7a] font-['Inter'] text-base mt-2 opacity-80">
                            Fill in the details to list your product on Zentra
                        </p>
                    </div>
                    {/* Form Card */}
                    <div className="bg-[#151b2d]/70 backdrop-blur-[12px] border border-[#534434]/30 rounded-xl p-6 md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {/* Status Message */}
                            {status.message && (
                                <div
                                    className={`p-4 rounded-lg text-sm border transition-all duration-300 ${status.type === "success"
                                            ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                                            : "bg-rose-950/40 border-rose-500/30 text-rose-400"
                                        }`}
                                >
                                    {status.message}
                                </div>
                            )}
                            {/* Title */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="title"
                                    className={`font-['JetBrains_Mono'] text-xs font-medium tracking-[0.05em] uppercase transition-colors duration-200 ${focusedField === "title"
                                            ? "text-[#ffc174]"
                                            : "text-[#a08e7a]"
                                        }`}
                                >
                                    Product Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField("title")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="e.g. Premium Leather Chronograph"
                                    required
                                    className="w-full bg-[#070d1f] border border-[#2e3447] rounded-lg px-4 py-3 text-[#dce1fb] font-['Inter'] text-base placeholder:text-[#2e3447] transition-all duration-200 focus:outline-none focus:border-[#ffc174] focus:shadow-[0_0_0_1px_#ffc174]"
                                />
                            </div>
                            {/* Description */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="description"
                                    className={`font-['JetBrains_Mono'] text-xs font-medium tracking-[0.05em] uppercase transition-colors duration-200 ${focusedField === "description"
                                            ? "text-[#ffc174]"
                                            : "text-[#a08e7a]"
                                        }`}
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField("description")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Describe the product, its features, condition, and unique details..."
                                    rows={4}
                                    required
                                    className="w-full bg-[#070d1f] border border-[#2e3447] rounded-lg px-4 py-3 text-[#dce1fb] font-['Inter'] text-base placeholder:text-[#2e3447] transition-all duration-200 resize-none focus:outline-none focus:border-[#ffc174] focus:shadow-[0_0_0_1px_#ffc174]"
                                />
                            </div>
                            {/* Price Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <label
                                        htmlFor="priceAmount"
                                        className={`font-['JetBrains_Mono'] text-xs font-medium tracking-[0.05em] uppercase transition-colors duration-200 ${focusedField === "priceAmount"
                                                ? "text-[#ffc174]"
                                                : "text-[#a08e7a]"
                                            }`}
                                    >
                                        Price Amount
                                    </label>
                                    <input
                                        type="number"
                                        id="priceAmount"
                                        value={formData.priceAmount}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("priceAmount")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="0.00"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-[#070d1f] border border-[#2e3447] rounded-lg px-4 py-3 text-[#dce1fb] font-['Inter'] text-base placeholder:text-[#2e3447] transition-all duration-200 focus:outline-none focus:border-[#ffc174] focus:shadow-[0_0_0_1px_#ffc174]"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="priceCurrency"
                                        className={`font-['JetBrains_Mono'] text-xs font-medium tracking-[0.05em] uppercase transition-colors duration-200 ${focusedField === "priceCurrency"
                                                ? "text-[#ffc174]"
                                                : "text-[#a08e7a]"
                                            }`}
                                    >
                                        Currency
                                    </label>
                                    <select
                                        id="priceCurrency"
                                        value={formData.priceCurrency}
                                        onChange={handleSelectChange}
                                        onFocus={() => setFocusedField("priceCurrency")}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full bg-[#070d1f] border border-[#2e3447] rounded-lg px-4 py-3 text-[#dce1fb] font-['Inter'] text-base transition-all duration-200 appearance-none focus:outline-none focus:border-[#ffc174] focus:shadow-[0_0_0_1px_#ffc174]"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="INR">INR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                            </div>
                            {/* Image Upload */}
                            <div className="flex flex-col gap-4">
                                <label className="font-['JetBrains_Mono'] text-xs font-medium tracking-[0.05em] uppercase text-[#a08e7a]">
                                    Product Images (Max {MAX_IMAGES})
                                </label>
                                {/* Drop Zone */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`group relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${isDragging
                                            ? "border-[#ffc174] bg-[#ffc174]/5"
                                            : "border-[#2e3447] hover:border-[#ffc174]/50 bg-[#151b2d]/30"
                                        } ${images.length >= MAX_IMAGES
                                            ? "opacity-40 pointer-events-none"
                                            : ""
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        {/* Upload Icon */}
                                        <svg
                                            className={`w-10 h-10 transition-transform duration-200 ${isDragging
                                                    ? "text-[#ffc174] -translate-y-1"
                                                    : "text-[#ffc174] group-hover:-translate-y-1"
                                                }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                                            />
                                        </svg>
                                        <p className="text-[#dce1fb] font-['Inter'] text-base">
                                            Click or drag images to upload
                                        </p>
                                        <p className="text-[#a08e7a] text-xs">
                                            PNG, JPG or WebP up to 10MB
                                        </p>
                                    </div>
                                </div>
                                {/* Thumbnails Grid */}
                                {(images.length > 0 || emptySlots > 0) && (
                                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                        {/* Uploaded Images */}
                                        {images.map((img, index) => (
                                            <div
                                                key={index}
                                                className="aspect-square relative rounded-lg overflow-hidden border border-[#ffc174]/30 group/thumb"
                                            >
                                                <img
                                                    src={img.preview}
                                                    alt={`Product image ${index + 1}`}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                                <div
                                                    onClick={() => removeImage(index)}
                                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                                                >
                                                    <svg
                                                        className="w-4 h-4 text-white"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M6 18 18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Empty Placeholder Slots */}
                                        {Array.from({ length: Math.min(emptySlots, 3) }).map(
                                            (_, i) => (
                                                <div
                                                    key={`empty-${i}`}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="aspect-square bg-[#191f31] border border-[#2e3447] rounded-lg flex items-center justify-center opacity-40 hover:opacity-60 cursor-pointer transition-opacity duration-200"
                                                >
                                                    <svg
                                                        className="w-4 h-4 text-[#dce1fb]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 4.5v15m7.5-7.5h-15"
                                                        />
                                                    </svg>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#f59e0b] text-[#0c1324] hover:bg-[#ffc174] transition-all duration-300 py-4 px-6 rounded-lg font-bold tracking-wide uppercase flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                                >
                                    {loading ? (
                                        "Creating Product..."
                                    ) : (
                                        <>
                                            Create Product
                                            <svg
                                                className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                                />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            {/* Footer */}
            <footer className="w-full bg-[#0c1324] mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-12 py-6 max-w-[1280px] mx-auto gap-4">
                    <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#f59e0b]">
                        ZENTRA
                    </div>
                    <div className="flex gap-6">
                        <a
                            href="#"
                            className="text-[#a08e7a] font-['Inter'] text-base hover:text-[#ffc174] transition-colors duration-300 opacity-80 hover:opacity-100"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="text-[#a08e7a] font-['Inter'] text-base hover:text-[#ffc174] transition-colors duration-300 opacity-80 hover:opacity-100"
                        >
                            Terms of Service
                        </a>
                        <a
                            href="#"
                            className="text-[#a08e7a] font-['Inter'] text-base hover:text-[#ffc174] transition-colors duration-300 opacity-80 hover:opacity-100"
                        >
                            Contact Support
                        </a>
                    </div>
                    <div className="text-[#bcc7de] font-['Inter'] text-base opacity-60">
                        © 2026 Zentra Premium Systems.
                    </div>
                </div>
            </footer>
        </div>
    );
}
