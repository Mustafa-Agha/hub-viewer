import { FC, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Row, Col, Button, Typography } from 'antd';

const { Text } = Typography;

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const Share: FC = (props: any) => {
    const [{id, password}, setState] = useState({id: '', password: ''});

    useEffect(() => {
        const { match } = props;
        const { id, password } = match.params;
        setState({id, password});
    }, [props]);

    const shareScreen = () => {
        ipcRenderer.send('share', {id, password});
        ipcRenderer.send('close-share', {});
    }

    const denyShare = () => {
        ipcRenderer.send('close-share', {});
    }

    return (
        <>
        <Row style={{ padding: '20px' }} justify="space-around">
            <Col span={24}>
                <Text style={{ display: 'block' }} type="secondary">
                    Share screen of your PC to room: {id} with password: {password}
                </Text>
                <Button style={{ marginRight: '20px', marginTop: '20px' }} onClick={shareScreen} type="primary">Share</Button>
                <Button style={{ marginTop: '20px' }} onClick={denyShare} danger>Deny</Button>
            </Col>
        </Row>
        </>
    );
};

export default observer(Share);