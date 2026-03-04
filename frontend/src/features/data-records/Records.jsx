import React, { useRef } from 'react';
import { NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ClientRegistrations from './ClientRegistrations';
import WeeklyPlans from './WeeklyPlans';
import MCHReports from './MCHReports';

const Tabs = () => (
    <nav className="flex overflow-x-auto gap-2 mb-6 border-b border-neutral-200 pb-2 -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        <NavLink
            to="/records/clients"
            className={({ isActive }) =>
                `flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${isActive ? 'bg-primary-100 text-primary-700' : 'text-neutral-500 hover:text-neutral-700'}`
            }
        >
            Client Registrations
        </NavLink>
        <NavLink
            to="/records/reports"
            className={({ isActive }) =>
                `flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${isActive ? 'bg-primary-100 text-primary-700' : 'text-neutral-500 hover:text-neutral-700'}`
            }
        >
            MCH Reports
        </NavLink>
        <NavLink
            to="/records/plans"
            className={({ isActive }) =>
                `flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${isActive ? 'bg-primary-100 text-primary-700' : 'text-neutral-500 hover:text-neutral-700'}`
            }
        >
            Weekly Plans
        </NavLink>
    </nav>
);

const PlaceholderTable = ({ title }) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
        <h3 className="text-lg leading-6 font-medium text-neutral-900 mb-4">{title} list</h3>
        <div className="text-sm text-neutral-500 italic">No {title.toLowerCase()} found or table rendering in progress.</div>
    </div>
);

const Records = () => {
    const location = useLocation();
    const openModalRef = useRef(null);

    const handleAddRecord = () => {
        // Only allow adding through the single unified Client Registration form.
        if (location.pathname.includes('/records/clients') && openModalRef.current) {
            openModalRef.current();
        }
    };

    return (
        <div className="min-w-0">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-semibold text-neutral-900 sm:text-2xl">Data Records Management</h1>
                    <p className="mt-1 sm:mt-2 text-sm text-neutral-700">
                        View, filter, and manage Mentor Mother data, client registrations, and weekly plans.
                    </p>
                </div>
                {location.pathname.includes('/records/clients') && (
                    <div className="flex-shrink-0">
                        <button
                            type="button"
                            onClick={handleAddRecord}
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                            <Plus className="-ml-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                            Add Record
                        </button>
                    </div>
                )}
            </div>

            <Tabs />

            <Routes>
                <Route path="/" element={<Navigate to="clients" replace />} />
                <Route path="clients" element={<ClientRegistrations openModalRef={openModalRef} />} />
                <Route path="reports" element={<MCHReports openModalRef={openModalRef} />} />
                <Route path="plans" element={<WeeklyPlans openModalRef={openModalRef} />} />
            </Routes>
        </div>
    );
};
export default Records;
