import type { EventConfig, Handlers } from 'motia';
import { z } from 'zod';

const inputSchema = z.object({
    pipelineId: z.string(),
    source: z.string(),
    data: z.array(z.object({
        id: z.number(),
        value: z.number(),
        normalizedValue: z.string(),
        category: z.string(),
        timestamp: z.string(),
        processedBy: z.string(),
        transformedAt: z.string()
    })),
    fetchedAt: z.string(),
    transformedAt: z.string()
});

export const config: EventConfig = {
    name: 'ValidateData',
    type: 'event',
    description: 'Validates transformed data - Step 3 of 4',
    subscribes: ['data-transformed'],
    emits: ['data-validated', 'data-validation-failed'],
    flows: ['data-processing-pipeline'],
    input: inputSchema
};

export const handler: Handlers['ValidateData'] = async (input, { emit, logger, state }) => {
    const { pipelineId, source, data, fetchedAt, transformedAt } = input;

    logger.info('Starting data validation', { pipelineId, recordCount: data.length });

    // Update pipeline state
    await state.set('pipelines', pipelineId, {
        status: 'validating',
        source,
        recordsToValidate: data.length,
        validationStartedAt: new Date().toISOString()
    });

    // Validation logic: check for required fields and valid values
    const validRecords = [];
    const invalidRecords = [];

    for (const record of data) {
        const isValid =
            record.id > 0 &&
            record.value >= 0 &&
            record.normalizedValue &&
            ['high', 'low'].includes(record.category);

        if (isValid) {
            validRecords.push(record);
        } else {
            invalidRecords.push({ record, reason: 'Failed validation checks' });
        }
    }

    const validationRate = (validRecords.length / data.length) * 100;

    logger.info('Data validation complete', {
        pipelineId,
        totalRecords: data.length,
        validRecords: validRecords.length,
        invalidRecords: invalidRecords.length,
        validationRate: `${validationRate.toFixed(2)}%`
    });

    // Update state with validation results
    await state.set('pipelines', pipelineId, {
        status: 'validated',
        source,
        totalRecords: data.length,
        validRecords: validRecords.length,
        invalidRecords: invalidRecords.length,
        validationRate,
        validatedAt: new Date().toISOString()
    });

    if (validRecords.length > 0) {
        // Emit event for storage
        await emit({
            topic: 'data-validated',
            data: {
                pipelineId,
                source,
                data: validRecords,
                invalidRecords,
                fetchedAt,
                transformedAt,
                validatedAt: new Date().toISOString(),
                stats: {
                    total: data.length,
                    valid: validRecords.length,
                    invalid: invalidRecords.length,
                    validationRate
                }
            }
        });
    } else {
        // All records failed validation
        await (emit as any)({
            topic: 'data-validation-failed',
            data: {
                pipelineId,
                source,
                invalidRecords,
                reason: 'All records failed validation'
            }
        });
    }
};
