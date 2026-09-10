import { createRoot } from 'react-dom/client';
import Site from '../components/blue/site';
import '../app/globals.css';
import './fonts.css';

createRoot(document.getElementById('root')!).render(<Site />);
