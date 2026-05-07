import { useState } from 'react';
import { MainView } from './views/MainView';
import { PinModal } from './components/PinModal';

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <>
      {!isUnlocked && <PinModal onUnlock={() => setIsUnlocked(true)} />}
      <MainView />
    </>
  );
}

export default App;
