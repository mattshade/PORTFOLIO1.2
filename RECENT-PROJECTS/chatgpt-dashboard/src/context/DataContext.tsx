import React, { createContext, useContext, useState, useMemo } from 'react';
import type { PlatformRow, Meeting, ValidationStats } from '../types';
import { parsePlatformExcel, parseOfficeHoursContext } from '../utils/parsers';

// Context State
interface DataContextType {
    // Data
    platformRows: PlatformRow[];
    meetings: Meeting[];

    // Validation
    validationStats: ValidationStats;
    isValidated: boolean;

    // Actions
    uploadPlatformFile: (file: File) => Promise<void>;
    uploadOfficeHoursFiles: (files: File[]) => Promise<void>;

    // Loading
    isLoading: boolean;
    error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);



import { PRELOADED_PLATFORM_DATA, PRELOADED_MEETINGS } from '../data/presentationData';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [platformRows, setPlatformRows] = useState<PlatformRow[]>(PRELOADED_PLATFORM_DATA);
    const [meetings, setMeetings] = useState<Meeting[]>(PRELOADED_MEETINGS);
    const [ohFilesCount, setOhFilesCount] = useState(0);
    const [duplicatesRemoved, setDuplicatesRemoved] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Compute Validation Stats on data change
    const validationStats = useMemo(() => {
        // Platform Stats
        const enabledRows = platformRows.filter(r => r.userStatus === 'enabled');
        const enabledCount = enabledRows.length;
        const pendingCount = platformRows.filter(r => r.userStatus === 'pending').length;
        const deletedCount = platformRows.filter(r => r.userStatus === 'deleted').length;

        const activeUserRows = enabledRows.filter(r => r.isActive);
        const mau = activeUserRows.length;
        const activeRate = enabledCount > 0 ? (mau / enabledCount) * 100 : 0;

        const totalMessages = enabledRows.reduce((a, b) => a + b.messages, 0);
        const avgMessages = mau > 0 ? totalMessages / mau : 0;

        const toolsUsers = enabledRows.filter(r => r.toolsMessaged > 0).length;
        const gptsUsers = enabledRows.filter(r => r.gptsMessaged > 0).length;
        const projectsUsers = enabledRows.filter(r => r.projectsMessaged > 0).length;
        const creators = enabledRows.filter(r => r.projectsCreated > 0).length;

        // OH Stats
        const totalViews = meetings.reduce((a, b) => a + b.pageViews, 0);
        const totalRegistered = meetings.reduce((a, b) => a + b.registered, 0);
        const ohConversion = totalViews > 0 ? (totalRegistered / totalViews) * 100 : 0;

        return {
            platform: {
                totalRows: platformRows.length,
                enabled: enabledCount,
                pending: pendingCount,
                deleted: deletedCount,
                mau,
                activeRate,
                totalMessages,
                avgMessages,
                toolsUsers,
                gptsUsers,
                projectsUsers,
                creators
            },
            officeHours: {
                filesLoaded: ohFilesCount,
                meetingsDetected: meetings.length,
                totalViews,
                totalRegistered,
                conversionRate: ohConversion,
                duplicatesRemoved
            }
        };
    }, [platformRows, meetings, ohFilesCount, duplicatesRemoved]);

    // Overall Validity Check (Simplistic: matches meetings count. Strict check is done in DataQuality page)
    const isValidated = platformRows.length > 0;

    const uploadPlatformFile = async (file: File) => {
        setIsLoading(true);
        setError(null);
        try {
            const rows = await parsePlatformExcel(file);
            setPlatformRows(rows);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to parse platform file");
        } finally {
            setIsLoading(false);
        }
    };

    const uploadOfficeHoursFiles = async (files: File[]) => {
        setIsLoading(true);
        setError(null);
        try {
            const { meetings: newMeetings, duplicates } = await parseOfficeHoursContext(files);
            setMeetings(newMeetings);
            setDuplicatesRemoved(duplicates);
            setOhFilesCount(files.length);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to parse Office Hours files");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DataContext.Provider value={{
            platformRows,
            meetings,
            validationStats,
            isValidated,
            uploadPlatformFile,
            uploadOfficeHoursFiles,
            isLoading,
            error
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within DataProvider");
    return context;
};
