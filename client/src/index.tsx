import { render } from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { StoreContext } from 'hooks/context';
import { store } from 'hooks/stores';

import App from 'App';
import Auth from 'pages/Auth';
import Cast from 'pages/Cast';
import Share from 'pages/Share';

import 'antd/dist/antd.css';
import 'scss/main.scss';

declare global {
    interface Window {
        ipcRenderer: any;
    }
}

export const history = createBrowserHistory();

render(
    <StoreContext.Provider value={store}>
        <Router history={history}>
          <Switch>
            <Route exact path="/" component={App} />
            <Route path="/auth/:id" component={Auth} />
            <Route path="/cast/:id/:password" component={Cast} />
            <Route path="/share/:id/:password" component={Share} />
          </Switch>
        </Router>
    </StoreContext.Provider>,
    document.getElementById('root')
);
