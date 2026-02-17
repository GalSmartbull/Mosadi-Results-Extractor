
import React from 'react';
import { TenderData } from '../types';

interface ResultsTableProps {
  data: TenderData[];
  onDelete: (id: string) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data, onDelete }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('he-IL').format(num);
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="text-slate-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-700">אין נתונים להצגה</h3>
        <p className="text-slate-500">העלה קבצי PDF של תוצאות מכרז כדי להתחיל בניתוח</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-nowrap">
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">שם קובץ</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">שם נייר ערך</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">לימיט סגירה</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">ביקוש (יח')</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">ביקוש (₪)</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">גיוס (יח')</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600">גיוס (₪)</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-600 w-16">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 text-sm text-slate-500 truncate max-w-[150px]" title={item.fileName}>
                  {item.fileName}
                </td>
                <td className="px-4 py-4 text-sm font-bold text-slate-900 truncate max-w-[200px]" title={item.securityName}>
                  {item.securityName}
                </td>
                <td className="px-4 py-4 text-sm text-slate-700 font-mono tabular-nums">
                  {item.closingPrice > 0 ? item.closingPrice.toLocaleString('he-IL', { maximumFractionDigits: 4 }) : '-'}
                </td>
                <td className="px-4 py-4 text-sm text-slate-700 tabular-nums">
                  {item.totalUnitsBid > 0 ? formatNumber(item.totalUnitsBid) : '-'}
                </td>
                <td className="px-4 py-4 text-sm text-slate-700 tabular-nums">
                  {item.totalValueBid > 0 ? formatNumber(item.totalValueBid) : ''}
                </td>
                <td className="px-4 py-4 text-sm text-slate-700 tabular-nums">
                  {item.allocatedUnits > 0 ? formatNumber(item.allocatedUnits) : '-'}
                </td>
                <td className="px-4 py-4 text-sm text-slate-700 tabular-nums font-semibold text-blue-600">
                  {item.totalProceeds > 0 ? formatNumber(item.totalProceeds) : '-'}
                </td>
                <td className="px-4 py-4 text-sm">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
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

export default ResultsTable;
