import { Heading, Card, Paragraph, Button, Small } from "evergreen-ui";
import NextLink from "next/link";

const NewSubscription = () => {
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
            Subscription Started!
          </Heading>
          <Paragraph textAlign="center" marginBottom={30}>
            <Small>
              Thank you for your payment! You can now use all of KeyBox
              features.
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

export default NewSubscription;
