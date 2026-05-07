import { useState } from 'react';
import { MainView } from './views/MainView';
import { PinModal } from './components/PinModal';
import { ShortBreakOverlay } from './components/ShortBreakOverlay';

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <>
      <ShortBreakOverlay />
      {!isUnlocked && <PinModal onUnlock={() => setIsUnlocked(true)} />}
      <MainView />
    </>
  );
}

export default App;
