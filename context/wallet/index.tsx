import { WalletError } from "@solana/wallet-adapter-base";
import {
  useWallet,
  WalletProvider as BaseWalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { Button } from "antd";
import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WalletPaper } from "../../components/WalletPaper";
import { notify } from "../../components/Notification";

export interface WalletModalContextState {
  visible: boolean;
  setVisible: (open: boolean) => void;
}

export const WalletModalContext = createContext<WalletModalContextState>({
  visible: false,
  setVisible: () => {},
});

export function useWalletModal(): WalletModalContextState {
  return useContext(WalletModalContext);
}

export const WalletModal = () => {
  const { wallets, select } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const close = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  return (
    <WalletPaper
      className="wallet_selector-modal"
      visible={visible}
      onCancel={close}
    >
      <h2 className="walletSelectorModal__title">Connect to Wallet</h2>

      <p className="walletSelectorModal__subtitle">
        You must be signed in to continue
      </p>

      <br />
      {wallets.map((wallet) => {
        return (
          <Button
            className="walletSelectorModal__button"
            key={wallet.adapter.name}
            onClick={() => {
              select(wallet.adapter.name);
              close();
            }}
            style={{
              display: "flex",
              width: "100%",
              textAlign: "left",
              borderRadius: 8,
              height: 60,
              border: "none",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              color: "#000000",
              alignItems: "center",
            }}
          >
            <img
              alt={`${wallet.adapter.name}`}
              width={20}
              height={20}
              src={wallet.adapter.icon}
              style={{ marginRight: 16 }}
            />
            {wallet.adapter.name}
          </Button>
        );
      })}
    </WalletPaper>
  );
};

export const WalletModalProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { publicKey } = useWallet();
  const [connected, setConnected] = useState(!!publicKey);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (publicKey) {
      const base58 = publicKey.toBase58();
      const keyToDisplay =
        base58.length > 20
          ? `${base58.substring(0, 7)}.....${base58.substring(
              base58.length - 7,
              base58.length
            )}`
          : base58;

      notify({
        message: "Wallet update",
        description: "Connected to wallet " + keyToDisplay,
      });
    }
  }, [publicKey]);

  useEffect(() => {
    if (!publicKey && connected) {
      notify({
        message: "Wallet update",
        description: "Disconnected from wallet",
      });
    }
    setConnected(!!publicKey);
  }, [publicKey, connected, setConnected]);

  return (
    <WalletModalContext.Provider
      value={{
        visible,
        setVisible,
      }}
    >
      {children}
      <WalletModal />
    </WalletModalContext.Provider>
  );
};

export const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  const onError = useCallback((error: WalletError) => {
    notify({
      message: "Wallet error",
      description: error.message,
    });
  }, []);

  return (
    <BaseWalletProvider wallets={wallets} onError={onError} autoConnect>
      <WalletModalProvider>{children}</WalletModalProvider>
    </BaseWalletProvider>
  );
};
