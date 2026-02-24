
import React from 'react';
import { PrivatePlacementData } from '../types';

interface PrivatePlacementTableProps {
  data: PrivatePlacementData[];
  onDelete: (id: string) => void;
}

const PrivatePlacementTable: React.FC<PrivatePlacementTableProps> = ({ data, onDelete }) => {
  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="bg-indigo-800 px-4 py-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-sm font-bold text-white">ניתוח הנפקות פרטיות</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-nowrap">
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">שם חברה</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">שם נייר ערך</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">מספר נייר ערך</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">תאריך מכרז</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">כמות מונפקת</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">מחיר הנפקה (₪)</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">הערות</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600 w-16">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 text-sm font-bold text-slate-900">{item.companyName || '-'}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{item.securityName || '-'}</td>
                <td className="px-4 py-4 text-sm text-slate-500 font-mono">{item.securityNumber || '-'}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{item.tenderDate || '-'}</td>
                <td className="px-4 py-4 text-sm text-slate-700 tabular-nums">{item.issuedQuantity || '-'}</td>
                <td className="px-4 py-4 text-sm text-indigo-600 font-bold tabular-nums">{item.issuePrice || '-'}</td>
                <td className="px-4 py-4 text-xs text-slate-500 max-w-[200px] break-words">{item.notes || '-'}</td>
                <td className="px-4 py-4 text-sm">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="מחק שורה"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrivatePlacementTable;
