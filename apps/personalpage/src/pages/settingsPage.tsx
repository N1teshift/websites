import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/features/infrastructure/shared/components/ui/Layout';
import { Button } from '@/features/infrastructure/shared/components/ui/Button';
import { useAuth } from '@/features/infrastructure/auth/AuthContext';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('SettingsPage');

/**
 * Settings page - only accessible when logged in
 */
export default function SettingsPage() {
    const { isAuthenticated, isLoading, user, refreshAuth } = useAuth();
    const router = useRouter();
    const { t } = useFallbackTranslation(['common', 'settings']);
    
    const [nickname, setNickname] = useState('');
    const [language, setLanguage] = useState('en');
    const [theme, setTheme] = useState('light');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            logger.info('Unauthenticated user attempted to access settings, redirecting to home');
            router.push('/');
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (user) {
            setNickname(user.nickname || '');
            setLanguage(user.preferences?.language || router.locale || 'en');
            if (typeof window !== 'undefined') {
                const currentTheme = document.body.getAttribute('data-theme') || user.preferences?.theme || 'light';
                setTheme(currentTheme);
            } else {
                setTheme(user.preferences?.theme || 'light');
            }
        } else if (!isLoading) {
            // Set defaults from current state if user not loaded yet
            if (router.locale) {
                setLanguage(router.locale);
            }
            if (typeof window !== 'undefined') {
                const currentTheme = document.body.getAttribute('data-theme') || 'light';
                setTheme(currentTheme);
            }
        }
    }, [user, router.locale, isLoading]);

    const hasChanges = () => {
        if (!user) return false;
        
        const currentNickname = user.nickname || '';
        const currentLanguage = user.preferences?.language || router.locale || 'en';
        const currentTheme = user.preferences?.theme || (typeof window !== 'undefined' ? document.body.getAttribute('data-theme') : null) || 'light';
        
        return nickname !== currentNickname || 
               language !== currentLanguage || 
               theme !== currentTheme;
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        setSaveMessage(null);
        
        try {
            const response = await fetch('/api/auth/user/update-userdata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nickname, language, theme }),
            });

            const data = await response.json();

            if (response.ok) {
                setSaveMessage(t('settings_saved', 'Settings saved successfully!'));
                
                // Apply changes immediately
                if (language !== router.locale) {
                    router.push(router.asPath, router.asPath, { locale: language });
                }
                if (typeof window !== 'undefined' && theme !== document.body.getAttribute('data-theme')) {
                    document.body.setAttribute('data-theme', theme);
                }
                
                await refreshAuth();
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                setSaveMessage(data.message || t('save_failed', 'Failed to save settings'));
            }
        } catch (error) {
            logger.error('Error saving settings', error instanceof Error ? error : new Error(String(error)));
            setSaveMessage(t('save_error', 'An error occurred while saving'));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Layout titleKey="settings" mode="centered">
                <div className="text-text-secondary">Loading...</div>
            </Layout>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Layout titleKey="settings" mode="top" goBackTarget="/">
            <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
                <div className="bg-surface-card rounded-lg p-6 shadow-medium">
                    <h2 className="text-2xl font-bold text-text-primary mb-4">
                        {t('user_profile', 'User Profile')}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                {t('user_id', 'User ID')}
                            </label>
                            <p className="text-text-primary font-mono text-sm bg-surface-button p-2 rounded">
                                {user?.id}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                {t('nickname', 'Nickname')}
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder={t('enter_nickname', 'Enter your nickname')}
                                maxLength={50}
                                className="w-full bg-surface-button border border-border-default rounded-md px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-surface-card rounded-lg p-6 shadow-medium">
                    <h2 className="text-2xl font-bold text-text-primary mb-4">
                        {t('preferences', 'Preferences')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-3">
                                {t('language', 'Language')}
                            </label>
                            <div className="flex space-x-2">
                                {['lt', 'en', 'ru'].map((lang) => (
                                    <Button
                                        key={lang}
                                        onClick={() => setLanguage(lang)}
                                        variant={language === lang ? "primary" : "subliminal"}
                                        size="sm"
                                        className={language === lang ? "" : "bg-surface-button hover:bg-surface-button-hover"}
                                    >
                                        {lang.toUpperCase()}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-3">
                                {t('theme', 'Theme')}
                            </label>
                            <div className="flex space-x-2">
                                {[
                                    { id: "light", label: t('light', 'Light') },
                                    { id: "dark", label: t('dark', 'Dark') }
                                ].map((themeOption) => (
                                    <Button
                                        key={themeOption.id}
                                        onClick={() => setTheme(themeOption.id)}
                                        variant={theme === themeOption.id ? "primary" : "subliminal"}
                                        size="sm"
                                        className={theme === themeOption.id ? "" : "bg-surface-button hover:bg-surface-button-hover"}
                                    >
                                        {themeOption.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        {saveMessage && (
                            <p className={`text-sm ${saveMessage.includes('success') || saveMessage.includes('saved') ? 'text-success-500' : 'text-danger-500'}`}>
                                {saveMessage}
                            </p>
                        )}
                        <Button
                            onClick={handleSaveAll}
                            disabled={isSaving || !hasChanges()}
                            variant="primary"
                            size="md"
                        >
                            {isSaving ? t('saving', 'Saving...') : t('save_all', 'Save All Settings')}
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}







