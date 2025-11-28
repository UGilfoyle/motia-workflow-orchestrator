import type { CronConfig, Handlers } from 'motia';

export const config: CronConfig = {
    name: 'CleanupOldData',
    type: 'cron',
    description: 'Cleans up old pipeline data and reports older than 30 days',
    cron: '0 2 * * 0', // Every Sunday at 2 AM
    emits: ['cleanup-completed'],
    flows: ['scheduled-tasks']
};

export const handler: Handlers['CleanupOldData'] = async (...args: any[]) => {
    const [_, { emit, logger, state }] = args;
    logger.info('Starting cleanup job');

    const cleanupStartTime = Date.now();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    // In a real scenario, you would query and delete old records
    // For this example, we'll simulate the cleanup
    const mockCleanupResults = {
        pipelinesDeleted: 127,
        reportsDeleted: 30,
        storageFreedMB: 245.7,
        oldestRecordDate: new Date(thirtyDaysAgo).toISOString()
    };

    // Store cleanup results
    const cleanupId = `cleanup-${new Date().toISOString().split('T')[0]}`;
    await state.set('cleanup-logs', cleanupId, {
        ...mockCleanupResults,
        executedAt: new Date().toISOString(),
        durationMs: Date.now() - cleanupStartTime
    });

    logger.info('Cleanup completed successfully', {
        cleanupId,
        pipelinesDeleted: mockCleanupResults.pipelinesDeleted,
        storageFreedMB: mockCleanupResults.storageFreedMB
    });

    await emit({
        topic: 'cleanup-completed',
        data: {
            cleanupId,
            results: mockCleanupResults,
            completedAt: new Date().toISOString()
        }
    });
};
