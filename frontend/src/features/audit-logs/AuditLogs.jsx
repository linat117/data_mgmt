import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/auditService';
import { Search } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await getAuditLogs();
                setLogs(res.data.results || res.data);
            } catch (err) {
                console.error('Failed to fetch audit logs', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.table_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">User ID</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Action</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Table</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Record ID</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-3 py-3 whitespace-nowrap text-xs sm:text-sm text-neutral-500 sm:px-6 sm:py-4">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 sm:px-6 sm:py-4 truncate max-w-[120px] sm:max-w-none">
                                            {log.user || 'System/Unauth'}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm sm:px-6 sm:py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                                                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                                        log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                            'bg-neutral-100 text-neutral-800'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">
                                            <code className="bg-neutral-100 px-1 py-0.5 text-xs rounded text-pink-600">{log.table_name}</code>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 font-mono text-xs sm:px-6 sm:py-4">
                                            {log.record_id || '-'}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">
                                            {log.ip_address || '-'}
                                        </td>
                                    </tr>
                                ))}
                                {filteredLogs.length === 0 && (
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
            </div>
        </div>
    );
};
export default AuditLogs;
