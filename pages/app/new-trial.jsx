import { Card, Heading, Button, Text, Small, Paragraph } from "evergreen-ui";
import NextLink from "next/link";

const NewTrial = () => {
  return (
    <div style={{ padding: 20, paddingTop: 50 }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card
          elevation={1}
          background="tint2"
          padding={20}
          width="100%"
          maxWidth={350}
        >
          <Heading size={700} textAlign="center" marginBottom={15}>
            Your 7 day free trial has started!
          </Heading>
          <Paragraph textAlign="center" marginBottom={30}>
            <Small>
              You can now use KeyBox free trial features for the next 7 days for
              free. If you decide to upgrade to the premium plan, you can do so
              in your account settings before the trial period is over.
            </Small>
          </Paragraph>
          <NextLink href="/app" passHref>
            <a>
              <Button appearance="primary" width="100%">
                Continue to app
              </Button>
            </a>
          </NextLink>
        </Card>
      </div>
    </div>
  );
};

export default NewTrial;
