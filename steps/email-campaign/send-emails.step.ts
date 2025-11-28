import type { EventConfig, Handlers } from 'motia';
import { z } from 'zod';

const inputSchema = z.object({
    campaignId: z.string(),
    campaignName: z.string(),
    content: z.object({
        subject: z.string(),
        bodyTemplate: z.string(),
        personalizationFields: z.array(z.string()),
        contentVariations: z.array(z.string()),
        generatedAt: z.string()
    }),
    recipients: z.array(z.string()),
    scheduledFor: z.string()
});

export const config: EventConfig = {
    name: 'SendEmails',
    type: 'event',
    description: 'Sends emails with rate limiting and batch processing',
    subscribes: ['content-generated'],
    emits: ['emails-sent', 'email-sent'],
    flows: ['email-campaign'],
    input: inputSchema
};

export const handler: Handlers['SendEmails'] = async (input, { emit, logger, state }) => {
    const { campaignId, campaignName, content, recipients, scheduledFor } = input;

    logger.info('Starting email sending', {
        campaignId,
        recipientCount: recipients.length
    });

    // Update campaign status
    await state.set('campaigns', campaignId, {
        status: 'sending',
        sendingStartedAt: new Date().toISOString(),
        totalRecipients: recipients.length,
        sentCount: 0
    });

    const batchSize = 10; // Send 10 emails at a time
    const delayBetweenBatchesMs = 1000; // 1 second delay
    let sentCount = 0;
    let failedCount = 0;

    // Process recipients in batches
    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);

        logger.info('Processing batch', {
            campaignId,
            batchNumber: Math.floor(i / batchSize) + 1,
            batchSize: batch.length
        });

        // Simulate sending emails
        for (const recipient of batch) {
            const success = Math.random() > 0.05; // 95% success rate

            if (success) {
                sentCount++;

                // Emit individual email sent event for tracking
                await emit({
                    topic: 'email-sent',
                    data: {
                        campaignId,
                        recipient,
                        subject: content.subject,
                        sentAt: new Date().toISOString(),
                        status: 'delivered'
                    }
                });
            } else {
                failedCount++;
                logger.warn('Email failed to send', { campaignId, recipient });
            }
        }

        // Update progress in state
        await state.set('campaigns', campaignId, {
            status: 'sending',
            sentCount,
            failedCount,
            progress: ((sentCount + failedCount) / recipients.length * 100).toFixed(2)
        });

        // Rate limiting: wait between batches
        if (i + batchSize < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatchesMs));
        }
    }

    // Final campaign status
    await state.set('campaigns', campaignId, {
        status: 'completed',
        sentCount,
        failedCount,
        totalRecipients: recipients.length,
        successRate: ((sentCount / recipients.length) * 100).toFixed(2),
        completedAt: new Date().toISOString()
    });

    logger.info('Email campaign completed', {
        campaignId,
        sentCount,
        failedCount,
        successRate: ((sentCount / recipients.length) * 100).toFixed(2) + '%'
    });

    // Emit completion event
    await (emit as any)({
        topic: 'emails-sent',
        data: {
            campaignId,
            sentCount,
            failedCount,
            totalRecipients: recipients.length,
            successRate: (sentCount / recipients.length) * 100,
            completedAt: new Date().toISOString()
        }
    });
};
