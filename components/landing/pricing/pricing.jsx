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
  InfoSignIcon,
  ArrowRightIcon,
  Icon,
  Tooltip,
  Position,
} from "evergreen-ui";
import { BsInfoCircleFill } from "react-icons/bs";
import { FiInfo } from "react-icons/fi";

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
              size={900}
              fontWeight={700}
              marginBottom={12}
              marginTop={20}
            >
              $4
              <Text color={"muted"}>
                <Small> / month</Small>
              </Text>
            </Heading>
            <Paragraph size={300}>
              Cancel anytime. No long term commitment.
            </Paragraph>
            <Button
              marginTop={33}
              intent={"success"}
              appearance={"primary"}
              iconAfter={ArrowRightIcon}
              width={"100%"}
              size={"large"}
            >
              Start for free
            </Button>
          </div>
          <div className={styles.featuresContainer}>
            <Heading size={400} marginBottom={15}>
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
                  <ListItem height={17}>Unlimited Passwords</ListItem>
                  <ListItem height={17}>Unlimited Credit Cards</ListItem>
                  <ListItem height={17}>Unlimited Bank Accounts</ListItem>
                  <ListItem height={17}>Unlimited Crypto Wallets</ListItem>
                  <ListItem height={17}>
                    15 GB File Storage
                    <Tooltip
                      content={
                        <Paragraph
                          textAlign={"center"}
                          color={"#fff"}
                          size={300}
                          lineHeight={1.8}
                        >
                          You can upload files up to 50 MB in size. We plan to
                          increase this limit in the future.
                        </Paragraph>
                      }
                      position={Position.RIGHT}
                    >
                      <span
                        style={{ marginLeft: 4, position: "relative", top: 2 }}
                      >
                        <FiInfo size={14} />
                      </span>
                    </Tooltip>
                  </ListItem>
                </UnorderedList>
              </div>
              <UnorderedList icon={TickIcon} iconColor={"success"} size={300}>
                <ListItem height={17} display={"flex"} alignItems={"center"}>
                  Password Generator
                  <Tooltip
                    content={
                      <Paragraph
                        textAlign={"center"}
                        color={"#fff"}
                        size={300}
                        lineHeight={1.8}
                      >
                        Generate strong and unique passwords with our password
                        generator. Add special characters, numbers, and more.
                      </Paragraph>
                    }
                    position={Position.RIGHT}
                  >
                    <span
                      style={{ marginLeft: 4, position: "relative", top: 2 }}
                    >
                      <FiInfo size={14} />
                    </span>
                  </Tooltip>
                </ListItem>
                <ListItem height={17} display={"flex"} alignItems={"center"}>
                  Unlimited Devices
                  <Tooltip
                    content={
                      <Paragraph
                        textAlign={"center"}
                        color={"#fff"}
                        size={300}
                        lineHeight={1.8}
                      >
                        Access your data from any device. Use our software on
                        your desktop, laptop, tablet, or phone. No restrictions.
                      </Paragraph>
                    }
                    position={Position.RIGHT}
                  >
                    <span
                      style={{ marginLeft: 4, position: "relative", top: 2 }}
                    >
                      <FiInfo size={14} />
                    </span>
                  </Tooltip>
                </ListItem>
                <ListItem height={17}>
                  Two Factor Authentication (2FA)
                  <Tooltip
                    content={
                      <Paragraph
                        textAlign={"center"}
                        color={"#fff"}
                        size={300}
                        lineHeight={1.8}
                      >
                        Add an extra layer of security to your account. A code
                        is sent to your phone every time you log in. We plan to
                        add more 2FA methods in the future.
                      </Paragraph>
                    }
                    position={Position.RIGHT}
                  >
                    <span
                      style={{ marginLeft: 4, position: "relative", top: 2 }}
                    >
                      <FiInfo size={14} />
                    </span>
                  </Tooltip>
                </ListItem>
                <ListItem height={17}>
                  U.S. Industry Standard Encryption
                  <Tooltip
                    content={
                      <Paragraph
                        textAlign={"center"}
                        color={"#fff"}
                        size={300}
                        lineHeight={1.8}
                      >
                        Zero-knowledge & zero-trust protocol. We use an envelope
                        encryption model paired with AES-256 bit encryption to
                        secure your data and ensure that only you have access to
                        it.
                      </Paragraph>
                    }
                    position={Position.RIGHT}
                  >
                    <span
                      style={{ marginLeft: 4, position: "relative", top: 2 }}
                    >
                      <FiInfo size={14} />
                    </span>
                  </Tooltip>
                </ListItem>
                <ListItem height={17}>Live Chat Customer Support</ListItem>
              </UnorderedList>
            </div>
            <Heading size={300} marginTop={14}>
              Try Darkpine for free for 7 days. No credit card required.
            </Heading>
          </div>
        </Card>
      </div>
    </div>
  );
};
