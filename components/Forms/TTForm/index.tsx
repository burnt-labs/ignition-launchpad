import React, { useState } from "react";

interface Props {
  handleSubmit: any;
  submit: (data: any) => Promise<boolean>;
  children?: React.ReactNode | React.ReactNode[];
}

export const TTForm: React.FC<Props> = ({ handleSubmit, submit, children }) => {
  const onSubmit = async (data: any) => {
    await submit(data);
  };

  return (
    <form
      className="md:grid md:grid-cols-2"
      action="#"
      method="POST"
      onSubmit={handleSubmit(onSubmit)}
    >
      {children}
    </form>
  );
};
