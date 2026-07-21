import { setError, setLoading, setUser } from "../state/auth.slice";
import { getme, login, register, logout } from "../service/auth.api";
import { useDispatch } from "react-redux";

export const useAuth = () => {

   const dispatch = useDispatch()

   async function handleRegister({ email, contact, password, fullname, isSeller = false }) {

      const data = await register({ email, contact, password, fullname, isSeller })

      dispatch(setUser(data.user));

      return data.user
   }

   async function handleLogin({ email, password }) {

      const data = await login({ email, password })

      dispatch(setUser(data))

      return data.user

   }
   async function handleGetme() {
      try {
         dispatch(setLoading(true))
         const data = await getme()
         dispatch(setUser(data))

      } catch (error) {
         console.log(error);

      }
      finally {
         dispatch(setLoading(false))
      }

   }

   async function handleLogout() {
      try {
         await logout()
      } catch (error) {
         console.log("Logout API error:", error);
      } finally {
         dispatch(setUser(null));
      }
   }

   return { handleRegister, handleLogin, handleGetme, handleLogout }
}