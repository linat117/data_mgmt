import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, Calendar, FileText, Activity } from 'lucide-react';

const ExpandableFollowUpTable = ({ followups }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MENTOR_MOTHER':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!followups || followups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No follow-ups recorded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Client Follow-ups</h3>
        <p className="text-sm text-gray-600 mt-1">Click rows to expand details</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes Preview
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {followups.map((followup) => (
              <React.Fragment key={followup.id}>
                <tr 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleRow(followup.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-gray-400 hover:text-gray-600">
                      {expandedRows.has(followup.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(followup.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {followup.client_name || 'Unknown Client'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {followup.client_folder_number || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {followup.created_by_name || followup.created_by_email || 'Unknown'}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadgeColor(followup.created_by_role)}`}>
                          {followup.created_by_role || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {followup.notes?.substring(0, 80)}
                      {followup.notes?.length > 80 && '...'}
                    </div>
                  </td>
                </tr>
                
                {expandedRows.has(followup.id) && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 bg-gray-50 border-t border-b border-gray-200">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Follow-up Details
                          </h4>
                          <div className="text-xs text-gray-500">
                            Created: {formatDateTime(followup.created_at)}
                          </div>
                        </div>
                        
                        {/* Full Notes */}
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Notes
                          </h5>
                          <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                            {followup.notes || 'No notes provided'}
                          </div>
                        </div>
                        
                        {/* Structured Data */}
                        {followup.data && Object.keys(followup.data).length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                              <Activity className="w-4 h-4 mr-2" />
                              Structured Data
                            </h5>
                            <div className="bg-white p-4 rounded border border-gray-200">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(followup.data).map(([key, value]) => (
                                  <div key={key} className="text-sm">
                                    <span className="font-medium text-gray-600 capitalize">
                                      {key.replace(/_/g, ' ')}:
                                    </span>
                                    <div className="text-gray-900">
                                      {Array.isArray(value) ? (
                                        <ul className="list-disc list-inside">
                                          {value.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                          ))}
                                        </ul>
                                      ) : typeof value === 'object' ? (
                                        JSON.stringify(value, null, 2)
                                      ) : (
                                        String(value)
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {followups.length} follow-up{followups.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default ExpandableFollowUpTable;
