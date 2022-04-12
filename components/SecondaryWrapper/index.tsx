import React from "react";
import cx from "classnames";

const SecondaryWrapper: React.FC<React.ComponentPropsWithoutRef<"div">> = ({
  children,
  className,
  ...restProps
}) => {
  return (
    <div
      className={cx("max-w-screen-1440 mx-auto px-14", className)}
      {...restProps}
    >
      {children}
    </div>
  );
};

export default SecondaryWrapper;
