import React, { useState, useEffect, useMemo } from 'react';
import { getAuditLogs } from '../../services/auditService';
import { Search } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await getAuditLogs();
                console.log('Audit logs data:', res.data); // Debug log
                setLogs(res.data.results || res.data);
            } catch (err) {
                console.error('Failed to fetch audit logs', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const term = searchTerm.toLowerCase();
        return (
            (log.action && log.action.toLowerCase().includes(term)) ||
            (log.table_name && log.table_name.toLowerCase().includes(term)) ||
            (log.user_display && log.user_display.toLowerCase().includes(term)) ||
            (log.description && log.description.toLowerCase().includes(term))
        );
    });

    // Pagination
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredLogs.slice(startIndex, endIndex);
    }, [filteredLogs, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="flex flex-col h-full min-w-0">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-neutral-900 sm:text-2xl">Audit Logs</h1>
                    <p className="mt-1 sm:mt-2 text-sm text-neutral-700">Review system activity, data changes, and access logs securely.</p>
                </div>
            </div>

            <div className="mb-6 w-full max-w-lg">
                <label htmlFor="search" className="sr-only">Search logs</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                        id="search"
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:placeholder-neutral-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Filter by action or table name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-white shadow overflow-hidden sm:rounded-md flex flex-col">
                {loading ? (
                    <div className="p-6 sm:p-10 text-center text-neutral-500">Loading audit history...</div>
                ) : (
                    <div className="overflow-x-auto flex-1 -mx-3 sm:mx-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">When</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Who</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">What happened</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {paginatedLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-3 py-3 whitespace-nowrap text-xs sm:text-sm text-neutral-500 sm:px-6 sm:py-4">
                                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 sm:px-6 sm:py-4 truncate max-w-[160px] sm:max-w-none">
                                            {log.user_display || 'System'}
                                        </td>
                                        <td className="px-3 py-3 whitespace-normal text-sm text-neutral-700 sm:px-6 sm:py-4">
                                            {console.log('Log entry:', log)} {/* Debug log */}
                                            {log.description || (
                                                <>
                                                    <span className="font-semibold">{log.action}</span>{' '}
                                                    on <span className="font-mono text-xs">{log.table_name}</span>
                                                    {log.record_id && (
                                                        <span className="text-xs text-neutral-500">
                                                            {' '}(ID: {log.record_id.substring(0, 8)}...)
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {paginatedLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-3 py-10 text-center text-neutral-500 sm:px-6">
                                            No matching audit logs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredLogs.length}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>
        </div>
    );
};
export default AuditLogs;
