import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Providers (Stores)
import { AppProvider, useAuthStore } from './stores';
import { ROLES, hasPermission } from './common/roles';

// Import Layout & Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GlobalTransactionModal from './components/GlobalTransactionModal';

// Import Pages
import Dashboard from './pages/Dashboard';
import Jars from './pages/Jars';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './pages/Login';

// =========================================================
// ROUTE GUARD THEO ROLE & AUTH (Role-based Guard)
// =========================================================
const RoleGuard = ({ children, requiredRole, requiredPermission }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole && user.role !== ROLES.ADMIN) {
        return <Navigate to="/" replace />;
    }

    if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// =========================================================
// MAIN APP CONTENT (Nằm trong AppProvider)
// =========================================================
function AppContent() {
    const { isAuthenticated } = useAuthStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <Router>
            {isAuthenticated && <Header />}
            <div className="d-flex">
                {isAuthenticated && <Sidebar />}

                <main 
                    className={`flex-grow-1 ${isAuthenticated ? 'p-4' : 'p-0'}`} 
                    style={{ 
                        marginLeft: isAuthenticated ? '240px' : '0', 
                        marginTop: isAuthenticated ? '60px' : '0', 
                        backgroundColor: isAuthenticated ? '#F9FAFB' : '#FFFFFF', 
                        minHeight: isAuthenticated ? 'calc(100vh - 60px)' : '100vh',
                        transition: 'all 0.2s' 
                    }}
                >
                    <Routes>
                        {/* Public Auth Routes */}
                        <Route 
                            path="/login" 
                            element={!isAuthenticated ? <Login initialMode="login" /> : <Navigate to="/" replace />} 
                        />
                        <Route 
                            path="/register" 
                            element={!isAuthenticated ? <Login initialMode="register" /> : <Navigate to="/" replace />} 
                        />
                        
                        {/* Protected Routes (Guard theo quyền) */}
                        <Route 
                            path="/" 
                            element={
                                <RoleGuard requiredPermission="view_dashboard">
                                    <Dashboard onOpenGlobalModal={() => setIsModalOpen(true)} />
                                </RoleGuard>
                            } 
                        />
                        <Route 
                            path="/jars" 
                            element={
                                <RoleGuard requiredPermission="manage_jars">
                                    <Jars />
                                </RoleGuard>
                            } 
                        />
                        <Route 
                            path="/history" 
                            element={
                                <RoleGuard requiredPermission="manage_transactions">
                                    <History />
                                </RoleGuard>
                            } 
                        />
                        <Route 
                            path="/settings" 
                            element={
                                <RoleGuard requiredPermission="update_profile">
                                    <Settings />
                                </RoleGuard>
                            } 
                        />

                        {/* Fallback route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>

            {/* Modal Thêm Giao Dịch Toàn Cục */}
            {isAuthenticated && (
                <GlobalTransactionModal 
                    show={isModalOpen} 
                    handleClose={() => setIsModalOpen(false)}
                    onSaveSuccess={() => {
                        // Tự động reload nhẹ trang hiện tại để các view đồng bộ
                        window.dispatchEvent(new Event('transaction-saved'));
                    }}
                />
            )}
        </Router>
    );
}

// Root App Component bọc AppProvider
function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}

export default App;