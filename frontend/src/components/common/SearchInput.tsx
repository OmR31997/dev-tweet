"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";

type SearchInputProps = Omit<ComponentProps<typeof Input>, "type"> & {
  wrapperClassName?: string;
  clearLabel?: string;
};

export function SearchInput({
  value,
  onChange,
  className,
  wrapperClassName,
  clearLabel,
  ...props
}: SearchInputProps) {
  const tc = useTranslations("Common");
  const text = typeof value === "string" ? value : String(value ?? "");
  const showClear = text.length > 0;

  const clear = () => {
    onChange?.({
      target: { value: "" },
      currentTarget: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className={cn("relative", wrapperClassName)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={onChange}
        className={cn(
          "pl-9 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
          showClear && "pr-9",
          className,
        )}
        {...props}
      />
      {showClear ? (
        <button
          type="button"
          onClick={clear}
          className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={clearLabel ?? tc("clearSearch")}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
