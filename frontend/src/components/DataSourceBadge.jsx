import { useTranslation } from 'react-i18next';

export default function DataSourceBadge({ source, error }) {
  const { t } = useTranslation();
  
  // En cas d'erreur totale (backend down), on le considère comme simulé dans le dashboard
  const isSimulated = source === 'simulated' || error;

  if (isSimulated) {
    return (
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide bg-[rgba(192,57,43,0.08)] border border-[rgba(192,57,43,0.25)] text-[#C0392B] cursor-help transition-all duration-200"
        title={t('data_source.simulated_tooltip')}
      >
        <span>{t('data_source.simulated')}</span>
      </div>
    );
  }

  if (source === 'live') {
    return (
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-[#2D7D5B] bg-[rgba(45,125,91,0.08)] border border-[rgba(45,125,91,0.25)] cursor-default transition-all duration-200"
        title={t('data_source.live_tooltip')}
      >
        <span>{t('data_source.live')}</span>
      </div>
    );
  }

  return null;
}