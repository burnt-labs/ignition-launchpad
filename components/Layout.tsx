import React, { ReactNode } from "react";
import Head from "next/head";
import Image from "next/image";
import type Project from "../models/project";
import Link from "next/link";
import { useAuth } from "../context/auth";

type Props = {
  children?: ReactNode;
  title: string;
  section: string;
  selectedProjectId: string | undefined;
};

const Layout = ({ children, title }: Props) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>{title} | Launchpad</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css"></link>

        <meta
          name="description"
          content="Artwork Generator that combines image layers to create Generative Collections"
        />
        <meta name="theme-color" content="#ffffff" />

        <meta property="og:url" content="https://launchpad.burnt.com/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Launchpad | Burnt Finance | Create and Launch Generative NFT Collections"
        />
        <meta
          property="og:description"
          content="Create and Launch Generative NFT Collections"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Launchpad | Burnt Finance | Create and Launch Generative NFT Collections"
        />
        <meta
          name="twitter:description"
          content="Artwork Generator that combines image layers to create Generative Collections"
        />

        <link rel="icon" href="/svgs/logo.svg" />
      </Head>
      <header>
        <nav className="bg-brand-black">
          <div className="max-w-screen-1440 mx-auto flex items-center justify-between py-3 px-14">
            <div className="flex items-center justify-between">
              <Link href={user ? "/projects" : "/"} passHref={true}>
                <button>
                  <Image
                    src="/svgs/logo.svg"
                    alt="Burnt"
                    width="35px"
                    height="29px"
                  />
                </button>
              </Link>
              <p className="text-brand-white ml-16">{title}</p>
            </div>
            <Link href="/usergroups">
              <a>
                <Image src="/pngs/user.png" alt="User" width={45} height={45} />
              </a>
            </Link>
          </div>
        </nav>
      </header>
      <div className="flex-grow">{children}</div>
      <footer>
        <p className="text-sm flex justify-center sm:py-2 sm:mt-0 mt-4">
          <img width={200} height={60} src="/pngs/treat-toolbox.png" />
        </p>
      </footer>
    </div>
  );
};

export default Layout;
