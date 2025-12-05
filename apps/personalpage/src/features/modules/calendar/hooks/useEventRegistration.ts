import { useState, useCallback, useEffect } from 'react';
import { CalendarEventInput } from '../types';
import { getAvailableGap } from '../utils/dateUtils';
import { DEFAULT_DURATIONS } from '../constants/calendarConstants';

/**
 * Custom hook for managing guest form state
 */
export const useGuestFormState = () => {
    const [isGuestFormVisible, setIsGuestFormVisible] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const resetGuestForm = useCallback(() => {
        setGuestName('');
        setGuestEmail('');
        setGuestPhone('');
        setErrorMessage(null);
    }, []);

    return {
        isGuestFormVisible,
        setIsGuestFormVisible,
        guestName,
        setGuestName,
        guestEmail,
        setGuestEmail,
        guestPhone,
        setGuestPhone,
        errorMessage,
        setErrorMessage,
        resetGuestForm
    };
};

/**
 * Custom hook for managing duration state and available durations
 */
export const useDurationState = (startTime: Date, events: CalendarEventInput[]) => {
    const [duration, setDuration] = useState(30);
    const [availableDurations, setAvailableDurations] = useState<number[]>(DEFAULT_DURATIONS);

    useEffect(() => {
        if (startTime) {
            const availableGap = getAvailableGap(startTime, events);
            const newDurations = DEFAULT_DURATIONS.filter(d => d <= availableGap);
            setAvailableDurations(newDurations);

            if (!newDurations.includes(duration)) {
                console.log("No suitable durations are found");
            }
        }
    }, [startTime, events, duration]);

    return { duration, setDuration, availableDurations };
};



