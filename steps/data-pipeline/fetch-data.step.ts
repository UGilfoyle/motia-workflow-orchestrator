import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
    name: 'FetchData',
    type: 'api',
    path: '/pipeline/fetch',
    method: 'POST',
    description: 'Initiates data fetching pipeline - Step 1 of 4',
    emits: ['data-fetched'],
    flows: ['data-processing-pipeline'],
    responseSchema: {
        200: z.object({
            pipelineId: z.string(),
            status: z.string(),
            message: z.string()
        })
    }
};

export const handler: Handlers['FetchData'] = async (input, { emit, logger, state }) => {
    const { source, batchSize } = input.body;
    const pipelineId = `pipeline-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    logger.info('Starting data fetch pipeline', { pipelineId, source, batchSize });

    // Simulate data fetching
    const mockData = Array.from({ length: batchSize }, (_, i) => ({
        id: i + 1,
        value: Math.random() * 100,
        timestamp: new Date().toISOString()
    }));

    // Store initial state
    await state.set('pipelines', pipelineId, {
        status: 'fetching',
        source,
        batchSize,
        startedAt: new Date().toISOString(),
        recordsFetched: mockData.length
    });

    // Emit event for transformation
    await emit({
        topic: 'data-fetched',
        data: {
            pipelineId,
            source,
            data: mockData,
            fetchedAt: new Date().toISOString()
        }
    });

    logger.info('Data fetched successfully', { pipelineId, recordCount: mockData.length });

    return {
        status: 200,
        body: {
            pipelineId,
            status: 'processing',
            message: `Fetched ${mockData.length} records from ${source}`
        }
    };
};
