import styles from "../../styles/cards.module.css";
import {
  Heading,
  Button,
  PlusIcon,
  Alert,
  Table,
  CreditCardIcon,
} from "evergreen-ui";
import prisma from "../../lib/prisma";
import { getSession } from "next-auth/react";
import { useState } from "react";
import { NewCard } from "../../components/dialogs/newCard";

const Cards = ({ stringifiedCards }) => {
  const [newCardShow, setNewCardShow] = useState(false);
  const [cards, setCards] = useState(JSON.parse(stringifiedCards));

  return (
    <div>
      <div className={styles.navContainer}>
        <Heading size={600} fontWeight={700} display="flex" alignItems="center">
          <CreditCardIcon marginRight={6} /> Cards
        </Heading>
        <Button
          appearance="primary"
          iconBefore={PlusIcon}
          onClick={() => setNewCardShow(true)}
        >
          New Card
        </Button>
      </div>
      {cards.length === 0 && (
        <Alert
          marginTop={20}
          intent="info"
          title="No cards on file. Get started by adding your first card!"
        />
      )}
      {cards.length > 0 && (
        <Table margin={30}>
          <Table.Head height={50}>
            <Table.SearchHeaderCell minWidth={130} />
            <Table.TextHeaderCell>Last 4</Table.TextHeaderCell>
          </Table.Head>
        </Table>
      )}
      <NewCard
        isShown={newCardShow}
        setIsShown={setNewCardShow}
        setCards={setCards}
      />
    </div>
  );
};

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { id } = session;
  const { cards } = await prisma.user.findUnique({
    where: { id },
    include: { cards: true },
  });

  return { props: { stringifiedCards: JSON.stringify(cards) } };
};

export default Cards;
