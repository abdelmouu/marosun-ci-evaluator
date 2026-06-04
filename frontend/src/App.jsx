import { AppProvider } from './context/AppProvider';
import { useAppContext } from './context/AppContext';
import Dashboard from './components/Dashboard';
import OnboardingWizard from './components/OnboardingWizard';
import TechnicalLoader from './components/TechnicalLoader';
import Footer from './components/Footer';

function AppRouter() {
  const { appPhase } = useAppContext();

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-canvas-from to-canvas-to text-text-body flex flex-col antialiased font-sans select-none">
      <div className="flex-1 flex">
        {appPhase === 'onboarding' && <OnboardingWizard />}
        {appPhase === 'loading' && <TechnicalLoader />}
        {appPhase === 'dashboard' && <Dashboard />}
      </div>
      <Footer />
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