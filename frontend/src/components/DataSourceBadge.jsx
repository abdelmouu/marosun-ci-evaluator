import { useTranslation } from 'react-i18next';

export default function DataSourceBadge({ source, error }) {
  const { t } = useTranslation();
  
  // En cas d'erreur totale (backend down), on le considère comme simulé dans le dashboard
  const isSimulated = source === 'simulated' || error;

  if (isSimulated) {
    return (
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-sm text-[11px] font-sans font-medium uppercase tracking-wider bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] cursor-help"
        title={t('data_source.simulated_tooltip')}
      >
        <span>{t('data_source.simulated')}</span>
      </div>
    );
  }

  if (source === 'live') {
    return (
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-sm text-[11px] font-sans font-medium uppercase tracking-wider bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] cursor-default"
        title={t('data_source.live_tooltip')}
      >
        <span>{t('data_source.live')}</span>
      </div>
    );
  }

  return null;
}