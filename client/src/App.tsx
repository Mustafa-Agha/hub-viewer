import { FC, useState, useEffect, ChangeEvent } from 'react';

const App: FC = () => {
  const [partnerId, setPartnerId] = useState('');

  useEffect(() => {
    window.ipcRenderer.on('uuid', (_event: any, data: any) => {
      setPartnerId(data);
    });
  }, []);

  const connect = () => {};

  const disconnect = () => {};

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {};

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
                    <div className="text">dtcnq5h1</div>
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
                    type="text"
                    name="partnerId"
                    placeholder="Partner ID"
                  />
                </div>
                <div className="grouped fields">
                  <div className="field">
                    <div className="ui radio checkbox">
                      <input
                        onChange={(e) => handleRadioChange(e)}
                        id="view"
                        type="radio"
                        name="connect"
                        checked
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
                      />
                      <label htmlFor="share">Share Screen</label>
                    </div>
                  </div>
                </div>
                <button
                  id="connect"
                  onClick={() => connect()}
                  className="ui primary button"
                >
                  <i className="exchange alternate icon"></i> Connect
                </button>
                <button
                  id="disconnect"
                  onClick={() => disconnect()}
                  className="ui red button"
                >
                  <i className="exchange alternate icon"></i> Disconnect
                </button>
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
