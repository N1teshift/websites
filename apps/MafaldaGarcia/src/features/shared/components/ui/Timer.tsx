import React, { useEffect, useState, useMemo } from "react";
import { useFallbackTranslation } from "@/features/i18n";

// Event type for upcoming events
interface TimerEvent {
    date: Date | string; // Date of the event
    label?: string; // Description of the event (pre-translated)
    labelKey?: string; // Translation key for the event label
}

/**
 * Calculates the time difference between the current time and a target date.
 *
 * @param targetDate The future date to calculate the time difference from.
 * @returns An object containing the remaining years, months, days, hours, minutes, seconds,
 *          and a boolean `isPast` indicating if the target date has passed.
 */
// Helper function to calculate the time difference between now and the target date
function getTimeLeft(targetDate: Date) {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    // If the date is in the past, return zeroes
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

    // Calculate years, months, days, hours, minutes, seconds
    let years = targetDate.getFullYear() - now.getFullYear();
    let months = targetDate.getMonth() - now.getMonth();
    let days = targetDate.getDate() - now.getDate();
    let hours = targetDate.getHours() - now.getHours();
    let minutes = targetDate.getMinutes() - now.getMinutes();
    let seconds = targetDate.getSeconds() - now.getSeconds();

    // Adjust for negative values
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
        // Get days in previous month
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

// Props for the Timer component
interface TimerProps {
    events: TimerEvent[];
    className?: string; // Optional for custom styling
}

// Timer component displays the time left for all events
/**
 * A component that displays countdown timers for a list of upcoming events.
 *
 * @param props The component props.
 * @param props.events An array of event objects, each containing a date and a label.
 * @param props.className Optional. Additional CSS classes for the container div.
 * @returns A React element displaying the countdown for each event or a message if an event has passed.
 */
const Timer: React.FC<TimerProps> = ({ events, className }) => {
    const { t } = useFallbackTranslation();
    // Memoize the parsed events with their date objects
    const parsedEvents = useMemo(() => {
        return events.map(e => ({
            ...e,
            dateObj: typeof e.date === "string" ? new Date(e.date) : e.date
        }));
    }, [events]);

    // State to hold the time left for each event
    const [timesLeft, setTimesLeft] = useState(() =>
        parsedEvents.map(e => getTimeLeft(e.dateObj))
    );

    useEffect(() => {
        // Update all timers every second
        const interval = setInterval(() => {
            setTimesLeft(parsedEvents.map(e => getTimeLeft(e.dateObj)));
        }, 1000);
        // Clean up the interval on unmount or when events change
        return () => clearInterval(interval);
    }, [parsedEvents]);

    // If there are no events
    if (!parsedEvents.length) {
        return <span className={className}>{t('no_events')}</span>;
    }

    // Display all events with their countdowns or 'has passed' messages
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