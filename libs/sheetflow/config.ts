export const findMostSimilarLanguage = (
  languages: string[],
  supportedLanguages: string[],
): string => {
  if (!languages.length) languages = ["en-US"];

  for (const lang of languages) {
    if (supportedLanguages.includes(lang)) return lang;
  }

  for (const lang of languages) {
    for (const supportedLang of supportedLanguages) {
      if (supportedLang.startsWith(lang)) return supportedLang;
    }
  }

  return "en-US";
};

export const getPrettyLanguage = (
  languageCode: string,
  supportedLanguages: string[],
): string => {
  let langsWithMultipleRegions = supportedLanguages.map((i) => i.slice(0, 2));

  langsWithMultipleRegions = langsWithMultipleRegions.filter(
    (i, idx) => langsWithMultipleRegions.indexOf(i) !== idx,
  );

  const lang = languageCode.slice(0, 2);
  const region = languageCode.slice(3);

  const prettyLang = new Intl.DisplayNames([], {
    type: "language",
    style: "short",
    languageDisplay: "standard",
  }).of(lang);
  const prettyRegion = new Intl.DisplayNames([], {
    type: "region",
    style: "short",
  }).of(region);

  if (!prettyLang) throw new Error(`Unknown language \`${languageCode}\`}`);

  if (langsWithMultipleRegions.includes(lang)) {
    return `${prettyLang} (${prettyRegion ?? languageCode})`;
  } else {
    return prettyLang;
  }
};
