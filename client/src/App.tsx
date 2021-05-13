import { FC, useState, useEffect, ChangeEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const App: FC = () => {
  const [partnerId, setPartnerId] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('view');
  const [toViewId, setToViewId] = useState('');
  const [toViewPassword, setToViewPassword] = useState('');
  const [displayConnect, setDisplayConnect] = useState(true);

  useEffect(() => {
    const uuid = uuidv4().split('-');
    const id = uuid[uuid.length - 1];
    const pass = uuid[0];

    setPartnerId(id);
    setPassword(pass);
  }, []);

  const connect = () => {
    if (!!type) {
      if (type === 'view' && !!toViewId && !!toViewPassword) {
        ipcRenderer.send('connect', { id: toViewId, password: toViewPassword, type });
        setDisplayConnect(false);
      } else if (type === 'share') {
        ipcRenderer.send('connect', { id: partnerId, password, type });
        setDisplayConnect(false);
      }
    }
  };

  const disconnect = () => {
    if (type === 'view') {
      ipcRenderer.send('disconnect', {
        id: toViewId,
        password: toViewPassword,
      });
      setDisplayConnect(true);
    } else if (type === 'share') {
      ipcRenderer.send('disconnect', { id: partnerId, password });
      setDisplayConnect(true);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    if (name === 'partnerId') {
      setToViewId(value);
    } else if (name === 'partnerPassword') {
      setToViewPassword(value);
    }
  };

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id } = e.target;
    setType(id);
  };

  const changePassword = () => {
    const uuid = uuidv4().split('-');
    const pass = uuid[0];
    setPassword(pass);
  };

  const renderConnectionBtns = () => {
    if (displayConnect) {
      return (
        <button
          id="connect"
          onClick={() => connect()}
          className="ui primary button"
        >
          <i className="exchange alternate icon"></i> Connect
        </button>
      );
    } else {
      return (
        <button
          id="disconnect"
          onClick={() => disconnect()}
          className="ui red button"
        >
          <i className="exchange alternate icon"></i> Disconnect
        </button>
      );
    }
  };

  return (
    <div className="ui container">
      <div className="ui placeholder segment">
        <div className="ui grid">
          <div className="three column row">
            <div className="column">
              <div className="ui items">
                <div className="item">
                  <div className="avatar">
                    <img src="/assets/images/profile.png" alt="" />
                  </div>
                  <div className="content item__content">
                    <p className="header">Mustafa Agha</p>
                    <div className="meta">
                      <span>Full Stack Developer</span>
                    </div>
                  </div>
                </div>
                <div className="ui divider"></div>
                <div className="item item__img">
                  <img
                    className="ui small image"
                    src="/assets/images/logo.png"
                    alt=""
                  />
                </div>
              </div>
            </div>

            <div className="column">
              <h3 className="ui header">Allow Remote Control</h3>
              <div className="ui comments">
                <div className="comment">
                  <div className="content">
                    <div className="metadata">
                      <span className="date">Your ID</span>
                    </div>
                    <div className="text">{partnerId}</div>
                  </div>
                </div>

                <div className="comment" style={{ marginTop: '2rem' }}>
                  <div className="content">
                    <div className="metadata">
                      <span className="date">Password</span>
                    </div>
                    <div className="text ui two column very relaxed stackable grid">
                      <span id="pass-text" className="column">
                        {password}
                      </span>
                      <button
                        onClick={() => changePassword()}
                        id="pass-loader"
                        className={`column ui basic icon button`}
                      >
                        <i className="undo icon"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="column">
              <h3 className="ui header">View Remote Computer</h3>
              <div className="ui form">
                <div className="field">
                  <label>Partner ID</label>
                  <input
                    onChange={(e) => handleInputChange(e)}
                    type="text"
                    name="partnerId"
                    placeholder="Partner ID"
                    disabled={!displayConnect}
                  />
                </div>
                {type === 'view' ? (
                  <div className="field">
                    <label>Partner Password</label>
                    <input
                      onChange={(e) => handleInputChange(e)}
                      type="text"
                      name="partnerPassword"
                      placeholder="Partner Password"
                      disabled={!displayConnect}
                    />
                  </div>
                ) : null}
                <div className="grouped fields">
                  <div className="field">
                    <div className="ui radio checkbox">
                      <input
                        onChange={(e) => handleRadioChange(e)}
                        id="view"
                        type="radio"
                        name="connect"
                        defaultChecked
                        disabled={!displayConnect}
                      />
                      <label htmlFor="view">Remote View</label>
                    </div>
                  </div>
                  <div className="field">
                    <div className="ui radio checkbox">
                      <input
                        onChange={(e) => handleRadioChange(e)}
                        id="share"
                        type="radio"
                        name="connect"
                        disabled={!displayConnect}
                      />
                      <label htmlFor="share">Share Screen</label>
                    </div>
                  </div>
                </div>
                {renderConnectionBtns()}
              </div>
            </div>
          </div>
        </div>

        <div className="ui divider"></div>

        <div className="footer">
          <p className="ui green empty circular label"></p>
          <span className="ready">Ready to connect (secure connection)</span>
        </div>
      </div>
    </div>
  );
};

export default App;
