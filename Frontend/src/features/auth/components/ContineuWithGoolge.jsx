import React from "react";

export default function ContineuWithGoolge() {
    return (
        <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-3 w-full h-11 px-4 bg-white hover:bg-[#f8f9fa] active:bg-[#f1f3f4] border border-[#dadce0] rounded-xl transition-all duration-200 shadow-sm"
            style={{ fontFamily: "Roboto, Arial, sans-serif" }}
        >
            <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.41-4.69H24v8.87h12.66c-.55 2.94-2.2 5.43-4.7 7.1l7.3 5.66c4.27-3.93 6.74-9.72 6.74-16.94z" />
                    <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.3-5.66c-2.03 1.36-4.63 2.17-8.59 2.17-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
            </div>
            <span className="text-sm font-medium text-[#3c4043] tracking-wide select-none">
                Continue with Google
            </span>
        </a>
    );
}