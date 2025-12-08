import {
  transformToGoogleEvent,
  transformToGoogleServiceAccountEvent,
  transformToMicrosoftEvent,
} from "./eventTransformer";
import { SharedEventDetails } from "../types";

describe("eventTransformer", () => {
  const baseEvent: SharedEventDetails = {
    summary: "Test Event",
    startDateTime: "2024-01-01T10:00:00Z",
    endDateTime: "2024-01-01T11:00:00Z",
  };

  describe("transformToGoogleEvent", () => {
    it("should transform basic event details correctly", () => {
      const result = transformToGoogleEvent(baseEvent);

      expect(result.summary).toBe("Test Event");
      expect(result.start.dateTime).toBe("2024-01-01T10:00:00Z");
      expect(result.end.dateTime).toBe("2024-01-01T11:00:00Z");
    });

    it("should transform event with attendees correctly", () => {
      const event: SharedEventDetails = {
        ...baseEvent,
        attendees: [
          { email: "test@example.com", name: "Test User" },
          { email: "another@example.com", name: "Another User" },
        ],
      };

      const result = transformToGoogleEvent(event);

      expect(result.attendees).toHaveLength(2);
      expect(result.attendees?.[0].email).toBe("test@example.com");
      expect(result.attendees?.[0].displayName).toBe("Test User");
      expect(result.attendees?.[1].email).toBe("another@example.com");
      expect(result.attendees?.[1].displayName).toBe("Another User");
    });

    it("should handle missing attendees", () => {
      const result = transformToGoogleEvent(baseEvent);

      expect(result.attendees).toBeUndefined();
    });

    it("should handle empty attendees array", () => {
      const event: SharedEventDetails = {
        ...baseEvent,
        attendees: [],
      };

      const result = transformToGoogleEvent(event);

      expect(result.attendees).toEqual([]);
    });
  });

  describe("transformToGoogleServiceAccountEvent", () => {
    it("should transform basic event details correctly", () => {
      const result = transformToGoogleServiceAccountEvent(baseEvent);

      expect(result.summary).toBe("Test Event");
      expect(result.start.dateTime).toBe("2024-01-01T10:00:00Z");
      expect(result.end.dateTime).toBe("2024-01-01T11:00:00Z");
    });

    it("should include guest information in description when attendee exists", () => {
      const event: SharedEventDetails = {
        ...baseEvent,
        attendees: [{ email: "test@example.com", name: "Test User" }],
        phoneNumber: "+1234567890",
      };

      const result = transformToGoogleServiceAccountEvent(event);

      expect(result.description).toContain("Guest Information:");
      expect(result.description).toContain("Name: Test User");
      expect(result.description).toContain("Email: test@example.com");
      expect(result.description).toContain("Phone: +1234567890");
    });

    it("should handle missing name for attendee", () => {
      const event: SharedEventDetails = {
        ...baseEvent,
        attendees: [{ email: "test@example.com" }],
      };

      const result = transformToGoogleServiceAccountEvent(event);

      expect(result.description).toContain("Name: Not provided");
      expect(result.description).toContain("Email: test@example.com");
    });

    it("should not include description when no attendees", () => {
      const result = transformToGoogleServiceAccountEvent(baseEvent);

      expect(result.description).toBeUndefined();
    });

    it("should not include phone number in description when not provided", () => {
      const event: SharedEventDetails = {
        ...baseEvent,
        attendees: [{ email: "test@example.com", name: "Test User" }],
      };

      const result = transformToGoogleServiceAccountEvent(event);

      expect(result.description).not.toContain("Phone:");
    });
  });

  describe("transformToMicrosoftEvent", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should transform basic event details correctly", () => {
      const result = transformToMicrosoftEvent(baseEvent);

      expect(result.subject).toBe("Test Event");
      expect(result.start.dateTime).toBe("2024-01-01T10:00:00Z");
      expect(result.end.dateTime).toBe("2024-01-01T11:00:00Z");
    });

    it("should use default timezone when env var not set", () => {
      delete process.env.NEXT_PUBLIC_CALENDAR_TIMEZONE;

      const result = transformToMicrosoftEvent(baseEvent);

      expect(result.start.timeZone).toBe("UTC");
      expect(result.end.timeZone).toBe("UTC");
    });

    it("should use custom timezone from env var", () => {
      process.env.NEXT_PUBLIC_CALENDAR_TIMEZONE = "America/New_York";

      const result = transformToMicrosoftEvent(baseEvent);

      expect(result.start.timeZone).toBe("America/New_York");
      expect(result.end.timeZone).toBe("America/New_York");
    });

    it("should transform attendees correctly", () => {
      const event: SharedEventDetails = {
        ...baseEvent,
        attendees: [
          { email: "test@example.com", name: "Test User" },
          { email: "another@example.com", name: "Another User" },
        ],
      };

      const result = transformToMicrosoftEvent(event);

      expect(result.attendees).toHaveLength(2);
      expect(result.attendees?.[0].emailAddress.address).toBe("test@example.com");
      expect(result.attendees?.[0].emailAddress.name).toBe("Test User");
      expect(result.attendees?.[0].type).toBe("required");
      expect(result.attendees?.[1].emailAddress.address).toBe("another@example.com");
      expect(result.attendees?.[1].emailAddress.name).toBe("Another User");
    });

    it("should handle missing name for attendee", () => {
      const event: SharedEventDetails = {
        ...baseEvent,
        attendees: [{ email: "test@example.com" }],
      };

      const result = transformToMicrosoftEvent(event);

      expect(result.attendees?.[0].emailAddress.name).toBe("");
    });

    it("should set online meeting properties", () => {
      const result = transformToMicrosoftEvent(baseEvent);

      expect(result.isOnlineMeeting).toBe(true);
      expect(result.onlineMeetingProvider).toBe("teamsForBusiness");
    });

    it("should use custom online meeting provider from env var", () => {
      process.env.NEXT_PUBLIC_CALENDAR_ONLINE_MEETING_PROVIDER = "skypeForBusiness";

      const result = transformToMicrosoftEvent(baseEvent);

      expect(result.onlineMeetingProvider).toBe("skypeForBusiness");
    });
  });
});
