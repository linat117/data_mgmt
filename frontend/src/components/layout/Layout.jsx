import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Users, FileText, Activity, LogOut, Menu, X, User } from 'lucide-react';

const SidebarLink = ({ to, icon, label, currentPath, onClick }) => {
    const isActive = currentPath === to || currentPath.startsWith(`${to}/`);
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`${isActive
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors`}
        >
            {React.cloneElement(icon, {
                className: `${isActive ? 'text-neutral-300' : 'text-neutral-400 group-hover:text-neutral-300'} mr-4 flex-shrink-0 h-6 w-6`
            })}
            {label}
        </Link>
    );
};

const Layout = () => {
    const { user, logout, roleLabel } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeSidebar = () => setSidebarOpen(false);

    useEffect(() => {
        closeSidebar();
    }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => { if (window.innerWidth >= 768) setSidebarOpen(false); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const canManageUsers = user?.role === 'SUPER_ADMIN' || user?.role === 'PM';
    const canViewAudit = user?.role === 'SUPER_ADMIN';

    const sidebarContent = (
        <div className="flex flex-col h-0 flex-1 bg-neutral-900">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                    <span className="text-white text-xl font-bold tracking-wider">DataM</span>
                </div>
                <nav className="mt-8 flex-1 px-2 space-y-2">
                    <SidebarLink to="/dashboard" icon={<LayoutDashboard />} label="Dashboard" currentPath={location.pathname} onClick={closeSidebar} />
                    <SidebarLink to="/records" icon={<FileText />} label="Data Records" currentPath={location.pathname} onClick={closeSidebar} />
                    <SidebarLink to="/profile" icon={<User />} label="Profile" currentPath={location.pathname} onClick={closeSidebar} />
                    {canManageUsers && (
                        <SidebarLink to="/users" icon={<Users />} label="Users" currentPath={location.pathname} onClick={closeSidebar} />
                    )}
                    {canViewAudit && (
                        <SidebarLink to="/audit-logs" icon={<Activity />} label="Audit Logs" currentPath={location.pathname} onClick={closeSidebar} />
                    )}
                </nav>
            </div>
            <div className="flex-shrink-0 flex bg-neutral-800 p-4">
                <div className="flex-shrink-0 w-full group block">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                            <p className="text-xs font-medium text-neutral-300 group-hover:text-white mt-1">
                                {roleLabel()}
                            </p>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Link 
                                to="/profile" 
                                className="p-2 text-neutral-400 hover:text-white transition-colors flex-shrink-0" 
                                title="Profile"
                                onClick={closeSidebar}
                            >
                                <User className="h-5 w-5" />
                            </Link>
                            <button onClick={handleLogout} className="p-2 text-neutral-400 hover:text-white transition-colors flex-shrink-0" title="Logout">
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen flex overflow-hidden bg-neutral-100">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-neutral-900/50 md:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar: mobile drawer / desktop fixed */}
            <div
                className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 flex-shrink-0 transform transition-transform duration-200 ease-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col flex-1">
                    <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-700">
                        <span className="text-white text-xl font-bold tracking-wider">DataM</span>
                        <button onClick={closeSidebar} className="p-2 text-neutral-400 hover:text-white rounded-md" aria-label="Close menu">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    {sidebarContent}
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <div className="md:hidden flex items-center justify-between bg-white border-b border-neutral-200 flex-shrink-0">
                    <span className="text-neutral-900 font-bold px-4 py-3">DataM</span>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="h-12 w-12 inline-flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        aria-label="Open menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
                <main className="flex-1 relative z-0 overflow-y-auto overflow-x-hidden focus:outline-none">
                    <div className="py-4 px-3 sm:py-6 sm:px-6 md:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
