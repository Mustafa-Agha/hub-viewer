import { FC, useState, useEffect, ChangeEvent } from 'react';
import { Row, Col, Typography, List, Form, Radio, Input, Button, Space } from 'antd';
import { ReloadOutlined, SyncOutlined, SwapOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';


const { Title, Text } = Typography;

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const RemoteControl: FC = () => {
    const [id, setID] = useState(Number);
    const [partnerID, setPartnerID] = useState('');
    const [password, setPassword] = useState('');
    const [connected, setConnected] = useState(false);
    const [load, setLoad] = useState(false);

    useEffect(() => {
        let uuid = uuidv4();
        let password = uuid.split('-')[0];
        let id = Math.floor(100000000 + Math.random() * 900000000);
        setPassword(password);
        setID(id);
        let token = jwt.sign({id: id}, password);
        ipcRenderer.send('create-room', { id: id, password: password, token });
    }, []);

    ipcRenderer.on('error-create-room', (event: any, arg: any) => {
        console.error('error', arg);
    });

    ipcRenderer.on('error-connect', (event: any, arg: any) => {
        console.error('error', arg);
    });

    ipcRenderer.on('success-connect', (event: any, arg: any) => {
        console.log('success', arg);
        setConnected(true);
    });

    const changePassword = () => {
        setLoad(true);
        setTimeout(() => {
            let uuid = uuidv4();
            let password = uuid.split('-')[0];
            setPassword(password);
            setLoad(false);
        }, 2000);
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setPartnerID(value);
    }

    const handleConnect = async () => {
        try {
            if (!!partnerID && parseInt(partnerID.split(' ').join(''))) {
                let token = jwt.sign({id: id}, password);
                ipcRenderer.send('connect', { id: parseInt(partnerID.split(' ').join('')), password: token });
            }
        } catch (err) {
            console.error(err.stack || err);
        }
    }

    const handleDisconnect = async () => {
        try {
            ipcRenderer.send('disconnect', { id: id, password: password });
            setConnected(false);
        } catch (err) {
            console.error(err.stack || err);
        }
    }

    const renderConnectBtns = () => {
        switch (connected) {
            case false:
                return <Button onClick={handleConnect} type="primary"><SwapOutlined style={{ marginRight: '3px' }} />Connect</Button>;
            case true:
               return <Button onClick={handleDisconnect} type="primary" danger><SwapOutlined style={{ marginRight: '3px' }} />Abort</Button>;
        }
    }

    return (
        <>
            <Row justify="space-around" style={{ height: '100%' }}>
                <Col style={{ borderRight: '1px solid #fff', padding: '2rem' }} span={12}>
                    <Title style={{ fontWeight: 'normal' }} level={4}>Allow Remote Control</Title>
                    <List.Item>
                        <List.Item.Meta
                            style={{ borderLeft: '2px solid #0362bb', padding: '.5rem' }}
                            title={<Text style={{ pointerEvents: 'none' }} type="secondary" strong>Your ID</Text>}
                            description={<Title style={{ fontWeight: 'normal' }} level={5}>
                                {id.toString().substr(0, 3)} {id.toString().substr(3, 3)} {id.toString().substr(6, 3)}
                            </Title>}
                        />
                    </List.Item>
                    <List.Item style={{ marginTop: '.5rem' }}>
                        <List.Item.Meta
                            style={{ borderLeft: '2px solid #0362bb', padding: '.5rem' }}
                            title={<Text style={{ pointerEvents: 'none' }} type="secondary" strong>Password</Text>}
                            description={
                                <Row>
                                    <Col style={{ borderRight: '1px solid #fff' }} span={18}>
                                        <Text>{password}</Text>
                                    </Col>
                                    <Col style={{ paddingLeft: '10px' }} span={6}>
                                        {
                                            load
                                            ? <SyncOutlined spin />
                                            : <ReloadOutlined
                                                onClick={changePassword}
                                                style={{ color: '#0362bb', cursor: 'pointer' }}
                                            />
                                        }
                                    </Col>
                                </Row>
                            }
                        />
                    </List.Item>
                </Col>
                <Col style={{ padding: '2rem' }} span={12}>
                    <Title style={{ fontWeight: 'normal' }} level={4}>Control Remote Computer</Title>
                    <Form layout="vertical">
                        <Form.Item
                            style={{ width: '50%' }}
                            label={<Text type="secondary">Partner ID</Text>}
                            required
                            tooltip="This is a required field"
                        >
                            <Input disabled={connected} onChange={handleInputChange} placeholder="Insert partner ID" />
                        </Form.Item>
                        <Form.Item>
                            <Radio.Group value="remote_control">
                                <Space direction="vertical">
                                    <Radio value="remote_control" disabled={connected}>Remote Control</Radio>
                                    <Radio style={{ cursor: 'pointer' }} disabled>File Transfer</Radio>
                                </Space>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item style={{ margin: '0' }}>
                            {renderConnectBtns()}
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </>
    );
};

export default RemoteControl;
