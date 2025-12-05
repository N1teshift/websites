import EmwNavbar from './EmwNavbar';
import dynamic from 'next/dynamic';
const Timer = dynamic(() => import('@/features/infrastructure/shared/components/ui/Timer'), { ssr: false });

// Array of upcoming election events with ISO `date` and translation `labelKey`
const UPCOMING_EVENTS = [
    {
        date: '2027-03-01T00:00:00Z',
        labelKey: 'municipal_elections',
    },
    {
        date: '2028-10-08T00:00:00Z',
        labelKey: 'seimas_elections',
    },
    {
        date: '2029-05-01T00:00:00Z',
        labelKey: 'presidential_elections',
    },
    {
        date: '2029-06-01T00:00:00Z',
        labelKey: 'eu_parliament_elections',
    },
];

export default function EmwHomePage() {
    return (
        <>
            <EmwNavbar />
            <Timer events={UPCOMING_EVENTS} className="text-text-primary" />
        </>
    );
}



