import { CellContent, Reference, useContent } from "@/libs/sheetflow";
import { TextField, TextFieldProps } from "@mui/material";
import { ChangeEventHandler, useCallback } from "react";

export type ContentTextFieldProps = {
  reference: Reference;
  scope?: string;
} & Omit<TextFieldProps, "value" | "defaultValue">;

export const ContentTextField = (props: ContentTextFieldProps) => {
  const { reference, scope, ...restProps } = props;

  const { content, setContent } = useContent(reference, scope);

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const value = e.currentTarget.value;
      let newValue: CellContent;

      if (value === "") {
        newValue = null;
      } else if (!Number.isNaN(Number(value))) {
        newValue = Number(value);
      } else {
        newValue = value;
      }

      setContent(newValue);
    },
    [setContent]
  );

  return <TextField {...restProps} onChange={onChange} value={content ?? ""} />;
};
