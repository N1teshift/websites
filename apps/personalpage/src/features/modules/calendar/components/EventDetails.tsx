import React from 'react';
import { useFallbackTranslation } from '@/features/infrastructure/i18n';
import { CalendarEventClickInfo } from '../types';

interface EventDetailsProps { event: CalendarEventClickInfo; }

/** Shows start/end time for a clicked event. */
const EventDetails: React.FC<EventDetailsProps> = ({ event }) => {
    const { t } = useFallbackTranslation();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-text-primary">{t("occupied_timeslot")}</h2>
            <p className="text-lg text-text-primary">
                <strong>{t("start_time")}: </strong>
                {event.event.start.toLocaleString()}
            </p>
            <p className="text-lg text-text-primary">
                <strong>{t("end_time")}: </strong>
                {event.event.end.toLocaleString()}
            </p>
        </div>
    );
};

export default EventDetails;



