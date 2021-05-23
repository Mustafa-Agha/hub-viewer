import { FC, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Input, Button, Row, Col } from 'antd';
import jwt from 'jsonwebtoken';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;


const Auth: FC = (props: any) => {
  const [password, setPassword] = useState('');

  const handleInputChange = (e: any) => {
    const { value } = e.target;
    setPassword(value);
  }

  const joinRoom = async () => {
    try {
      const { match } = props;
      const { id } = match.params;
      let token = jwt.sign({id: id}, password);

      ipcRenderer.send('auth', {id, password: password, token});
      ipcRenderer.send('close-auth', {});
    } catch (err) {
      console.error(err.stack || err);
    }
  }

  const closeWindow = () => {
    ipcRenderer.send('close-auth', {});
  }

  ipcRenderer.on('error-auth', (event: any, response: any) => {
    console.error('error', response);
    ipcRenderer.send('close-auth', {});
  });

  return (
    <>
      <Row style={{ paddingTop: '10%' }} justify="space-around">
        <Col span={12}>
          <Input.Password style={{ marginBottom: '20px' }} onChange={handleInputChange} placeholder="input password" />
          <Button style={{ marginRight: '20px' }} id="close-btn" onClick={joinRoom} type="primary">Ok</Button>
          <Button onClick={closeWindow}>Cancel</Button>
        </Col>
      </Row>
    </>
  );
};

export default observer(Auth);
