import type { EventConfig, Handlers } from 'motia';
import { z } from 'zod';

const inputSchema = z.object({
    pipelineId: z.string(),
    source: z.string(),
    data: z.array(z.object({
        id: z.number(),
        value: z.number(),
        timestamp: z.string()
    })),
    fetchedAt: z.string()
});

export const config: EventConfig = {
    name: 'TransformData',
    type: 'event',
    description: 'Transforms fetched data - Step 2 of 4',
    subscribes: ['data-fetched'],
    emits: ['data-transformed'],
    flows: ['data-processing-pipeline'],
    input: inputSchema
};

export const handler: Handlers['TransformData'] = async (input, { emit, logger, state }) => {
    const { pipelineId, source, data, fetchedAt } = input;

    logger.info('Starting data transformation', { pipelineId, recordCount: data.length });

    // Update pipeline state
    await state.set('pipelines', pipelineId, {
        status: 'transforming',
        source,
        recordsFetched: data.length,
        transformStartedAt: new Date().toISOString()
    });

    // Transform data: normalize values, add metadata
    const transformedData = data.map(record => ({
        ...record,
        normalizedValue: (record.value / 100).toFixed(2),
        category: record.value > 50 ? 'high' : 'low',
        processedBy: 'TransformData',
        transformedAt: new Date().toISOString()
    }));

    logger.info('Data transformation complete', {
        pipelineId,
        originalCount: data.length,
        transformedCount: transformedData.length
    });

    // Emit event for validation
    await emit({
        topic: 'data-transformed',
        data: {
            pipelineId,
            source,
            data: transformedData,
            fetchedAt,
            transformedAt: new Date().toISOString()
        }
    });
};
