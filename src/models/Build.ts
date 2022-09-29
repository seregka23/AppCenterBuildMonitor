export interface Build {
    id: number;
    startTime: string;
    finishTime: string;
    status: string;
    result: string;
    sourceBranch: string;
    sourceVersion: string;
}