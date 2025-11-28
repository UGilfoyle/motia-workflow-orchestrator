import type { CronConfig, Handlers } from 'motia';

export const config: CronConfig = {
    name: 'DailyReportGenerator',
    type: 'cron',
    description: 'Generates daily summary report of all pipeline executions',
    cron: '0 9 * * *', // Every day at 9 AM
    emits: ['daily-report-generated'],
    flows: ['scheduled-tasks']
};

export const handler: Handlers['DailyReportGenerator'] = async (_, { emit, logger, state }) => {
    logger.info('Starting daily report generation');

    const reportDate = new Date().toISOString().split('T')[0];
    const reportId = `report-${reportDate}`;

    // In a real scenario, you would query your database or state for pipeline data
    // For this example, we'll create a mock report
    const report = {
        date: reportDate,
        generatedAt: new Date().toISOString(),
        summary: {
            totalPipelines: 42,
            successfulPipelines: 38,
            failedPipelines: 4,
            totalRecordsProcessed: 15420,
            averageDurationMs: 3450
        },
        topSources: [
            { source: 'api.example.com', count: 15 },
            { source: 'data.warehouse.com', count: 12 },
            { source: 'external.feed.io', count: 10 }
        ]
    };

    // Store the report
    await state.set('reports', reportId, report);

    logger.info('Daily report generated successfully', {
        reportId,
        totalPipelines: report.summary.totalPipelines
    });

    // Emit event for potential email notification or further processing
    await emit({
        topic: 'daily-report-generated',
        data: {
            reportId,
            report,
            generatedAt: report.generatedAt
        }
    });
};
