import { useCallback, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../app-firebase";
import router from "next/router";
import { useWalletModal } from "../context/wallet";

const nacl = require("tweetnacl");
const bs58 = require("bs58");

export default function SignIn() {
  const { connected } = useWallet();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (connected && user) {
        router.push(
          {
            pathname: "/projects",
            query: { uid: user.uid },
          },
          undefined,
          { shallow: false }
        );
      }
    });
  }, [connected]);

  const { setVisible } = useWalletModal();
  const open = useCallback(() => setVisible(true), [setVisible]);

  const handleLogin = async () => {
    const message = `Sign this message for authenticating with your wallet.`;
    const messageBytes = new TextEncoder().encode(message);
    const signedMessage = await (window as any).solana.request({
      method: "signMessage",
      params: {
        message: messageBytes,
      },
    });

    const credentials = {
      publicKey: signedMessage.publicKey,
      signature: signedMessage.signature,
    };

    const publicKeyBytes = bs58.decode(credentials?.publicKey);
    const signatureBytes = bs58.decode(credentials?.signature);

    const result = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!result) {
      console.log(`authentication failed`);
      throw new Error("user can not be authenticated");
    }

    try {
      await createUserWithEmailAndPassword(
        auth,
        `${credentials.publicKey}@burnt.com`,
        credentials.signature
      );
    } catch (error) {
      await signInWithEmailAndPassword(
        auth,
        `${credentials.publicKey}@burnt.com`,
        credentials?.signature
      );
    }
  };

  return (
    <>
      <div className="authLandingContainer">
        <div className="authLandingLeftContainer">
          <div className="authLandingLogoContainer">
            <img
              src="/svgs/logoHeader.svg"
              className="authLandingLogo"
              alt="Logo"
            />
          </div>
          <div className="authLandingContentContainer">
            <div className="authLandingContent">
              <div className="authLandingCodeContainer">
                <p className="authLandingLabel">Login</p>
                <p className="authLandingParagraph">
                  Ready to Create? Log in with Wallet
                </p>
                <div className="authLandingButtonContainer">
                  {!connected ? (
                    <button className="authLandingButton" onClick={open}>
                      Connect Wallet
                    </button>
                  ) : (
                    <button className="authLandingButton" onClick={handleLogin}>
                      Sign in with Wallet
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="authLandingRightContainer">
          <div className="authLandingArtContainer">
            <img src="/pngs/art.png" className="authLandingArt" alt="Art" />
          </div>
        </div>
      </div>
      );
    </>
  );
}
