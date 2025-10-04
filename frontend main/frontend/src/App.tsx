import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Chat } from './pages/Chat';
import { useAuthStore } from './stores/authStore';
import { apiService } from './services/api';

function App() {
    const { login, isAuthenticated } = useAuthStore();

    useEffect(() => {
        // Check for existing token on app load
        const token = localStorage.getItem('authToken');
        if (token && !isAuthenticated) {
            apiService.setToken(token);
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    login(user);
                } catch (error) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                }
            }
        }
    }, [login, isAuthenticated]);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={
                    <ProtectedRoute>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/analytics" element={<Analytics />} />
                                <Route path="/products" element={<Products />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/chat" element={<Chat />} />
                                <Route path="/settings" element={<Settings />} />
                            </Routes>
                        </Layout>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;