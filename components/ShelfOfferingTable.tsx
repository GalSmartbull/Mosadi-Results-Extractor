
import React from 'react';
import { ShelfOfferingData, WinnerRow } from '../types';

interface ShelfOfferingTableProps {
  data: ShelfOfferingData[];
  onDelete: (id: string) => void;
}

const ShelfOfferingTable: React.FC<ShelfOfferingTableProps> = ({ data, onDelete }) => {
  if (data.length === 0) return null;

  const downloadWinnersCSV = (securityName: string, winners: WinnerRow[]) => {
    if (!winners || winners.length === 0) {
      alert("לא נמצאו נתוני זוכים עבור הנפקה זו");
      return;
    }

    // הקפדה על 5 העמודות המבוקשות: שם, כמות, לימיט, סוג, הערות
    const headers = ['שם המזמין', 'כמות יחידות שזכו', 'לימיט הצעה', 'סוג משקיע', 'הערות'];
    const rows = winners.map(w => [
      `"${(w.investorName || '').replace(/"/g, '""')}"`,
      `"${(w.allocatedQuantity || '').replace(/"/g, '""')}"`,
      `"${(w.bidLimit || '').replace(/"/g, '""')}"`,
      `"${(w.investorType || '').replace(/"/g, '""')}"`,
      `"${(w.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `winners_${securityName.replace(/\s+/g, '_')}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-sm font-bold text-white">ניתוח דוחות הצעת מדף (תנאי הנפקה)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[2000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-nowrap">
              <th className="px-3 py-3 text-xs font-semibold text-slate-600">שם נייר ערך</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600">תאריך מכרז</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600">טבלת זוכים</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600">רכז</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600">יועץ הנפקה</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600">מפיץ מוביל</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600">מפיצי משנה</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600">כמות מוצעת</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600">לימיט פתיחה</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600 bg-blue-50">עמלת הפצה</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600 bg-blue-50">עמלת הצלחה</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600 bg-blue-50">עמלת חיתום</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600 bg-blue-50">עמלת ייעוץ</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600 bg-blue-50">עמלת ריכוז</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600 bg-orange-50">עמלות - הערות</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-600 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-3 text-sm font-bold text-slate-900">{item.securityName || '-'}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{item.publicTenderDate || '-'}</td>
                <td className="px-3 py-3 text-sm">
                  {item.winnersTable && item.winnersTable.length > 0 ? (
                    <button
                      onClick={() => downloadWinnersCSV(item.securityName, item.winnersTable)}
                      className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-bold hover:bg-green-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      CSV זוכים
                    </button>
                  ) : (
                    <span className="text-slate-300 text-xs">-</span>
                  )}
                </td>
                <td className="px-3 py-3 text-sm text-slate-700">{item.offeringCoordinator || '-'}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{item.offeringAdvisor || '-'}</td>
                <td className="px-3 py-3 text-sm text-slate-700 font-medium">{item.leadUnderwriter || '-'}</td>
                <td className="px-3 py-3 text-sm text-slate-500 text-xs max-w-[150px] truncate" title={item.subDistributors}>{item.subDistributors || '-'}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{item.offeredQuantity || '-'}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{item.openingLimit || '-'}</td>
                <td className="px-3 py-3 text-sm text-blue-800 font-medium bg-blue-50/30">{item.distributionFee || ''}</td>
                <td className="px-3 py-3 text-sm text-blue-800 font-medium bg-blue-50/30">{item.successFee || ''}</td>
                <td className="px-3 py-3 text-sm text-blue-800 font-medium bg-blue-50/30">{item.underwritingFee || ''}</td>
                <td className="px-3 py-3 text-sm text-blue-800 font-medium bg-blue-50/30">{item.advisoryFee || ''}</td>
                <td className="px-3 py-3 text-sm text-blue-800 font-medium bg-blue-50/30 tabular-nums">{item.concentrationFee || ''}</td>
                <td className="px-3 py-3 text-xs text-orange-800 bg-orange-50/30 max-w-[200px] break-words">{item.feesNotes || ''}</td>
                <td className="px-3 py-3">
                  <button onClick={() => onDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

export default ShelfOfferingTable;
