import { render } from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import { createHashHistory } from 'history';

import { StoreContext } from 'hooks/context';
import { store } from 'hooks/stores';

import App from 'App';
import View from 'pages/View';
import Share from 'pages/Share';

import 'antd/dist/antd.css';
import 'scss/main.scss';

declare global {
  interface Window {
    ipcRenderer: any;
  }
}

export const history = createHashHistory();

render(
  <StoreContext.Provider value={store}>
    <Router history={history}>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/view/:secret" component={View} />
        <Route path="/share" component={Share} />
      </Switch>
    </Router>
  </StoreContext.Provider>,
  document.getElementById('root')
);
