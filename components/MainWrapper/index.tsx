import React from "react";

type Props = {
  children?: React.ReactNode | React.ReactNode[];
};

const MainWrapper: React.FC<Props> = ({ children }) => {
  return (
    <main className="max-w-screen-1440 mx-auto px-40 py-12">{children}</main>
  );
};

export default MainWrapper;
