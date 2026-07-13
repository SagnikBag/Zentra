import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { register } from "../service/auth.api";
import { useAuth } from '../hooks/useAuth'

export function Register() {

  const { handleRegister } = useAuth()
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    contact: "",
    password: "",
    isSeller: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setStatus({ type: "", message: "" });

  //   try {
  //     const response = await register(formData);
  //     setStatus({
  //       type: "success",
  //       message: response.message || "Account created successfully! Welcome to Zentra.",
  //     });
  //     setTimeout(() => {
  //       navigate("/");
  //     }, 2000);
  //   } catch (err) {
  //     console.error(err);
  //     setStatus({
  //       type: "error",
  //       message:
  //         err.response?.data?.message ||
  //         "Registration failed. Please check details and try again.",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister({
      email: formData.email,
      password: formData.password,
      fullname: formData.fullname,
      isSeller: formData.isSeller,
      contact: formData.contact

    })
    setLoading(false);
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-[#0c1324] text-[#dce1fb] font-sans antialiased flex overflow-hidden">
      {/* LEFT SIDE: Immersive Brand Presentation (Desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative bg-[#070d1f] border-r border-[#2e3447]/40 flex-col justify-between p-16 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] rounded-full bg-[#f59e0b]/5 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#f59e0b]/5 blur-[100px]"></div>
        </div>

        {/* Brand identity header */}
        <div className="relative z-10">
          <div className="text-2xl font-bold text-[#f59e0b] tracking-widest uppercase">
            ZENTRA
          </div>
        </div>

        {/* Feature list / Centerpiece */}
        <div className="relative z-10 my-auto max-w-[480px]">
          <span className="text-[#f59e0b] text-xs font-mono uppercase tracking-widest bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-3 py-1 rounded-full">
            Private Beta Access
          </span>
          <h2 className="text-4xl xl:text-5xl font-semibold text-white tracking-tight mt-6 mb-8 leading-tight">
            Institutional-Grade Digital Trade Infrastructure.
          </h2>

          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium text-base">End-to-End Cryptographic Security</h4>
                <p className="text-[#a08e7a] text-sm mt-1 leading-relaxed">
                  Every interaction is sealed with enterprise-grade encryption.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium text-base">Real-time settlement pipelines</h4>
                <p className="text-[#a08e7a] text-sm mt-1 leading-relaxed">
                  Instant processing and unified analytics for all merchant channels.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium text-base">Compliance & Trust Framework</h4>
                <p className="text-[#a08e7a] text-sm mt-1 leading-relaxed">
                  Integrated merchant identity and automated KYC pipelines.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (Desktop only) */}
        <div className="relative z-10 text-xs text-[#a08e7a]/50 font-mono">
          SYSTEM STATUS: ONLINE // PROTOCOL V4.1
        </div>
      </div>

      {/* RIGHT SIDE: The Form Panel (Responsive across all screens) */}
      <div className="w-full lg:w-[55%] xl:w-[50%] flex flex-col justify-between min-h-screen relative p-6 md:p-12 overflow-y-auto">
        {/* Glow ambient background for mobile/tablet */}
        <div className="absolute inset-0 pointer-events-none z-0 lg:hidden">
          <div className="absolute top-[10%] right-[10%] w-[60vw] h-[60vw] rounded-full bg-[#f59e0b]/5 blur-[120px]"></div>
        </div>

        {/* Mobile Header */}
        <header className="relative z-10 w-full flex justify-between items-center mb-10 lg:hidden">
          <div className="text-xl font-bold text-[#f59e0b] tracking-widest uppercase">
            ZENTRA
          </div>
          <span className="text-[#a08e7a] text-xs font-mono uppercase tracking-widest">
            Premium Access
          </span>
        </header>

        {/* Form Container */}
        <div className="relative z-10 my-auto w-full max-w-[440px] mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
              Create an Account
            </h1>
            <p className="text-[#a08e7a] text-sm leading-relaxed">
              Fill out the details below to initialize your digital merchant credentials.
            </p>
          </div>

          <div className="bg-[#191f31]/40 backdrop-blur-xl border border-[#2e3447]/50 p-6 md:p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {status.message && (
                <div
                  className={`p-4 rounded-xl text-xs md:text-sm border ${status.type === "success"
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-950/40 border-rose-500/30 text-rose-400"
                    } transition-all duration-300`}
                >
                  {status.message}
                </div>
              )}

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullname" className="text-[10px] font-mono uppercase tracking-widest text-[#a08e7a]">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Evelyn Vane"
                  required
                  className="w-full bg-[#151b2d] border border-[#2e3447] focus:border-[#f59e0b] rounded-xl px-4 py-3 text-sm text-[#dce1fb] placeholder-[#2e3447] focus:outline-none focus:ring-1 focus:ring-[#f59e0b] transition-all duration-300"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[10px] font-mono uppercase tracking-widest text-[#a08e7a]">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.vane@zentra.com"
                  required
                  className="w-full bg-[#151b2d] border border-[#2e3447] focus:border-[#f59e0b] rounded-xl px-4 py-3 text-sm text-[#dce1fb] placeholder-[#2e3447] focus:outline-none focus:ring-1 focus:ring-[#f59e0b] transition-all duration-300"
                />
              </div>

              {/* Contact Number */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact" className="text-[10px] font-mono uppercase tracking-widest text-[#a08e7a]">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  required
                  className="w-full bg-[#151b2d] border border-[#2e3447] focus:border-[#f59e0b] rounded-xl px-4 py-3 text-sm text-[#dce1fb] placeholder-[#2e3447] focus:outline-none focus:ring-1 focus:ring-[#f59e0b] transition-all duration-300"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-[10px] font-mono uppercase tracking-widest text-[#a08e7a]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#151b2d] border border-[#2e3447] focus:border-[#f59e0b] rounded-xl px-4 py-3 pr-10 text-sm text-[#dce1fb] placeholder-[#2e3447] focus:outline-none focus:ring-1 focus:ring-[#f59e0b] transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2e3447] hover:text-[#f59e0b] transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-3.955-3.955-3.9-3.9m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Custom Toggle: Register as Seller */}
              <div className="flex items-center justify-between py-2 border-t border-[#2e3447]/40 mt-1">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">Register as Seller</span>
                  <span className="text-[11px] text-[#a08e7a]">Apply for merchant status</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="isSeller"
                    checked={formData.isSeller}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-[#2e3447] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#dce1fb] after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#f59e0b] peer-checked:after:bg-[#0c1324]"></div>
                </label>

              </div>

              <a href="/api/auth/google"
                className="text-sm font-medium text-white border border-[#2e3447]/40px-5 rounded-xl"
              >continue with google</a>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f59e0b] text-[#0c1324] font-semibold py-3.5 rounded-xl hover:bg-[#d97706] transition-all duration-300 transform active:scale-[0.98] mt-1 shadow-[0_10px_20px_rgba(245,158,11,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Initializing Profile..." : "Create Exclusive Account"}
              </button>
            </form>

            <div className="text-center mt-5">
              <p className="text-[#a08e7a] text-xs">
                Already have an account?{" "}
                <Link to="/" className="text-[#f59e0b] font-medium hover:underline ml-1">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-[#a08e7a]/60 pt-8 border-t border-[#2e3447]/20">
          <div>© 2026 Zentra Premium Systems.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#f59e0b] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#f59e0b] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#f59e0b] transition-colors">Support</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
