import { render } from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import App from 'App';
import ScreenCast from 'ScreenCast'

import 'scss/main.scss';

declare global {
  interface Window {
    ipcRenderer: any;
  }
}

render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={App} />
      <Route exact path="/cast" component={ScreenCast} />
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);
