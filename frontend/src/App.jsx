import { AppProvider } from './context/AppProvider';
import { useAppContext } from './context/AppContext';
import Dashboard from './components/Dashboard';
import OnboardingWizard from './components/OnboardingWizard';
import TechnicalLoader from './components/TechnicalLoader';

function AppRouter() {
  const { appPhase } = useAppContext();

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-canvas-from to-canvas-to text-text-body flex overflow-hidden antialiased font-sans select-none">
      {appPhase === 'onboarding' && <OnboardingWizard />}
      {appPhase === 'loading' && <TechnicalLoader />}
      {appPhase === 'dashboard' && <Dashboard />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}