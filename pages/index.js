import { Main } from "../components/landing/main/main";
import { Secure } from "../components/landing/secure/secure";
import { Crypto } from "../components/landing/crypto/crypto";
import { Footer } from "../components/landing/footer/footer";

const Home = () => {
  return (
    <div style={{ overflowX: "hidden" }}>
      <Main />
      <Secure />
      <Crypto />
      <Footer />
    </div>
  );
};

export default Home;
