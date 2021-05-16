import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Layout, Badge } from 'antd';

import SideBar from 'components/SideBar';
import RemoteControl from 'components/content/RemoteControl';
import GettingStarted from 'components/content/GettingStarted';

import { useStore } from 'hooks/context';

const { Footer, Sider, Content } = Layout;

const App: FC = () => {
  const { mainStore } = useStore();
  const { selectedKey } = mainStore;

  const renderContent = () => {
    switch (parseInt(selectedKey)) {
      case 2:
        return <RemoteControl />;
      case 5:
        return <GettingStarted />;
    }
  }

  return (
    <Layout style={{ height: '100%' }}>
      <Sider style={{ backgroundColor: 'white' }} breakpoint="lg">
        <SideBar />
      </Sider>
      <Layout>
        <Content>
          {renderContent()}
        </Content>
        <Footer style={{ textAlign: 'center', borderTop: '1px solid #fff' }}>
          <Badge status="success" text="Ready to connect (secure connection)" />
          {/* <Badge status="warning" text="Connecting..." />
          <Badge status="warning" text="Incomming connection..." />
          <Badge status="warning" text="Awaiting authenticating" />
          <Badge status="error" text="Authenticating failed" />
          <Badge status="error" text="This partner doesn't accept incoming connections" /> */}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default observer(App);
