import React from "react";
import Link from "next/link";
import IconButtonWithTitle from "../Button/IconButtonWithTitle";

export default function HeaderWithAddButton(props: {
  title: string;
  addTitle: string;
  addHref: string;
}) {
  const { title, addTitle, addHref } = props;

  return (
    <header>
      <div className="max-w-screen-1440 px-40 m-auto mt-10 mb-7 flex justify-between w-full">
        <h1 className="text-2xl text-brand-black">{title}</h1>
        <Link href={addHref} passHref={true}>
          <IconButtonWithTitle addTitle={addTitle} />
        </Link>
      </div>
    </header>
  );
}
