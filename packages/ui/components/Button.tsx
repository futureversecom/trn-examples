"use client";

import clsx from "clsx";
import { ButtonHTMLAttributes, FC } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  buttonClassName?: string;
  variant?: "small" | "large";
}

export const Button: FC<ButtonProps> = ({
  isLoading,
  buttonClassName,
  type = "button",
  variant = "large",
  children,
  ...props
}) => {
  return (
    <button
      type={type}
      className={clsx(
        buttonClassName,
        isLoading && "loading loading-spinner loading-xs",
        "btn btn-outline focus:outline-none px-5 py-2 bg-indigo-600 hover:bg-indigo-700 hover:text-white focus:ring focus:ring-indigo-300 leading-5 rounded-full font-semibold",
        {
          small: "w-[145px] px-[16px] py-[10px] mx-auto text-sm",
          large: "w-full text-md",
        }[variant]
      )}
      {...props}
    >
      {children}
    </button>
  );
};
