export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
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
      Print Audit
    </button>
  );
}