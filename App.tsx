
import React, { useState, useRef } from 'react';
import { TenderData, ShelfOfferingData, PrivatePlacementData, AnalysisStatus } from './types';
import { analyzeTenderPDF, analyzeShelfOfferingPDF, analyzePrivatePlacementPDF } from './services/geminiService';
import ResultsTable from './components/ResultsTable';
import ShelfOfferingTable from './components/ShelfOfferingTable';
import PrivatePlacementTable from './components/PrivatePlacementTable';

const App: React.FC = () => {
  const [tenderItems, setTenderItems] = useState<TenderData[]>([]);
  const [shelfItems, setShelfItems] = useState<ShelfOfferingData[]>([]);
  const [placementItems, setPlacementItems] = useState<PrivatePlacementData[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  const tenderInputRef = useRef<HTMLInputElement>(null);
  const shelfInputRef = useRef<HTMLInputElement>(null);
  const placementInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleTenderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setStatus(AnalysisStatus.LOADING);
    setError(null);
    try {
      const newItems: TenderData[] = [];
      const fileArray = Array.from(files) as File[];
      for (const file of fileArray) {
        const base64 = await fileToBase64(file);
        const result = await analyzeTenderPDF(base64, file.name);
        result.securities.forEach(sec => {
          newItems.push({
            id: crypto.randomUUID(),
            fileName: file.name,
            ...sec,
            extractionTimestamp: Date.now(),
          });
        });
      }
      setTenderItems(prev => [...newItems, ...prev]);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      setError("שגיאה בניתוח תוצאות המכרז.");
      setStatus(AnalysisStatus.ERROR);
    } finally {
      if (tenderInputRef.current) tenderInputRef.current.value = '';
    }
  };

  const handleShelfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setStatus(AnalysisStatus.LOADING);
    setError(null);
    try {
      const newItems: ShelfOfferingData[] = [];
      const fileArray = Array.from(files) as File[];
      for (const file of fileArray) {
        const base64 = await fileToBase64(file);
        const result = await analyzeShelfOfferingPDF(base64, file.name);
        result.offerings.forEach(offering => {
          newItems.push({
            id: crypto.randomUUID(),
            fileName: file.name,
            ...offering,
            extractionTimestamp: Date.now(),
          });
        });
      }
      setShelfItems(prev => [...newItems, ...prev]);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      setError("שגיאה בניתוח דוח הצעת המדף.");
      setStatus(AnalysisStatus.ERROR);
    } finally {
      if (shelfInputRef.current) shelfInputRef.current.value = '';
    }
  };

  const handlePlacementUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setStatus(AnalysisStatus.LOADING);
    setError(null);
    try {
      const newItems: PrivatePlacementData[] = [];
      const fileArray = Array.from(files) as File[];
      for (const file of fileArray) {
        const base64 = await fileToBase64(file);
        const result = await analyzePrivatePlacementPDF(base64, file.name);
        result.placements.forEach(placement => {
          newItems.push({
            id: crypto.randomUUID(),
            fileName: file.name,
            ...placement,
            extractionTimestamp: Date.now(),
          });
        });
      }
      setPlacementItems(prev => [...newItems, ...prev]);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      setError("שגיאה בניתוח דוח הנפקה פרטית.");
      setStatus(AnalysisStatus.ERROR);
    } finally {
      if (placementInputRef.current) placementInputRef.current.value = '';
    }
  };

  const exportAllToCSV = () => {
    if (tenderItems.length === 0) return;
    const headers = ['שם קובץ', 'שם נייר ערך', 'לימיט סגירה', 'ביקוש יחידות', 'ביקוש שקלים', 'גיוס יחידות', 'גיוס שקלים'];
    const rows = tenderItems.map(item => [item.fileName, item.securityName, item.closingPrice, item.totalUnitsBid, item.totalValueBid, item.allocatedUnits, item.totalProceeds]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tender_analysis.csv");
    link.click();
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white font-bold">M</div>
            <h1 className="text-xl font-bold text-slate-800">סוכן ניתוח מכרזים</h1>
          </div>
          
          <div className="flex gap-3">
            {(tenderItems.length > 0 || shelfItems.length > 0 || placementItems.length > 0) && (
              <button onClick={exportAllToCSV} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">ייצוא CSV</button>
            )}
            <button
              onClick={() => placementInputRef.current?.click()}
              disabled={status === AnalysisStatus.LOADING}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              העלאת הנפקה פרטית
            </button>
            <button
              onClick={() => shelfInputRef.current?.click()}
              disabled={status === AnalysisStatus.LOADING}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              העלאת דוח הצעת מדף
            </button>
            <button
              onClick={() => tenderInputRef.current?.click()}
              disabled={status === AnalysisStatus.LOADING}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              העלאת תוצאות מכרז
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <input type="file" ref={tenderInputRef} onChange={handleTenderUpload} className="hidden" accept="application/pdf" multiple />
        <input type="file" ref={shelfInputRef} onChange={handleShelfUpload} className="hidden" accept="application/pdf" multiple />
        <input type="file" ref={placementInputRef} onChange={handlePlacementUpload} className="hidden" accept="application/pdf" multiple />

        {status === AnalysisStatus.LOADING && (
          <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <div className="text-blue-800 text-sm">מעבד ומנתח באמצעות AI...</div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-xl text-red-800 text-sm font-medium">{error}</div>
        )}

        {tenderItems.length === 0 && shelfItems.length === 0 && placementItems.length === 0 && status === AnalysisStatus.IDLE && (
          <div className="max-w-xl mx-auto text-center mt-20">
             <h2 className="text-3xl font-extrabold text-slate-800 mb-4">ברוך הבא לסוכן המכרזים</h2>
             <p className="text-slate-600 mb-8">בחר סוג קובץ להעלאה כדי להתחיל בניתוח הנתונים</p>
             <div className="grid grid-cols-3 gap-4">
                <button onClick={() => shelfInputRef.current?.click()} className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all shadow-sm group">
                   <div className="text-slate-400 group-hover:text-blue-500 mb-3 font-bold text-2xl">01</div>
                   <div className="font-bold text-slate-700">דוח הצעת מדף</div>
                   <div className="text-xs text-slate-400 mt-2">ניתוח עמלות, חתמים ותנאי הנפקה</div>
                </button>
                <button onClick={() => tenderInputRef.current?.click()} className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all shadow-sm group">
                   <div className="text-slate-400 group-hover:text-blue-500 mb-3 font-bold text-2xl">02</div>
                   <div className="font-bold text-slate-700">תוצאות מכרז</div>
                   <div className="text-xs text-slate-400 mt-2">חילוץ ביקושים, לימיט וגיוס בפועל</div>
                </button>
                <button onClick={() => placementInputRef.current?.click()} className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 transition-all shadow-sm group">
                   <div className="text-slate-400 group-hover:text-indigo-500 mb-3 font-bold text-2xl">03</div>
                   <div className="font-bold text-slate-700">הנפקה פרטית</div>
                   <div className="text-xs text-slate-400 mt-2">חילוץ פרטי הנפקה פרטית ומחיר</div>
                </button>
             </div>
          </div>
        )}

        {placementItems.length > 0 && (
          <div className="mb-12">
            <PrivatePlacementTable data={placementItems} onDelete={(id) => setPlacementItems(p => p.filter(i => i.id !== id))} />
          </div>
        )}

        {shelfItems.length > 0 && (
          <div className="mb-12">
            <ShelfOfferingTable data={shelfItems} onDelete={(id) => setShelfItems(p => p.filter(i => i.id !== id))} />
          </div>
        )}

        {tenderItems.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-700">תוצאות מכרז (ביצוע)</h2>
            </div>
            <ResultsTable data={tenderItems} onDelete={(id) => setTenderItems(p => p.filter(i => i.id !== id))} />
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-slate-400 font-medium">
          <div>Institutional Tender AI Agent</div>
          <div>מערכת ניתוח מכרזים © {new Date().getFullYear()}</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
