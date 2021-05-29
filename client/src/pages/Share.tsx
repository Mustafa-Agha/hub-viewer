import { FC } from 'react';
import { Button } from 'antd';
import { EyeInvisibleTwoTone } from '@ant-design/icons';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const Share: FC = () => {
  const disconnect = () => {
    ipcRenderer.send('disconnect', {});
    window.close();
  };

  return (
    <div style={{ display: 'block', overflow: 'hidden', height: '100%', backgroundColor: '#1890ff' }}>
      <Button
        type="primary"
        style={{ width: '30px', height: '30px', justifyContent: 'center' }}
        icon={<EyeInvisibleTwoTone twoToneColor="#fff" />}
        onClick={disconnect}
      />
    </div>
  );
};

export default Share;
