import type { CronConfig, Handlers } from 'motia';

export const config: CronConfig = {
    name: 'SystemHealthCheck',
    type: 'cron',
    description: 'Performs system health checks every 5 minutes',
    cron: '*/5 * * * *', // Every 5 minutes
    emits: ['health-check-completed', 'health-check-alert'],
    flows: ['scheduled-tasks']
};

export const handler: Handlers['SystemHealthCheck'] = async (_, { emit, logger, state }) => {
    logger.info('Running system health check');

    const checkTime = new Date().toISOString();

    // Simulate health checks
    const healthMetrics = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        diskSpace: Math.random() * 100,
        activeConnections: Math.floor(Math.random() * 1000),
        queueDepth: Math.floor(Math.random() * 50),
        responseTimeMs: Math.floor(Math.random() * 500)
    };

    // Determine health status
    const isHealthy =
        healthMetrics.cpu < 80 &&
        healthMetrics.memory < 85 &&
        healthMetrics.diskSpace < 90 &&
        healthMetrics.responseTimeMs < 300;

    const healthStatus = {
        status: isHealthy ? 'healthy' : 'degraded',
        metrics: healthMetrics,
        checkedAt: checkTime,
        alerts: [] as string[]
    };

    // Generate alerts if needed
    if (healthMetrics.cpu > 80) healthStatus.alerts.push('High CPU usage detected');
    if (healthMetrics.memory > 85) healthStatus.alerts.push('High memory usage detected');
    if (healthMetrics.diskSpace > 90) healthStatus.alerts.push('Low disk space');
    if (healthMetrics.responseTimeMs > 300) healthStatus.alerts.push('Slow response times');

    // Store health check result
    await state.set('health-checks', `check-${Date.now()}`, healthStatus);

    logger.info('Health check completed', {
        status: healthStatus.status,
        alertCount: healthStatus.alerts.length
    });

    // Emit appropriate event
    if (isHealthy) {
        await emit({
            topic: 'health-check-completed',
            data: healthStatus
        });
    } else {
        await emit({
            topic: 'health-check-alert',
            data: {
                ...healthStatus,
                severity: healthStatus.alerts.length > 2 ? 'critical' : 'warning'
            }
        });

        logger.warn('System health degraded', {
            alerts: healthStatus.alerts,
            metrics: healthMetrics
        });
    }
};
