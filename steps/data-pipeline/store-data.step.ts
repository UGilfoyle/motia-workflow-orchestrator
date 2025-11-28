import type { EventConfig, Handlers } from 'motia';
import { z } from 'zod';

const inputSchema = z.object({
    pipelineId: z.string(),
    source: z.string(),
    data: z.array(z.any()),
    invalidRecords: z.array(z.any()),
    fetchedAt: z.string(),
    transformedAt: z.string(),
    validatedAt: z.string(),
    stats: z.object({
        total: z.number(),
        valid: z.number(),
        invalid: z.number(),
        validationRate: z.number()
    })
});

export const config: EventConfig = {
    name: 'StoreData',
    type: 'event',
    description: 'Stores validated data - Step 4 of 4 (Final)',
    subscribes: ['data-validated'],
    emits: ['pipeline-completed'],
    flows: ['data-processing-pipeline'],
    input: inputSchema
};

export const handler: Handlers['StoreData'] = async (input, { emit, logger, state }) => {
    const { pipelineId, source, data, invalidRecords, fetchedAt, transformedAt, validatedAt, stats } = input;

    logger.info('Starting data storage', { pipelineId, recordCount: data.length });

    // Simulate storing data (in real scenario, this would write to database)
    const storageKey = `stored-data-${pipelineId}`;
    await state.set('storage', storageKey, {
        data,
        metadata: {
            source,
            recordCount: data.length,
            storedAt: new Date().toISOString()
        }
    });

    // Calculate pipeline duration
    const startTime = new Date(fetchedAt).getTime();
    const endTime = new Date().getTime();
    const durationMs = endTime - startTime;

    // Update final pipeline state
    await state.set('pipelines', pipelineId, {
        status: 'completed',
        source,
        stats,
        invalidRecords: invalidRecords.length,
        storageKey,
        timeline: {
            fetchedAt,
            transformedAt,
            validatedAt,
            storedAt: new Date().toISOString()
        },
        durationMs,
        completedAt: new Date().toISOString()
    });

    logger.info('Pipeline completed successfully', {
        pipelineId,
        recordsStored: data.length,
        durationMs,
        durationSeconds: (durationMs / 1000).toFixed(2)
    });

    // Emit completion event
    await emit({
        topic: 'pipeline-completed',
        data: {
            pipelineId,
            source,
            recordsStored: data.length,
            stats,
            durationMs,
            completedAt: new Date().toISOString()
        }
    });
};
