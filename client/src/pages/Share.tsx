import { FC, useState } from 'react';
import { Button } from 'antd';
import { EyeInvisibleTwoTone, EyeTwoTone } from '@ant-design/icons';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const Share: FC = () => {
  const [hover, setHover] = useState(false);
  const disconnect = () => {
    ipcRenderer.send('disconnect', {});
    window.close();
  };

  return (
    <div style={{ display: 'block', overflow: 'hidden', height: '100%', backgroundColor: '#1890ff' }}>
      <Button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        type="primary"
        style={{ width: '30px', height: '30px', justifyContent: 'center' }}
        icon={hover ? <EyeInvisibleTwoTone twoToneColor="#fff" /> : <EyeTwoTone twoToneColor="#fff" />}
        onClick={disconnect}
      />
    </div>
  );
};

export default Share;
