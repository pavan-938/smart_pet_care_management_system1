import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MyPets from './pages/MyPets'
import BookAppointment from './pages/BookAppointment'
import Doctors from './pages/Doctors'
import Services from './pages/Services'
import Payments from './pages/Payments'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import PetHealth from './pages/PetHealth'
import Marketplace from './pages/Marketplace'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import DoctorDashboard from './pages/DoctorDashboard'
import SymptomChecker from './pages/SymptomChecker'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminDoctorApprovals from './pages/admin/AdminDoctorApprovals'
import AdminUserManagement from './pages/admin/AdminUserManagement'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminMarketplace from './pages/admin/AdminMarketplace'
import AdminOrders from './pages/admin/AdminOrders'
import AdminFinancials from './pages/admin/AdminFinancials'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminModeration from './pages/admin/AdminModeration'
import AdminSupport from './pages/admin/AdminSupport'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'
import AdminSettings from './pages/admin/AdminSettings'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './App.css'

function AppContent() {
    const location = useLocation()
    const isAdminRoute = location.pathname.startsWith('/admin')

    return (
        <div className="app">
            {!isAdminRoute && <Navbar />}
            <div className={isAdminRoute ? 'admin-wrapper' : 'main-content'}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/symptom-checker" element={<SymptomChecker />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/my-pets" element={<MyPets />} />
                        <Route path="/pet-health/:id" element={<PetHealth />} />
                        <Route path="/book-appointment" element={<BookAppointment />} />
                        <Route path="/payments" element={<Payments />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

                        <Route element={<AdminRoute />}>
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<AdminOverview />} />
                                <Route path="users" element={<AdminUserManagement />} />
                                <Route path="doctor" element={<AdminDoctorApprovals />} />
                                <Route path="appointments" element={<AdminAppointments />} />
                                <Route path="marketplace" element={<AdminMarketplace />} />
                                <Route path="orders" element={<AdminOrders />} />
                                <Route path="financials" element={<AdminFinancials />} />
                                <Route path="analytics" element={<AdminAnalytics />} />
                                <Route path="moderation" element={<AdminModeration />} />
                                <Route path="support" element={<AdminSupport />} />
                                <Route path="audit" element={<AdminAuditLogs />} />
                                <Route path="settings" element={<AdminSettings />} />
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </div>
        </div>
    )
}

function App() {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <ThemeProvider>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </ThemeProvider>
        </GoogleOAuthProvider>
    )
}


export default App
