import styles from "./faq.module.css";
import {
  Heading,
  Button,
  Card,
  Paragraph,
  PlusIcon,
  Icon,
  GeolocationIcon,
  Text,
  ChevronDownIcon,
} from "evergreen-ui";
import { questions } from "../../../data/questions";
import { useState } from "react";
import AnimateHeight from "react-animate-height";

export const Faq = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.contentContainer}>
          <Heading size={700} marginBottom={10} fontWeight={700}>
            Frequently asked questions
          </Heading>
          <Paragraph maxWidth={420}>
            We've compiled a list of the most common questions we get asked. We
            hope this helps you get started with Darkpine.
          </Paragraph>
          <Paragraph
            size={300}
            marginTop={16}
            maxWidth={420}
            lineHeight={1.8}
            color={"muted"}
          >
            Do you have a question that isn't answered here? Submit a request or
            start a live chat session and we'll get back to you as soon as
            possible.
          </Paragraph>
          <Button marginTop={20}>Submit a request</Button>
        </div>
        <div className={styles.questionContainer}>
          {questions.map((question, index) => (
            <Card
              background={"#fff"}
              width={"100%"}
              marginBottom={index === questions.length - 1 ? 0 : 10}
              key={index}
            >
              <AnimateHeight
                height={selectedIndex === index ? "auto" : 60}
                duration={300}
                easing={"ease-in-out"}
              >
                <div
                  className={styles.question}
                  onClick={() =>
                    selectedIndex === index
                      ? setSelectedIndex(null)
                      : setSelectedIndex(index)
                  }
                >
                  <Heading size={400}>{question.question}</Heading>
                  <Icon
                    icon={ChevronDownIcon}
                    color={"success"}
                    transform={
                      selectedIndex === index
                        ? "rotate(180deg)"
                        : "rotate(0deg)"
                    }
                    transition={"300ms"}
                  />
                </div>
                <div className={styles.answer}>
                  <Paragraph size={300} lineHeight={1.8}>
                    {question.answer}
                  </Paragraph>
                </div>
              </AnimateHeight>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
