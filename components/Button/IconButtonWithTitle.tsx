import React from "react";
import cx from "classnames";
import { PlusIcon } from "@heroicons/react/outline";
import PencilIcon from "@heroicons/react/solid/PencilIcon";

export type ButtonVariant = "edit" | "create";

interface Props extends React.ComponentPropsWithoutRef<"button"> {
  addTitle: string;
  variant?: ButtonVariant;
}

export const Icons: { [key in ButtonVariant]: React.ReactNode } = {
  create: <PlusIcon aria-hidden="true" className="w-3 h-3 text-brand-white" />,
  edit: <PencilIcon aria-hidden="true" className="w-4 h-4 text-brand-white" />,
};

const IconButtonWithTitle: React.FC<Props> = ({
  addTitle,
  className,
  variant = "create",
  ...restProps
}) => {
  return (
    <button
      type="button"
      className={cx(
        className,
        "inline-flex items-center text-base text-brand-primary "
      )}
      {...restProps}
    >
      <span className="mr-3 rounded-full bg-brand-primary p-2">
        {Icons[variant]}
      </span>
      {addTitle}
    </button>
  );
};

export default IconButtonWithTitle;
