import { formatDateTime, calculateEndTime, getAvailableGap } from './dateUtils';
import { CalendarEventInput } from '../types';

describe('dateUtils', () => {
  describe('formatDateTime', () => {
    it('should format a date correctly', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      const formatted = formatDateTime(date);

      // Format should be a non-empty string with date and time
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
      
      // Should contain date components (format varies by locale, so just check it's formatted)
      expect(formatted).toMatch(/\d/); // Contains at least one digit
    });

    it('should handle different dates and produce different outputs', () => {
      const date1 = new Date('2024-12-31T23:59:59Z');
      const date2 = new Date('2024-01-01T00:00:00Z');

      const formatted1 = formatDateTime(date1);
      const formatted2 = formatDateTime(date2);

      // Different dates should produce different formatted strings
      expect(formatted1).not.toBe(formatted2);
      expect(formatted1).toBeTruthy();
      expect(formatted2).toBeTruthy();
    });

    it('should return consistent format for same date', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const formatted1 = formatDateTime(date);
      const formatted2 = formatDateTime(date);

      // Same date should produce same formatted string
      expect(formatted1).toBe(formatted2);
    });
  });

  describe('calculateEndTime', () => {
    it('should calculate end time correctly for positive duration', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const durationMinutes = 30;

      const endTime = calculateEndTime(startTime, durationMinutes);

      expect(endTime.getTime()).toBe(startTime.getTime() + 30 * 60 * 1000);
    });

    it('should calculate end time correctly for 60 minutes', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const durationMinutes = 60;

      const endTime = calculateEndTime(startTime, durationMinutes);

      expect(endTime.getTime()).toBe(startTime.getTime() + 60 * 60 * 1000);
    });

    it('should handle zero duration', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const durationMinutes = 0;

      const endTime = calculateEndTime(startTime, durationMinutes);

      expect(endTime.getTime()).toBe(startTime.getTime());
    });

    it('should handle large durations', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const durationMinutes = 1440; // 24 hours

      const endTime = calculateEndTime(startTime, durationMinutes);

      expect(endTime.getTime()).toBe(startTime.getTime() + 1440 * 60 * 1000);
    });
  });

  describe('getAvailableGap', () => {
    it('should return Infinity when no events exist', () => {
      const slotStart = new Date('2024-01-01T10:00:00Z');
      const events: CalendarEventInput[] = [];

      const gap = getAvailableGap(slotStart, events);

      expect(gap).toBe(Infinity);
    });

    it('should return Infinity when all events are before slot start', () => {
      const slotStart = new Date('2024-01-01T12:00:00Z');
      const events: CalendarEventInput[] = [
        { start: '2024-01-01T10:00:00Z', end: '2024-01-01T11:00:00Z' },
        { start: '2024-01-01T11:00:00Z', end: '2024-01-01T11:30:00Z' },
      ];

      const gap = getAvailableGap(slotStart, events);

      expect(gap).toBe(Infinity);
    });

    it('should calculate gap correctly for single future event', () => {
      const slotStart = new Date('2024-01-01T10:00:00Z');
      const events: CalendarEventInput[] = [
        { start: '2024-01-01T12:00:00Z', end: '2024-01-01T13:00:00Z' },
      ];

      const gap = getAvailableGap(slotStart, events);

      // 2 hours = 120 minutes
      expect(gap).toBe(120);
    });

    it('should return smallest gap when multiple future events exist', () => {
      const slotStart = new Date('2024-01-01T10:00:00Z');
      const events: CalendarEventInput[] = [
        { start: '2024-01-01T15:00:00Z', end: '2024-01-01T16:00:00Z' }, // 5 hours
        { start: '2024-01-01T11:30:00Z', end: '2024-01-01T12:00:00Z' }, // 1.5 hours (smallest)
        { start: '2024-01-01T13:00:00Z', end: '2024-01-01T14:00:00Z' }, // 3 hours
      ];

      const gap = getAvailableGap(slotStart, events);

      // Should return 90 minutes (1.5 hours)
      expect(gap).toBe(90);
    });

    it('should ignore events at exactly the slot start time', () => {
      const slotStart = new Date('2024-01-01T10:00:00Z');
      const events: CalendarEventInput[] = [
        { start: '2024-01-01T10:00:00Z', end: '2024-01-01T11:00:00Z' }, // At slot start
        { start: '2024-01-01T11:30:00Z', end: '2024-01-01T12:00:00Z' }, // Future event
      ];

      const gap = getAvailableGap(slotStart, events);

      // Should return gap to the future event (90 minutes)
      expect(gap).toBe(90);
    });

    it('should handle fractional minutes correctly', () => {
      const slotStart = new Date('2024-01-01T10:00:00Z');
      const events: CalendarEventInput[] = [
        { start: '2024-01-01T10:30:00Z', end: '2024-01-01T11:00:00Z' }, // 30 minutes
      ];

      const gap = getAvailableGap(slotStart, events);

      expect(gap).toBe(30);
    });
  });
});




