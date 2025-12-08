import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";
import Image from "next/image";
import NProgress from "nprogress";
import { apiRequest } from "@/lib/api-client";

import { Button } from "@websites/ui";
import { EventDetails, RegistrationMethod, CalendarEventInput } from "../types";
import {
  formatDateTime,
  calculateEndTime,
  PROVIDER_LOGIN_ENDPOINTS,
  GUEST_REGISTRATION_ENDPOINT,
  EVENT_SUMMARY_KEY,
} from "../utils";
import { useGuestFormState, useDurationState } from "../hooks";

interface EventCreationFormProps {
  startTime: Date;
  onGuestEventCreated?: (success: boolean, details?: EventDetails) => void;
  events: CalendarEventInput[];
  setRegistrationMethod: (method: RegistrationMethod) => void;
  setEventDetails: (details: EventDetails) => void;
}

const EventCreationForm: React.FC<EventCreationFormProps> = ({
  startTime,
  onGuestEventCreated,
  events,
  setRegistrationMethod,
  setEventDetails,
}) => {
  const { t, i18n } = useFallbackTranslation();
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  // Fetch user data when needed (for googleId check)
  const [user, setUser] = useState<{ googleId?: string } | null>(null);
  useEffect(() => {
    if (session?.userId && !user) {
      fetch("/api/auth/user/status")
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {
          // Silently fail - user data not critical
        });
    }
  }, [session, user]);

  const canAutoRegisterWithGoogle = isAuthenticated && Boolean(user?.googleId);
  const userLanguage = i18n.language;

  const { duration, setDuration, availableDurations } = useDurationState(startTime, events);
  const {
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
    resetGuestForm,
  } = useGuestFormState();

  const createEventDetails = useCallback(
    (email?: string): EventDetails => ({
      duration,
      startTime: startTime.toISOString(),
      ...(email && { email }),
    }),
    [duration, startTime]
  );

  const handleProviderLogin = useCallback(
    (provider: "google" | "microsoft") => {
      const summary = t(EVENT_SUMMARY_KEY);
      const startDateTime = startTime.toISOString();
      const endDateTime = calculateEndTime(startTime, duration).toISOString();
      const queryParams = new URLSearchParams({ summary, startDateTime, endDateTime });

      setRegistrationMethod(provider);
      setEventDetails(createEventDetails());
      window.location.href = `${PROVIDER_LOGIN_ENDPOINTS[provider]}?${queryParams.toString()}`;
    },
    [t, startTime, duration, setRegistrationMethod, setEventDetails, createEventDetails]
  );

  const handleGoogleLoginClick = () => handleProviderLogin("google");
  const handleMicrosoftLoginClick = () => handleProviderLogin("microsoft");

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const requestPayload = {
      summary: t(EVENT_SUMMARY_KEY),
      startDateTime: startTime.toISOString(),
      endDateTime: calculateEndTime(startTime, duration).toISOString(),
      userEmail: guestEmail,
      userName: guestName,
      userPhone: guestPhone,
      language: userLanguage,
    };

    try {
      NProgress.start();

      // Use centralized apiRequest instead of direct fetch
      await apiRequest<unknown>(GUEST_REGISTRATION_ENDPOINT, "POST", requestPayload);

      // Use the same time that was sent to the API for consistency
      const eventDetails: EventDetails = {
        duration,
        startTime: startTime.toISOString(),
        email: guestEmail,
      };
      setRegistrationMethod("guest");
      setEventDetails(eventDetails);
      onGuestEventCreated?.(true, eventDetails);
      resetGuestForm();
    } catch (error) {
      console.error("Error during guest registration:", error);
      onGuestEventCreated?.(false);
      setErrorMessage(t("event_creation_error"));
    } finally {
      NProgress.done();
    }
  };

  const handleContinueAsGuest = () => setIsGuestFormVisible(true);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-text-primary">{t("plan_new_lesson")}</h2>

      <div className="mb-4">
        <label className="block mb-2 text-lg font-semibold text-text-primary">
          {t("selected_lesson_start_time")}
        </label>
        <p className="text-lg text-text-primary">{formatDateTime(startTime)}</p>
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-lg font-semibold text-text-primary">
          {t("duration")}
        </label>
        <div className="flex space-x-4">
          {availableDurations.map((availableDuration) => (
            <label key={availableDuration}>
              <input
                type="radio"
                value={availableDuration}
                checked={duration === availableDuration}
                onChange={() => setDuration(availableDuration)}
                className="mr-2"
              />
              <span className="text-text-primary">
                {availableDuration} {t("minutes_kilmininkas")}
              </span>
            </label>
          ))}
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 text-text-primary">{t("identify_and_register")}</h3>

      {canAutoRegisterWithGoogle ? (
        <Button onClick={handleGoogleLoginClick} variant="primary" className="w-full">
          {t("register_with_google_account")}
        </Button>
      ) : (
        <>
          <div className="flex flex-col gap-2 mb-4">
            <Button
              onClick={handleGoogleLoginClick}
              variant="secondary"
              className="w-full justify-start"
            >
              <Image
                src="/google-logo.svg"
                alt="Google Icon"
                width={24}
                height={24}
                className="mr-2"
              />
              {t("continue_with_google")}
            </Button>
            <Button
              onClick={handleMicrosoftLoginClick}
              variant="secondary"
              className="w-full justify-start"
            >
              <Image
                src="/ms-logo.svg"
                alt="Microsoft Icon"
                width={24}
                height={24}
                className="mr-2"
              />
              {t("continue_with_microsoft")}
            </Button>
          </div>

          {!isGuestFormVisible ? (
            <Button onClick={handleContinueAsGuest} variant="secondary" className="w-full">
              {t("continue_as_guest")}
            </Button>
          ) : (
            <div className="guest-registration relative p-4 border border-border-default rounded-md bg-surface-card">
              <form onSubmit={handleGuestSubmit}>
                <div className="mb-4">
                  <label className="block mb-2 text-lg font-semibold text-text-primary">
                    {t("your_name")}
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border-default rounded bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-lg font-semibold text-text-primary">
                    {t("your_email")}
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border-default rounded bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-lg font-semibold text-text-primary">
                    {t("your_phone_number")}
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border-default rounded bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full">
                  {t("register")}
                </Button>
              </form>
            </div>
          )}
        </>
      )}

      {errorMessage && <div className="mt-4 text-danger-600 font-semibold">{errorMessage}</div>}
    </div>
  );
};

export default EventCreationForm;
