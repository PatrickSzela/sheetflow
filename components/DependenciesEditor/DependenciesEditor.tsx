import {
  ContentTextField,
  ContentTextFieldProps,
} from "@/components/ContentTextField";
import {
  GroupedCells,
  NamedExpressions,
  extractDataFromStringAddress,
} from "@/libs/sheetflow";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  InputLabel,
  Typography,
} from "@mui/material";
import React from "react";

export interface DependenciesEditorProps {
  cells?: GroupedCells;
  namedExpressions?: NamedExpressions;
  onClose?: () => void;
}

type DependencyData = ({ id: string; label: string } & Omit<
  ContentTextFieldProps,
  "id" | "label"
>)[];

interface DependencyAccordion {
  title: string;
  variant: "addresses" | "namedExpressions";
  data: DependencyData;
}

// TODO: transparent Accordion variant

const DependencyAccordion = (props: DependencyAccordion) => {
  const { title, data, variant } = props;

  return (
    <Accordion disableGutters square variant="outlined" defaultExpanded>
      <AccordionSummary
        expandIcon={<ArrowDropDownIcon />}
        aria-controls={title}
        id={title}
      >
        <Typography>{title}</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Box
          display="grid"
          gridTemplateColumns={variant === "addresses" ? "auto auto" : "auto"}
          alignItems="center"
          rowGap={variant === "addresses" ? 1 : 2}
          columnGap={2}
        >
          {data.map(({ id, label, ...rest }) => (
            <React.Fragment key={id}>
              {variant === "addresses" ? (
                <InputLabel htmlFor={id} title={label}>
                  {label}
                </InputLabel>
              ) : null}

              <ContentTextField
                id={id}
                fullWidth
                size="small"
                hiddenLabel={variant === "addresses"}
                label={variant === "addresses" ? undefined : label}
                {...rest}
              />
            </React.Fragment>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export const DependenciesEditor = (props: DependenciesEditorProps) => {
  const { cells = {}, namedExpressions = [], onClose } = props;

  const namedExpressionData: DependencyAccordion["data"] = namedExpressions.map(
    ({ name, scope }) => ({
      id: `${name}_${scope}`,
      reference: name,
      scope,
      label: scope ? `${name} (${scope})` : name,
    })
  );

  return (
    <Box>
      {Object.entries(cells).map(([sheet, cells]) => {
        const data: DependencyAccordion["data"] = cells.map(
          ({ stringAddress, address }) => {
            const { position } = extractDataFromStringAddress(stringAddress);

            return {
              id: stringAddress,
              reference: address,
              label: position,
            };
          }
        );

        return (
          <DependencyAccordion
            key={sheet}
            title={sheet}
            data={data}
            variant="addresses"
          />
        );
      })}

      {namedExpressions.length ? (
        <DependencyAccordion
          title="Named Expressions"
          data={namedExpressionData}
          variant="namedExpressions"
        />
      ) : null}
    </Box>
  );
};
