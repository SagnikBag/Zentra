import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

// const Protected = ({ role }) => {
//     const { user, loading } = useSelector((state) => state.auth);

//     // Wait until authentication is checked
//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     // Not logged in
//     if (!user) {
//         return <Navigate to="/login" replace />;
//     }

//     // Role protection
//     if (role && user.role !== role) {
//         return <Navigate to="/" replace />;
//     }

//     return <Outlet />;
// };

const Protected = ({ role }) => {
    const { user, loading } = useSelector((state) => state.auth);

    console.log("Protected user:", user);
    console.log("Required role:", role);
    console.log("User role:", user?.role);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        console.log("ROLE MISMATCH");
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default Protected;