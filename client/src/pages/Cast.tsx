import { FC, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Image, Spin } from 'antd';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const Cast: FC = (props: any) => {
  const [src, setSrc] = useState('/images/favicon.png');
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    const { match } = props;
    const { password, id } = match.params;
    ipcRenderer.send('view', {id, password});
  }, [props]);

  ipcRenderer.on('screen-cast', (event: any, img: any) => {
    setSrc(img);
    setSpinning(false);
  });

  return (
    <Spin spinning={spinning}>
      <Image style={{ margin: '0 auto', width: '100%', height: '100%' }} preview={false} src={`${src}`} alt="cast"/>
    </Spin>
  );
};

export default observer(Cast);
