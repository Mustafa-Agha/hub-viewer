import { FC, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Image, Spin, Layout } from 'antd';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const { Content } = Layout;

const View: FC = (props: any) => {
  const [src, setSrc] = useState('/images/icon.png');
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    const { match } = props;
    const { secret } = match.params;
    ipcRenderer.send('view', { secret });
  }, [props]);

  ipcRenderer.on('screen-cast', (_: any, img: any) => {
    setSrc(img);
    setSpinning(false);
  });

  return (
    <Content>
      <div style={{ display: 'block' }}>
        <Spin spinning={spinning}>
          <Image
            style={{ width: '100%', height: '100%', justifyContent: 'center', textAlign: 'center' }}
            preview={false}
            src={`${src}`}
            alt="view"
          />
        </Spin>
      </div>
    </Content>
  );
};

export default observer(View);
