import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPreventRefresh } from './utils/preventRefresh'

// Initialize the utility to prevent page refreshes when clicking links inside forms
initPreventRefresh();

createRoot(document.getElementById("root")!).render(<App />);
