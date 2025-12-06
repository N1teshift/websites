import { useState, useCallback, useRef, useMemo } from "react";
import NProgress from 'nprogress';
import { GraphEvent } from "../types";
import { getCache, setCache, makeCacheKey, clearCache } from "@websites/infrastructure/cache";
import { TemporaryEvent } from "../types";
import { createComponentLogger } from "@websites/infrastructure/logging";
import { apiRequest } from '@/lib/api-client';

// 5 minutes cache expiry (in ms) - module scope constant
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Custom hook for fetching and managing calendar events.
 *
 * Handles fetching events from an API endpoint defined by `NEXT_PUBLIC_GOOGLE_CALENDAR_API_URL`,
 * transforms them into the format required by React Big Calendar (`CalendarEventInput[]`), manages loading state with NProgress,
 * and implements caching with localStorage.
 * Now also supports temporary events for immediate visual feedback.
 *
 * @returns An object containing:
 *  - `events`: The array of fetched and transformed calendar events (including temporary ones).
 *  - `fetchEvents`: A function to trigger fetching events (optionally forcing a refresh to bypass cache).
 *  - `clearEventsCache`: A function to manually clear the cached events.
 *  - `addTemporaryEvent`: A function to add a temporary event for immediate display.
 *  - `removeTemporaryEvents`: A function to remove all temporary events.
 */
export function useCalendarData() {
    const [rawEvents, setRawEvents] = useState<GraphEvent[]>([]);
    const [temporaryEvents, setTemporaryEvents] = useState<TemporaryEvent[]>([]);

    // Use language as part of the cache key for i18n support
    const lang = typeof window !== 'undefined' ? window.localStorage.getItem('i18nextLng') || 'en' : 'en';
    const cacheKey = makeCacheKey('calendar-events', lang);

    // Use a ref to store the setTemporaryEvents function to avoid recreation
    const setTemporaryEventsRef = useRef(setTemporaryEvents);
    setTemporaryEventsRef.current = setTemporaryEvents;

    const fetchEvents = useCallback(async (forceRefresh = false) => {
        const logger = createComponentLogger('CalendarData', 'fetchEvents');

        try {
            NProgress.start();

            // If not forcing refresh, try to get events from cache first
            if (!forceRefresh) {
                const cached = getCache<GraphEvent[]>(cacheKey);
                if (cached) {
                    setRawEvents(cached);
                    NProgress.done();
                    return;
                }
            }

            logger.info('Fetching calendar events from API');

            // Use the centralized apiRequest system
            const data = await apiRequest<GraphEvent[]>('/api/calendar/calendar-events-google', 'GET');

            setRawEvents(data);
            // Cache the raw events for 5 minutes (persist in localStorage for cross-tab support)
            setCache<GraphEvent[]>(cacheKey, data, { persist: true, expiryMs: CACHE_EXPIRY_MS });

            // Remove only the temporary events that now exist in the fetched data
            setTemporaryEventsRef.current((prev: TemporaryEvent[]) =>
                prev.filter((tempEvent) => !doesGraphEventMatchTemporaryEvent(tempEvent, data))
            );

            logger.info('Successfully fetched calendar events', { eventCount: data.length });
        } catch (error) {
            logger.error('Error fetching calendar events', error instanceof Error ? error : new Error(String(error)));
        } finally {
            NProgress.done();
        }
    }, [cacheKey]);

    // Optionally, provide a way to clear the cache (e.g., after event creation)
    const clearEventsCache = useCallback(() => {
        clearCache(cacheKey);
    }, [cacheKey]);

    // Add temporary event for immediate display
    const addTemporaryEvent = useCallback((tempEvent: TemporaryEvent) => {
        setTemporaryEventsRef.current((prev: TemporaryEvent[]) => {
            // Check if we already have a temporary event for this time slot
            const existingEvent = prev.find((event: TemporaryEvent) =>
                event.start === tempEvent.start &&
                event.end === tempEvent.end
            );

            if (existingEvent) {
                return prev;
            }

            return [...prev, tempEvent];
        });
    }, []);

    // Remove a specific temporary event (e.g., after confirmation or timeout)
    const removeTemporaryEventById = useCallback((tempEventId: string) => {
        setTemporaryEventsRef.current((prev: TemporaryEvent[]) =>
            prev.filter((tempEvent) => tempEvent.id !== tempEventId)
        );
    }, []);

    // Remove all temporary events (legacy helper)
    const removeTemporaryEvents = useCallback(() => {
        setTemporaryEvents([]);
    }, []);

    // Transform raw events to React Big Calendar format with current translations
    const events = useMemo(() => {
        return rawEvents.map((event) => ({
            id: event.id,
            title: "occupied", // Use translation key that will be translated at component level
            start: event.start.dateTime,
            end: event.end.dateTime,
        }));
    }, [rawEvents]);

    // Transform temporary events to React Big Calendar format with current translations
    const translatedTemporaryEvents = useMemo(() => {
        return temporaryEvents.map((tempEvent) => ({
            ...tempEvent,
            title: tempEvent.title || "occupied", // Use title if available, otherwise fallback to translation key
        }));
    }, [temporaryEvents]);

    // Combine regular events with temporary events
    const allEvents = [...events, ...translatedTemporaryEvents];

    return {
        events: allEvents,
        fetchEvents,
        clearEventsCache,
        addTemporaryEvent,
        removeTemporaryEventById,
        removeTemporaryEvents
    };
}

function doesGraphEventMatchTemporaryEvent(tempEvent: TemporaryEvent, events: GraphEvent[]): boolean {
    return events.some((graphEvent) =>
        graphEvent.start.dateTime === tempEvent.start &&
        graphEvent.end.dateTime === tempEvent.end
    );
}



