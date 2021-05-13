import { FC, useState } from 'react';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const ScreenCast: FC = () => {
  const [imgSrc, setImgSrc] = useState('');
  const [loader, setLoader] = useState(true);

  ipcRenderer.on("screen-cast", (event: any, data: any) => {
    setImgSrc(data);
    setLoader(false);
  });

  if (loader) {
    return (
      <div style={{ width: '100%', height: '100%' }} className="ui segment">
        <div className="ui active dimmer">
          <div className="ui loader"></div>
        </div>
      </div>
    );
  } else {
    return (
      <img style={{ width: '100%', height: '100%' }} src={`${imgSrc}`} alt="screencast" />
    );
  }

};

export default ScreenCast;
