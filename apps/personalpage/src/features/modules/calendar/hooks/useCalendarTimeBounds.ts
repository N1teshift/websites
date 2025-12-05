import { useCallback, useMemo } from "react";

const VILNIUS_TIMEZONE = "Europe/Vilnius";
const VILNIUS_MIN_HOUR = 9;
const VILNIUS_MAX_HOUR = 22;

const toLocalHour = (vilniusHour: number, offset: number) => (vilniusHour + offset + 24) % 24;

const hourToDate = (hour: number) => {
    const date = new Date();
    date.setHours(Math.floor(hour), 0, 0, 0);
    return date;
};

export const useCalendarTimeBounds = () => {
    const sixHoursFromNow = useMemo(() => {
        const date = new Date();
        date.setHours(date.getHours() + 6);
        return date;
    }, []);

    const getVilniusToLocalOffsetHours = useCallback(() => {
        const now = new Date();
        const vilniusTime = new Date(now.toLocaleString("en-US", { timeZone: VILNIUS_TIMEZONE }));
        const localTime = new Date(now.toLocaleString("en-US"));
        const diffMs = localTime.getTime() - vilniusTime.getTime();
        return diffMs / (1000 * 60 * 60);
    }, []);

    const offset = useMemo(() => getVilniusToLocalOffsetHours(), [getVilniusToLocalOffsetHours]);

    const minTime = useMemo(() => hourToDate(toLocalHour(VILNIUS_MIN_HOUR, offset)), [offset]);
    const maxTime = useMemo(() => hourToDate(toLocalHour(VILNIUS_MAX_HOUR, offset)), [offset]);

    return {
        sixHoursFromNow,
        minTime,
        maxTime,
        offset,
    };
};




