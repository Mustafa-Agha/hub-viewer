import { FC } from 'react';
import { Row, Col, Typography, Steps, Button } from 'antd';

const { Title, Text } = Typography;
const { Step } = Steps;

const GettingStarted: FC = () => {
  const steps = [
    {
      title: 'Connect to a computer',
      description:
        'Securely connect to a remote computer to access files and applications, or troubleshoot issues.',
    },
    {
      title: 'Create your HubViewer account',
      description:
        'Sign in with your HubViewer credentials to access more features.',
    },
    {
      title: 'Add a computer',
      description:
        'Add a computer you want to access remotely - always, without being there.',
    },
  ];

  const showMeHowBtn = (
    <Button size="small" className="showMeHow" type="text">
      Show Me How
    </Button>
  );

  return (
    <>
      <Row justify="space-around">
        <Col style={{ padding: '1rem' }} span={24}>
          <Title style={{ fontWeight: 'lighter' }} level={4}>
            Getting started with HubViewer
          </Title>
          <Text type="secondary">
            Welcome to HubViewer! Take a 3-step tour to learn how to remotely
            access and use computers from anywhere, anytime - without being in
            front of them.
          </Text>
          <Steps
            style={{ marginTop: '20px' }}
            direction="vertical"
            size="small"
            current={0}
          >
            {steps.map(({ title, description }, i) => {
              return (
                <Step
                  key={i}
                  title={
                    <Title style={{ fontWeight: 'lighter' }} level={5}>
                      {title}
                    </Title>
                  }
                  description={
                    <>
                      <Text type="secondary">{description}</Text>
                      {showMeHowBtn}
                    </>
                  }
                />
              );
            })}
          </Steps>
        </Col>
      </Row>
    </>
  );
};

export default GettingStarted;
