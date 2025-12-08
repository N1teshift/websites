import { useMemo } from "react";
import { dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "@websites/infrastructure/date-fns";
import { lt, ru, enUS } from "@websites/infrastructure/date-fns/locale";

export const useCalendarLocalization = (language: string) => {
  const locale = useMemo(() => {
    switch (language) {
      case "en":
        return enUS;
      case "ru":
        return ru;
      default:
        return lt;
    }
  }, [language]);

  const localizer = useMemo(() => {
    const locales = { [language]: locale };

    return dateFnsLocalizer({
      format,
      parse,
      startOfWeek: (date: Date) => startOfWeek(date, { locale, weekStartsOn: 1 }),
      getDay,
      locales,
    });
  }, [language, locale]);

  const formats = useMemo(
    () => ({
      timeGutterFormat: (date: Date) => format(date, "HH:mm"),
      eventTimeRangeFormat: () => "",
    }),
    []
  );

  return { localizer, formats, locale };
};
