import { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { UnitPlanData } from '../../../types/UnitPlanTypes';
import { applyKMMMYPUnitFormatting } from '@/features/modules/edtech/progressReport/components/excel';
import { exportUnitPlanWithDocxtemplater } from '../../../utils/wordExport/docxtemplaterExport';

export type ExportType = 'json' | 'collection' | 'html' | 'combinedHtml' | 'excel' | 'docxtemplater' | 'zipHtml' | 'yearPlanHtml' | 'pdf' | 'yearPlanPdf' | 'zipPdf';

interface ExportHandlersProps {
    unitPlan: UnitPlanData;
    exportToJSON: () => void;
    exportCollectionToJSON: () => void;
    exportAsHTML: () => void;
    exportCombinedAsHTML: () => void;
    exportAllPlansAsZipHTML?: () => void;
    exportYearPlanHTML?: () => void;
    exportAsPDF?: () => Promise<void>;
    exportYearPlanAsPDF?: () => Promise<void>;
    exportAllPlansAsZipPDF?: () => Promise<void>;
    t: (key: string, params?: Record<string, unknown>) => string;
}

export const useExportHandlers = (props: ExportHandlersProps) => {
    const [exportStatus, setExportStatus] = useState<string>('');
    const [isExporting, setIsExporting] = useState<string>('');

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Unit Plan');

        await applyKMMMYPUnitFormatting(worksheet, props.unitPlan, workbook);

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const filename = `Unit_Plan_${props.unitPlan.unitTitle || 'Export'}_${dateStr}.xlsx`;
        
        try {
            saveAs(blob, filename);
        } catch {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const exportToDocxtemplater = async () => {
        const blob = await exportUnitPlanWithDocxtemplater(props.unitPlan);
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const filename = `Unit_Plan_${props.unitPlan.unitTitle || 'Export'}_${dateStr}.docx`;
        
        try {
            saveAs(blob, filename);
        } catch {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleExport = async (type: ExportType) => {
        setIsExporting(type);
        setExportStatus('');
        
        try {
            switch (type) {
                case 'json':
                    props.exportToJSON();
                    break;
                case 'collection':
                    props.exportCollectionToJSON();
                    break;
                case 'html':
                    props.exportAsHTML();
                    break;
                case 'combinedHtml':
                    props.exportCombinedAsHTML();
                    break;
                case 'zipHtml':
                    if (props.exportAllPlansAsZipHTML) {
                        await props.exportAllPlansAsZipHTML();
                    }
                    break;
                case 'yearPlanHtml':
                    if (props.exportYearPlanHTML) {
                        props.exportYearPlanHTML();
                    }
                    break;
                case 'pdf':
                    if (props.exportAsPDF) {
                        await props.exportAsPDF();
                    }
                    break;
                case 'yearPlanPdf':
                    if (props.exportYearPlanAsPDF) {
                        await props.exportYearPlanAsPDF();
                    }
                    break;
                case 'zipPdf':
                    if (props.exportAllPlansAsZipPDF) {
                        await props.exportAllPlansAsZipPDF();
                    }
                    break;
                case 'excel':
                    await exportToExcel();
                    break;
                case 'docxtemplater':
                    await exportToDocxtemplater();
                    break;
            }
            
            setExportStatus(props.t('export_success', { type: type.toUpperCase() }));
            setTimeout(() => setExportStatus(''), 3000);
        } catch (error) {
            setExportStatus(props.t('export_failed', { error: error instanceof Error ? error.message : 'Unknown error' }));
            setTimeout(() => setExportStatus(''), 5000);
        } finally {
            setIsExporting('');
        }
    };

    return {
        handleExport,
        exportStatus,
        isExporting
    };
};







