import React, { useEffect, useState, useMemo } from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface TimerEvent {
    date: Date | string;
    label?: string;
    labelKey?: string;
}

function getTimeLeft(targetDate: Date) {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
        return {
            years: 0,
            months: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isPast: true,
        };
    }

    let years = targetDate.getFullYear() - now.getFullYear();
    let months = targetDate.getMonth() - now.getMonth();
    let days = targetDate.getDate() - now.getDate();
    let hours = targetDate.getHours() - now.getHours();
    let minutes = targetDate.getMinutes() - now.getMinutes();
    let seconds = targetDate.getSeconds() - now.getSeconds();

    if (seconds < 0) {
        seconds += 60;
        minutes--;
    }
    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    if (hours < 0) {
        hours += 24;
        days--;
    }
    if (days < 0) {
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
    }
    if (months < 0) {
        months += 12;
        years--;
    }

    return {
        years: Math.max(0, years),
        months: Math.max(0, months),
        days: Math.max(0, days),
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        seconds: Math.max(0, seconds),
        isPast: false,
    };
}

interface TimerProps {
    events: TimerEvent[];
    className?: string;
}

const Timer: React.FC<TimerProps> = ({ events, className }) => {
    const { t } = useFallbackTranslation();
    const parsedEvents = useMemo(() => {
        return events.map(e => ({
            ...e,
            dateObj: typeof e.date === "string" ? new Date(e.date) : e.date
        }));
    }, [events]);

    const [timesLeft, setTimesLeft] = useState(() =>
        parsedEvents.map(e => getTimeLeft(e.dateObj))
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setTimesLeft(parsedEvents.map(e => getTimeLeft(e.dateObj)));
        }, 1000);
        return () => clearInterval(interval);
    }, [parsedEvents]);

    if (!parsedEvents.length) {
        return <span className={className}>{t('no_events')}</span>;
    }

    return (
        <div className={className}>
            {parsedEvents.map((event, idx) => {
                const timeLeft = timesLeft[idx];
                return (
                    <div key={(event.label || event.labelKey || 'event') + event.date} className="mb-2">
                        <span className="font-bold">{event.label || (event.labelKey ? t(event.labelKey) : 'Untitled Event')}</span>{' - '}
                        {timeLeft && !timeLeft.isPast ? (
                            <span className="font-mono">
                                {t('timer_left', {
                                    years: timeLeft.years,
                                    years_short: t('years_short'),
                                    months: timeLeft.months,
                                    months_short: t('months_short'),
                                    days: timeLeft.days,
                                    days_short: t('days_short'),
                                    hours: timeLeft.hours,
                                    hours_short: t('hours_short'),
                                    minutes: timeLeft.minutes,
                                    minutes_short: t('minutes_short'),
                                    seconds: timeLeft.seconds,
                                    seconds_short: t('seconds_short')
                                })}
                            </span>
                        ) : (
                            <span className="text-gray-500">- {t('has_passed')}</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Timer;

