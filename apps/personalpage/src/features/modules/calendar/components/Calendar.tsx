import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Calendar as BigCalendar, View, SlotInfo } from "react-big-calendar";
import { useFallbackTranslation } from '@websites/infrastructure/i18n';
import { createComponentLogger } from "@websites/infrastructure/logging";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { startOfWeek, isBefore, format } from "date-fns";
import { CalendarEventInput, CalendarEventDisplay } from "../types";
import { useCalendarLocalization } from "../hooks/useCalendarLocalization";
import { useCalendarEvents, useSlotOverlapChecker } from "../hooks/useCalendarEvents";
import { useCalendarTimeBounds } from "../hooks/useCalendarTimeBounds";
import { useCalendarStyling } from "../hooks/useCalendarStyling";
import CalendarToolbar from "./CalendarToolbar";
import { ToastNotification } from "@websites/ui";

const SLOT_DURATION_MINUTES = 30;
const SLOT_DURATION_MS = SLOT_DURATION_MINUTES * 60 * 1000;

const roundToNextSlot = (date: Date, slotMinutes = SLOT_DURATION_MINUTES) => {
    const rounded = new Date(date);
    const minutes = rounded.getMinutes();
    const remainder = minutes % slotMinutes;
    if (remainder !== 0) {
        rounded.setMinutes(minutes + (slotMinutes - remainder), 0, 0);
    } else if (rounded.getSeconds() !== 0 || rounded.getMilliseconds() !== 0) {
        rounded.setMinutes(minutes, 0, 0);
    }
    rounded.setSeconds(0, 0);
    return rounded;
};

export interface LessonSchedulerProps {
    events: CalendarEventInput[];
    onEventClick: (event: { event: { id?: string; start: Date; end: Date; title: string } }) => void;
    clickedEventId: string | null;
    onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
    calendarRef: React.RefObject<any>;
}

const LessonScheduler: React.FC<LessonSchedulerProps> = ({
    events,
    onEventClick,
    clickedEventId,
    onSelectSlot,
    calendarRef
}) => {
    const translation = useFallbackTranslation();
    const { t, i18n } = translation;
    const [currentView, setCurrentView] = useState<View>("week");
    const [currentDate, setCurrentDate] = useState<Date | null>(null);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const logger = createComponentLogger('Calendar');
    const { localizer, formats, locale } = useCalendarLocalization(i18n.language);
    const calendarEvents = useCalendarEvents(events, t);
    const isSlotOverlapping = useSlotOverlapChecker(calendarEvents);
    const { sixHoursFromNow, minTime, maxTime, offset } = useCalendarTimeBounds();
    const { eventStyleGetter, dayPropGetter, slotPropGetter } = useCalendarStyling(clickedEventId, selectedSlotId);
    const minWeekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
    const [slotWarningVisible, setSlotWarningVisible] = useState(false);
    const [slotWarningTime, setSlotWarningTime] = useState<Date | null>(null);
    const canNavigatePrev = useMemo(() => {
        if (!currentDate) {
            return false;
        }
        const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        return currentWeekStart.getTime() > minWeekStart.getTime();
    }, [currentDate, minWeekStart]);

    const getNextAvailableSlot = useCallback(() => {
        let candidateStart = roundToNextSlot(sixHoursFromNow);
        const maxIterations = 96; // Search up to 48 hours ahead
        for (let i = 0; i < maxIterations; i++) {
            const candidateEnd = new Date(candidateStart.getTime() + SLOT_DURATION_MS);
            if (!isSlotOverlapping(candidateStart, candidateEnd)) {
                return { start: candidateStart, end: candidateEnd };
            }
            candidateStart = candidateEnd;
        }
        return null;
    }, [sixHoursFromNow, isSlotOverlapping]);
    const slotWarningValues = useMemo(() => {
        if (!slotWarningTime) {
            return undefined;
        }
        return {
            time: format(slotWarningTime, "PPpp", { locale }),
        };
    }, [slotWarningTime, locale]);

    // Ensure component only renders on client to prevent hydration issues
    useEffect(() => {
        setIsMounted(true);
        setCurrentDate(new Date());
    }, []);

    useEffect(() => {
        logger.debug("Timezone offset calculation", { offset });
    }, [offset, logger]);

    // Handle slot selection
    const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
        const { start, end } = slotInfo;

        // Check if slot is 6 hours in the future
        if (start < sixHoursFromNow) {
            logger.info("Slot rejected because it is too soon", { start, sixHoursFromNow });
            const replacementSlot = getNextAvailableSlot();
            if (replacementSlot) {
                logger.info("Auto-selected nearest available slot", replacementSlot);
                setSlotWarningTime(replacementSlot.start);
                setSlotWarningVisible(true);
                setSelectedSlotId(replacementSlot.start.toISOString());
                onSelectSlot(replacementSlot);
            } else {
                logger.warn("Unable to find available slot within search window");
                setSlotWarningTime(roundToNextSlot(sixHoursFromNow));
                setSlotWarningVisible(true);
            }
            return;
        }

        // Check duration (should be 30 minutes max)
        const durationInMinutes = (end.getTime() - start.getTime()) / 60000;
        if (durationInMinutes <= 30) {
            // Check for overlap
            if (!isSlotOverlapping(start, end)) {
                logger.debug("Slot selected", { start, end });
                setSelectedSlotId(start.toISOString());
                onSelectSlot({ start, end });
            } else {
                logger.warn("Selected slot overlaps with an existing event");
            }
        }
    }, [sixHoursFromNow, isSlotOverlapping, onSelectSlot, logger, getNextAvailableSlot]);

    // Handle event click
    const handleEventClick = useCallback((event: CalendarEventDisplay) => {
        logger.info("Event clicked", { start: event.start, end: event.end });
        onEventClick({
            event: {
                id: event.id,
                start: event.start,
                end: event.end,
                title: event.title,
            }
        });
    }, [onEventClick, logger]);

    const handleNavigate = useCallback((date: Date) => {
        if (isBefore(date, minWeekStart)) {
            logger.debug("Prevented navigation to past week", { requestedDate: date });
            setCurrentDate(minWeekStart);
            return;
        }
        setCurrentDate(date);
    }, [minWeekStart, logger]);

    // Don't render until mounted on client
    if (!isMounted || !currentDate) {
        return <div className="h-[600px] w-full flex items-center justify-center text-text-primary">Loading calendar...</div>;
    }

    return (
        <div className="h-full w-full overflow-hidden">
            <BigCalendar
                ref={calendarRef}
                localizer={localizer as any}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                view={currentView}
                onView={setCurrentView}
                date={currentDate}
                onNavigate={handleNavigate}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleEventClick}
                selectable
                eventPropGetter={eventStyleGetter}
                dayPropGetter={dayPropGetter}
                slotPropGetter={slotPropGetter}
                min={minTime}
                max={maxTime}
                formats={formats}
                views={['month', 'week', 'day']}
                defaultView="week"
                step={30}
                timeslots={2}
                culture={i18n.language}
                className="rbc-calendar-tailwind"
                components={{
                    toolbar: (toolbarProps) => (
                        <CalendarToolbar
                            {...toolbarProps}
                            canNavigatePrev={canNavigatePrev}
                        />
                    ),
                }}
            />
            <ToastNotification
                messageKey="soonest_available_slot"
                messageValues={slotWarningValues}
                visible={slotWarningVisible}
                type="warning"
                duration={6000}
                onClose={() => setSlotWarningVisible(false)}
            />
        </div>
    );
};

export default LessonScheduler;



