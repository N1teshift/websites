import React from "react";
import { CollapsibleSection } from "@websites/ui";
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

interface RenderMetadataProps {
    bookMetadata: {
        title: string;
        author: string;
    };

    exerciseMetadata: {
        id: string;
        exerciseNumber: number;
        dateCreated: string;
        lastModified?: string;
    };
}

export const RenderMetadata: React.FC<RenderMetadataProps> = ({
    bookMetadata,
    exerciseMetadata
}) => {
    const { t } = useFallbackTranslation();

    return (
        <CollapsibleSection title={t("metadata")}>
            <div className="border p-2 bg-gray-100 rounded-md text-sm">
                <div><strong>{t("id")}:</strong> {exerciseMetadata.id}</div>
                <div><strong>{t("author")}:</strong> {bookMetadata.author}</div>
                <div><strong>{t("book")}:</strong> {bookMetadata.title}</div>
                <div><strong>{t("exercise_number")}:</strong> {exerciseMetadata.exerciseNumber}</div>
                <div><strong>{t("date_created")}:</strong> {exerciseMetadata.dateCreated}</div>
                <div><strong>{t("last_modified")}:</strong> {exerciseMetadata.lastModified}</div>
            </div>
        </CollapsibleSection>
    );
};



