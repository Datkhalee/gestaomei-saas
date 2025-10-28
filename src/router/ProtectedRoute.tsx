import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTrialStatus } from '../hooks/useTrialStatus';
import Sidebar from '../components/layout/Sidebar';
import TrialBlocker from '../components/layout/TrialBlocker';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { isExpired } = useTrialStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    // Se trial expirou e não está na página de planos, redireciona
    if (user && isExpired && location.pathname !== '/meu-plano') {
      navigate('/meu-plano');
    }
  }, [user, loading, isExpired, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin"></i>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Bloqueio de Trial Expirado - só aparece se não estiver na página de planos */}
      {isExpired && location.pathname !== '/meu-plano' && <TrialBlocker />}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
          <h1 className="text-lg font-bold text-blue-600" style={{ fontFamily: '"Pacifico", serif' }}>
            FinanceMEI
          </h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
