import "antd/dist/antd.css";
import "../styles/globals.css";

import type { AppProps } from "next/app";
import { AuthProvider } from "../context/auth";
import { WalletProvider } from "../context/wallet";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <WalletProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </WalletProvider>
    </>
  );
}

export default App;
