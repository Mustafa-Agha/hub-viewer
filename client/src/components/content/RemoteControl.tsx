import { FC, useState, useEffect, ChangeEvent } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Row,
  Col,
  Typography,
  List,
  Form,
  Radio,
  Input,
  Button,
  Space,
  Modal,
} from 'antd';
import { ReloadOutlined, SyncOutlined, SwapOutlined } from '@ant-design/icons';

import { useStore } from 'hooks/context';

const { Title, Text } = Typography;

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const RemoteControl: FC = () => {
  const [load, setLoad] = useState(false);
  const [visible, setVisible] = useState(false);
  const [connected, setConnected] = useState(false);
  const [statePartnerID, setStatePartnerID] = useState(0);
  const [statePartnerSecret, setStatePartnerSecret] = useState('');

  const { mainStore } = useStore();
  const {
    notify,
    myID,
    mySecret,
    changeMySecret,
  } = mainStore;

  useEffect(() => {
    ipcRenderer.send('connection', { id: myID, secret: mySecret });
  }, [myID, mySecret]);

  ipcRenderer.on('success-connection', (_: any, arg: any) => {
    notify(arg['msg'], arg['type']);
  });

  ipcRenderer.on('err-connection', (_: any, arg: any) => {
    notify(arg['msg'], arg['type']);
  });

  ipcRenderer.on('success-disconnect', (_: any, arg: any) => {
    notify(arg['msg'], arg['type']);
    ipcRenderer.send('connection', { id: myID, secret: mySecret });
  });

  ipcRenderer.on('err-disconnect', (_: any, arg: any) => {
    notify(arg['msg'], arg['type']);
  });

  ipcRenderer.on('success-connect', (_: any, arg: any) => {
    notify(arg['msg'], arg['type']);
    setConnected(!connected);
  });

  ipcRenderer.on('err-connect', (_: any, arg: any) => {
    notify(arg['msg'], arg['type']);
  });

  ipcRenderer.on('error', (_: any, arg: any) => {
    notify(arg['msg'], arg['type']);
  });

  const changePassword = () => {
    setLoad(true);
    notify('Connecting...', 'warning');
    setTimeout(() => {
      changeMySecret();
      ipcRenderer.send('disconnect', {});
      setLoad(false);
    }, 2000);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setStatePartnerID(parseInt(value.split(' ').join('')));
  };

  const handleInputAuth = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setStatePartnerSecret(value);
  };

  const openAuthModal = () => {
    if (!!statePartnerID) {
      setVisible(!visible);
    }
  };

  const handleConnect = () => {
    try {
      if (!!statePartnerID && !!statePartnerSecret) {
        notify('Awaiting authenticating', 'warning');
        setVisible(!visible);
        setTimeout(() => {
          ipcRenderer.send('connect', { id: statePartnerID, secret: statePartnerSecret });
        }, 2000);
      }
    } catch (err) {
      console.error(err.stack || err);
    }
  };

  const handleDisconnect = () => {
    try {
      ipcRenderer.send('disconnect', {});
      setConnected(!connected);
      notify('Ready to connect (secure connection)', 'success');
    } catch (err) {
      console.error(err.stack || err);
    }
  };

  const renderConnectBtns = () => {
    switch (connected) {
      case false:
        return (
          <Button onClick={openAuthModal} type="primary">
            <SwapOutlined style={{ marginRight: '3px' }} />
            Connect
          </Button>
        );
      case true:
        return (
          <Button onClick={handleDisconnect} type="primary" danger>
            <SwapOutlined style={{ marginRight: '3px' }} />
            Abort
          </Button>
        );
    }
  };

  return (
    <>
      <Row justify="space-around" style={{ height: '100%' }}>
        <Col
          style={{ borderRight: '1px solid #fff', padding: '2rem' }}
          span={12}
        >
          <Title style={{ fontWeight: 'normal' }} level={4}>
            Allow Remote Control
          </Title>
          <List.Item>
            <List.Item.Meta
              style={{ borderLeft: '2px solid #0362bb', padding: '.5rem' }}
              title={
                <Text style={{ pointerEvents: 'none' }} type="secondary" strong>
                  Your ID
                </Text>
              }
              description={
                <Title style={{ fontWeight: 'normal' }} level={5}>
                  {myID.toString().substr(0, 3)} {myID.toString().substr(3, 3)}{' '}
                  {myID.toString().substr(6, 3)}
                </Title>
              }
            />
          </List.Item>
          <List.Item style={{ marginTop: '.5rem' }}>
            <List.Item.Meta
              style={{ borderLeft: '2px solid #0362bb', padding: '.5rem' }}
              title={
                <Text style={{ pointerEvents: 'none' }} type="secondary" strong>
                  Password
                </Text>
              }
              description={
                <Row>
                  <Col style={{ borderRight: '1px solid #fff' }} span={18}>
                    <Text>{mySecret}</Text>
                  </Col>
                  <Col style={{ paddingLeft: '10px' }} span={6}>
                    {load ? (
                      <SyncOutlined spin />
                    ) : (
                      <ReloadOutlined
                        onClick={changePassword}
                        style={{ color: '#0362bb', cursor: 'pointer' }}
                      />
                    )}
                  </Col>
                </Row>
              }
            />
          </List.Item>
        </Col>
        <Col style={{ padding: '2rem' }} span={12}>
          <Title style={{ fontWeight: 'normal' }} level={4}>
            Control Remote Computer
          </Title>
          <Form layout="vertical">
            <Form.Item
              style={{ width: '50%' }}
              label={<Text type="secondary">Partner ID</Text>}
              required
              tooltip="This is a required field"
            >
              <Input
                disabled={connected}
                onChange={handleInputChange}
                placeholder="Insert partner ID"
              />
            </Form.Item>
            <Form.Item>
              <Radio.Group value="remote_control">
                <Space direction="vertical">
                  <Radio value="remote_control" disabled={connected}>
                    Remote Control
                  </Radio>
                  <Radio style={{ cursor: 'pointer' }} disabled>
                    File Transfer
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            <Form.Item style={{ margin: '0' }}>{renderConnectBtns()}</Form.Item>
          </Form>
        </Col>
        <Modal
          title="Authentication"
          centered
          visible={visible}
          onOk={handleConnect}
          onCancel={() => setVisible(!visible)}
        >
          <Input
            onChange={handleInputAuth}
            placeholder="Insert partner password"
          />
        </Modal>
      </Row>
    </>
  );
};

export default observer(RemoteControl);
