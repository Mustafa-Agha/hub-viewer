import { render } from 'react-dom';
import App from 'App';

import 'scss/main.scss';

declare global {
  interface Window {
    ipcRenderer: any;
  }
}

render(<App />, document.getElementById('root'));
