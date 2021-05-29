import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Menu, Avatar, Typography } from 'antd';
import {
  UserOutlined,
  SwapOutlined,
  SolutionOutlined,
  CommentOutlined,
  BulbOutlined,
} from '@ant-design/icons';

import { useStore } from 'hooks/context';

const { Text } = Typography;

const SideBar: FC = () => {
  const { mainStore } = useStore();
  const { selectedKey, selectKey } = mainStore;

  const handleKeySelect = ({ key }: any) => {
    selectKey(key);
  };

  return (
    <>
      <Menu
        onSelect={handleKeySelect}
        theme="light"
        mode="inline"
        defaultSelectedKeys={[selectedKey]}
      >
        <Menu.Item
          style={{ cursor: 'default' }}
          disabled
          title="Sign In"
          key="1"
          icon={<Avatar size="small" icon={<UserOutlined />} />}
        >
          <Text type="secondary">Sign In</Text>
        </Menu.Item>
        <Menu.Item key="2" icon={<SwapOutlined />}>
          Remote Control
        </Menu.Item>
        <Menu.Item
          style={{ cursor: 'default' }}
          disabled
          key="3"
          icon={<SolutionOutlined />}
        >
          Computers
        </Menu.Item>
        <Menu.Item
          style={{ cursor: 'default' }}
          disabled
          key="4"
          icon={<CommentOutlined />}
        >
          Chat
        </Menu.Item>
        <Menu.Item key="5" icon={<BulbOutlined />}>
          Getting Started
        </Menu.Item>
        <Menu.Item
          disabled
          title="HubViewer"
          style={{
            position: 'absolute',
            cursor: 'default',
            pointerEvents: 'none',
            backgroundColor: 'white',
            bottom: 0,
            zIndex: 1,
            transition: 'all 0.2s',
          }}
          key="6"
          icon={
            <Avatar
              size={18}
              icon={<img src="/images/favicon.png" alt="logo" />}
            />
          }
        >
          <Text style={{ color: '#0362bb' }} strong>
            Hub
          </Text>
          <Text style={{ color: '#056bca' }}>Viewer</Text>
        </Menu.Item>
      </Menu>
    </>
  );
};

export default observer(SideBar);
