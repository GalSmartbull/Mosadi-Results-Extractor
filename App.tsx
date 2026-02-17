
import React, { useState, useCallback, useRef } from 'react';
import { TenderData, AnalysisStatus } from './types';
import { analyzeTenderPDF } from './services/geminiService';
import ResultsTable from './components/ResultsTable';

const App: React.FC = () => {
  const [items, setItems] = useState<TenderData[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setStatus(AnalysisStatus.LOADING);
    setError(null);

    const newItems: TenderData[] = [];
    
    try {
      const filesArray = Array.from(files) as File[];
      for (const file of filesArray) {
        if (file.type !== 'application/pdf') {
          console.warn(`Skipping non-PDF file: ${file.name}`);
          continue;
        }

        const base64 = await fileToBase64(file);
        const result = await analyzeTenderPDF(base64, file.name);

        // Map the array of securities from the AI response into our table data structure
        result.securities.forEach(sec => {
          newItems.push({
            id: crypto.randomUUID(),
            fileName: file.name,
            securityName: sec.securityName,
            totalUnitsBid: sec.totalUnitsBid,
            totalValueBid: sec.totalValueBid,
            closingPrice: sec.closingPrice,
            allocatedUnits: sec.allocatedUnits,
            totalProceeds: sec.totalProceeds,
            extractionTimestamp: Date.now(),
          });
        });
      }

      setItems((prev) => [...newItems, ...prev]);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "שגיאה בניתוח הקובץ. וודא שהקובץ תקין ושיש חיבור לאינטרנט.");
      setStatus(AnalysisStatus.ERROR);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter(item => item.id !== id));
  };

  const exportToCSV = () => {
    if (items.length === 0) return;
    
    const headers = ['שם קובץ', 'שם נייר ערך', 'לימיט סגירה', 'ביקוש יחידות', 'ביקוש שקלים', 'גיוס יחידות', 'גיוס שקלים'];
    const rows = items.map(item => [
      item.fileName,
      item.securityName,
      item.closingPrice || '',
      item.totalUnitsBid || '',
      item.totalValueBid || '',
      item.allocatedUnits || '',
      item.totalProceeds || ''
    ]);

    const csvContent = [
      '\uFEFF' + headers.join(','), // BOM for Hebrew support in Excel
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tender_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800">סוכן ניתוח מכרזים מוסדיים</h1>
          </div>
          
          <div className="flex gap-2">
            {items.length > 0 && (
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                ייצוא CSV
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={status === AnalysisStatus.LOADING}
              className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              הוסף דוח PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept="application/pdf"
          multiple
        />

        {/* Status Messaging */}
        {status === AnalysisStatus.LOADING && (
          <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <div className="text-blue-800 text-sm">מעבד ומנתח את הקבצים באמצעות AI...</div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-4">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-red-800 text-sm font-medium">{error}</div>
          </div>
        )}

        {/* Welcome Section / empty state */}
        {items.length === 0 && status === AnalysisStatus.IDLE && (
          <div className="max-w-2xl mx-auto text-center mt-12">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">ניתוח אוטומטי של תוצאות מכרזים</h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                העלה קבצי PDF שהורדו מאתר הבורסה (מאיה) והסוכן יחלץ עבורך באופן אוטומטי את הביקושים, לימיט הסגירה והיקפי הגיוס בצורה מובנית.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200"
              >
                לחץ כאן להעלאת קובץ ראשון
              </button>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'דיוק מירבי', desc: 'המרת מיליוני ש"ח למספרים מלאים' },
                { title: 'הבחנה חכמה', desc: 'הפרדה לוגית בין מכרזי ריבית למחיר' },
                { title: 'תמיכה במולטי-סדרות', desc: 'זיהוי מספר ניירות ערך באותו דוח' }
              ].map((feature, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        {(items.length > 0 || status === AnalysisStatus.LOADING) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-700">נתונים שחולצו ({items.length})</h2>
            </div>
            <ResultsTable data={items} onDelete={handleDelete} />
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-slate-400">
          <div>Powered by Gemini AI Engine</div>
          <div>מערכת ניתוח מכרזים © {new Date().getFullYear()}</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
