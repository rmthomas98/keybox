import { Main } from "../components/landing/main/main";
import { Secure } from "../components/landing/secure/secure";
import { Crypto } from "../components/landing/crypto/crypto";
import { Footer } from "../components/landing/footer/footer";
import { Types } from "../components/landing/storage/types";
import { Pricing } from "../components/landing/pricing/pricing";
import { Faq } from "../components/landing/faq/faq";

const Home = () => {
  return (
    <div style={{ overflowX: "hidden" }}>
      <Main />
      <Secure />
      <Crypto />
      <Types />
      <Pricing />
      <Faq />
      <Footer />
    </div>
  );
};

export default Home;
