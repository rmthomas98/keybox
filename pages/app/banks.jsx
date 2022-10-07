import {getSession} from "next-auth/react";

const Banks = () => {
  return <div>Bank Accounts</div>;
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


}

export default Banks;
