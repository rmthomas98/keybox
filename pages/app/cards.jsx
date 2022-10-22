import styles from "../../styles/cards.module.css";
import {
  Heading,
  Button,
  PlusIcon,
  Alert,
  Table,
  CreditCardIcon,
  Text,
  Small,
  Paragraph,
} from "evergreen-ui";
import { getSession } from "next-auth/react";
import prisma from "../../lib/prisma";
import { useState, useContext } from "react";
import { NewCard } from "../../components/dialogs/cards/newCard";
import { CardView } from "../../components/dialogs/cards/cardView";
import { decryptCards } from "../../helpers/cards/decryptCards";
import { SearchContext } from "../../components/context/search";

const Cards = ({ stringifiedCards }) => {
  const [newCardShow, setNewCardShow] = useState(false);
  const [cards, setCards] = useState(JSON.parse(stringifiedCards));
  const { searchValue, setSearchValue } = useContext(SearchContext);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardViewShow, setCardViewShow] = useState(false);

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setCardViewShow(true);
  };

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
          Add card
        </Button>
      </div>
      {cards.length === 0 && (
        <Alert marginTop={20} intent="info" title="No cards on file">
          <Paragraph size={300} color="#2952CC" marginTop={4}>
            Get started by adding your first card!
          </Paragraph>
        </Alert>
      )}
      {cards.length > 0 && (
        <Table marginTop={30}>
          <Table.Head height={40} paddingRight={0}>
            {/*<Table.SearchHeaderCell*/}
            {/*  minWidth={50}*/}
            {/*  onChange={(value) => setSearchValue(value)}*/}
            {/*  value={searchValue}*/}
            {/*  placeholder="Search..."*/}
            {/*/>*/}
            <Table.TextHeaderCell>Name</Table.TextHeaderCell>
            <Table.TextHeaderCell>Last 4</Table.TextHeaderCell>
            <Table.TextHeaderCell>type</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body height="100%" maxHeight={400}>
            {cards
              .filter((card) =>
                !searchValue
                  ? card
                  : card.identifier
                      .toLowerCase()
                      .includes(searchValue.toLowerCase().trim())
              )
              .map((card) => (
                <Table.Row
                  key={card.id}
                  isSelectable
                  height={40}
                  onSelect={() => handleCardClick(card)}
                >
                  <Table.TextCell>{card.identifier}</Table.TextCell>
                  <Table.TextCell isNumber>
                    {card.number?.slice(-4)}
                  </Table.TextCell>
                  <Table.TextCell>{card.type}</Table.TextCell>
                </Table.Row>
              ))}
            {searchValue &&
              cards.filter((card) =>
                card.identifier
                  .toLowerCase()
                  .includes(searchValue.toLowerCase().trim())
              ).length === 0 && (
                <Table.Row height={40}>
                  <Table.TextCell textAlign="center" width="100%">
                    <Text color="#D14343">
                      <Small>
                        No results found for <b>{searchValue}</b>
                      </Small>
                    </Text>
                  </Table.TextCell>
                </Table.Row>
              )}
          </Table.Body>
        </Table>
      )}
      <NewCard
        isShown={newCardShow}
        setIsShown={setNewCardShow}
        setCards={setCards}
      />
      <CardView
        isShown={cardViewShow}
        setIsShown={setCardViewShow}
        card={selectedCard}
        setCard={setSelectedCard}
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
  const user = await prisma.user.findUnique({
    where: { id },
    include: { cards: true },
  });

  if (!user.emailVerified) {
    return {
      redirect: {
        destination: `/verify?email=${user.email}`,
        permanent: false,
      },
    };
  }

  if (
    user.status === "NEW_ACCOUNT" ||
    user.status === "SUBSCRIPTION_CANCELED"
  ) {
    return {
      redirect: {
        destination: "/app/choose-plan",
        permanent: false,
      },
    };
  }

  if (user.paymentStatus === "FAILED") {
    return {
      redirect: {
        destination: "/app/subscription",
        permanent: false,
      },
    };
  }

  let { cards } = user;
  cards = decryptCards(cards);

  return { props: { stringifiedCards: JSON.stringify(cards) } };
};

export default Cards;
