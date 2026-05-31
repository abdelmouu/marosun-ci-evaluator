import { useTranslation } from 'react-i18next';

export default function PrintButton() {
  const { t } = useTranslation();

  async function handlePrint() {
    // 1. Inject a one-time <style> tag that sets the print document title
    //    so the browser's Save As dialog defaults to a clean filename.
    const style = document.createElement('style');
    style.id = '__pdf-title-override';
    style.textContent = `@media print { @page { size: A4 portrait; margin: 10mm; } }`;
    document.head.appendChild(style);

    // 2. Set document.title temporarily so the browser names the PDF file correctly
    const originalTitle = document.title;
    document.title = 'MaroSun_Rapport_Audit';

    window.print();

    // 3. Restore title and remove style after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
      const el = document.getElementById('__pdf-title-override');
      if (el) el.remove();
    }, 1000);
  }
  
  return (
    <button
      onClick={handlePrint}
      className="bg-[#E8A020] text-white text-sm font-semibold py-2.5 px-5 rounded-[10px] shadow-[0_2px_8px_rgba(232,160,32,0.30)] flex items-center gap-2 transition-all duration-150 ease-out hover:bg-[#C4851A] hover:shadow-[0_4px_16px_rgba(232,160,32,0.45)] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 active:shadow-[0_1px_4px_rgba(232,160,32,0.25)]"
    >
      <svg 
        className="w-4 h-4 text-white" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" rx="1" />
        <line x1="10" y1="18" x2="14" y2="18" />
      </svg>
      {t('report.print_or_pdf')}
    </button>
  );
}