import { useTranslation } from 'react-i18next';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function PdfButton({ isPdfGenerating, setIsPdfGenerating }) {
  const { t } = useTranslation();

  const handleDownload = () => {
    // 1. Trigger state to render report off-screen
    setIsPdfGenerating(true);

    // 2. Allow React to re-render and browser to paint before capturing
    setTimeout(() => {
      const element = document.getElementById('executive-report-content');
      if (!element) {
        setIsPdfGenerating(false);
        return;
      }

      toPng(element, { 
        quality: 0.98, 
        backgroundColor: '#ffffff', 
        pixelRatio: 2 
      })
        .then((dataUrl) => {
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
          
          let heightLeft = imgHeight;
          let position = 0;

          // Add first page
          pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pageHeight;

          // Add subsequent pages if content overflows
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save('MaroSun_Audit.pdf');
        })
        .catch((err) => {
          console.error('PDF Generation Error:', err);
        })
        .finally(() => {
          setIsPdfGenerating(false);
        });
    }, 500); // 500ms timeout ensures proper DOM layout and React rendering
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isPdfGenerating}
      className={`bg-transparent border-2 border-[#1A2540] text-[#1A2540] text-sm font-semibold py-2 px-5 rounded-[10px] shadow-sm flex items-center gap-2 transition-all duration-150 ease-out ${
        isPdfGenerating 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-[#1A2540] hover:text-white hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0'
      }`}
    >
      {isPdfGenerating ? (
        <svg className="w-4 h-4 animate-spin text-[#1A2540]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg 
          className="w-4 h-4" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
      {isPdfGenerating ? t('report.generating_pdf', 'Generating...') : t('report.download_pdf', 'Download PDF')}
    </button>
  );
}
