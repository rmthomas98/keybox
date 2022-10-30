import styles from "./pricing.module.css";
import {
  Heading,
  Card,
  Paragraph,
  Button,
  Badge,
  Small,
  Text,
  UnorderedList,
  ListItem,
  TickIcon,
  ArrowRightIcon,
} from "evergreen-ui";

export const Pricing = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Heading
          size={700}
          marginBottom={10}
          fontWeight={700}
          textAlign={"center"}
        >
          One plan for all your needs and more
        </Heading>
        <Paragraph color="muted" textAlign={"center"}>
          We offer a simple pricing plan that fits all your needs. No hidden
          fees or surprises.
        </Paragraph>
        <Card
          background="tint2"
          padding={30}
          marginTop={20}
          className={styles.card}
        >
          <div className={styles.priceContainer}>
            <Badge color={"green"}>darkpine pro</Badge>
            <Heading
              size={800}
              fontWeight={700}
              marginBottom={5}
              marginTop={20}
            >
              $2.99
              <Text>
                <Small> / month</Small>
              </Text>
            </Heading>
            <Text>
              <Small>Cancel anytime</Small>
            </Text>
            <Button
              marginTop={40}
              intent={"success"}
              appearance={"primary"}
              iconAfter={ArrowRightIcon}
            >
              Start for free
            </Button>
          </div>
          <div className={styles.featuresContainer}>
            <Heading size={400} marginBottom={15} fontWeight={700}>
              What's included in this plan? Everything!
            </Heading>
            <div className={styles.featureFlexContainer}>
              <div className={styles.leftListContainer}>
                <UnorderedList
                  icon={TickIcon}
                  iconColor={"success"}
                  size={300}
                  marginRight={30}
                >
                  <ListItem>Unlimited Passwords</ListItem>
                  <ListItem>Unlimited Credit Cards</ListItem>
                  <ListItem>Unlimited Bank Accounts</ListItem>
                  <ListItem>Unlimited Crypto Wallets</ListItem>
                  <ListItem>15 GB File Storage</ListItem>
                </UnorderedList>
              </div>
              <UnorderedList icon={TickIcon} iconColor={"success"} size={300}>
                <ListItem>Password Generator</ListItem>
                <ListItem>Unlimited Devices</ListItem>
                <ListItem>Two Factor Authentication (2FA)</ListItem>
                <ListItem>Live Chat Customer Support</ListItem>
                <ListItem>U.S. Industry Standard Encryption</ListItem>
              </UnorderedList>
            </div>
            <Heading size={300} marginTop={10}>
              Try Darkpine for free for 7 days. No credit card required.
            </Heading>
          </div>
        </Card>
      </div>
    </div>
  );
};
