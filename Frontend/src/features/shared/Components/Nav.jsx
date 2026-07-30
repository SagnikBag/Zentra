import { Link } from 'react-router'
import { useSelector } from 'react-redux'

const Nav = () => {
    const user = useSelector(state => state.auth.user)
    return (
        <nav className="hidden md:flex gap-6 items-center">
            <Link
                to="/"
                className="text-[#f59e0b] font-bold font-['JetBrains_Mono'] text-xs tracking-[0.05em] uppercase flex items-center gap-1.5"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                MARKETPLACE
            </Link>
            {user && user.role === 'seller' && (
                <>
                    <Link
                        to="/seller/dashboard"
                        className="text-[#a08e7a] hover:text-[#f59e0b] transition-colors duration-300 font-['JetBrains_Mono'] text-xs font-medium tracking-[0.05em] uppercase"
                    >
                        DASHBOARD
                    </Link>
                    <Link
                        to="/seller/create-product"
                        className="text-[#a08e7a] hover:text-[#f59e0b] transition-colors duration-300 font-['JetBrains_Mono'] text-xs font-medium tracking-[0.05em] uppercase"
                    >
                        ADD PRODUCT
                    </Link>
                </>
            )}
        </nav>
    )
}

export default Nav