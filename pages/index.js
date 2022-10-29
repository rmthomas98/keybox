import { Main } from "../components/landing/main/main";
import { Secure } from "../components/landing/secure/secure";
import { Crypto } from "../components/landing/crypto/crypto";

const Home = () => {
  return (
    <div style={{ overflowX: "hidden" }}>
      <Main />
      <Secure />
      <Crypto />
    </div>
  );
};

export default Home;
