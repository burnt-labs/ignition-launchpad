import React from "react";
import cx from "classnames";

const Button: React.FC<React.ComponentPropsWithoutRef<"button">> = ({
  children,
  disabled,
  className,
  ...restProps
}) => {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center h-16 w-80",
        !disabled
          ? "border border-brand-primary bg-brand-white  text-brand-primary"
          : "bg-brand-gray100 text-brand-white pointer-events-none",
        className
      )}
      {...restProps}
    >
      {children}
    </button>
  );
};

export default Button;
