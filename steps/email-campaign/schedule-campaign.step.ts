import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
    name: 'ScheduleCampaign',
    type: 'api',
    path: '/campaign/schedule',
    method: 'POST',
    description: 'Schedules an email campaign for execution',
    emits: ['campaign-scheduled'],
    flows: ['email-campaign'],
    responseSchema: {
        200: z.object({
            campaignId: z.string(),
            status: z.string(),
            recipientCount: z.number(),
            message: z.string()
        }),
        400: z.object({
            status: z.string(),
            message: z.string(),
            errors: z.any()
        })
    }
};

const bodySchema = z.object({
    campaignName: z.string(),
    recipients: z.array(z.string().email()),
    subject: z.string(),
    template: z.string().optional().default('default'),
    scheduledFor: z.string().optional()
});

export const handler: Handlers['ScheduleCampaign'] = async (input, { emit, logger, state }) => {
    // Validate request body manually since config validation is not working as expected
    const validationResult = bodySchema.safeParse(input.body);

    if (!validationResult.success) {
        logger.warn('Invalid campaign schedule request', { errors: validationResult.error });
        return {
            status: 400,
            body: {
                status: 'error',
                message: 'Invalid request body',
                errors: validationResult.error.flatten()
            }
        };
    }

    const { campaignName, recipients, subject, template, scheduledFor } = validationResult.data;
    const campaignId = `campaign-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    logger.info('Scheduling email campaign', {
        campaignId,
        campaignName,
        recipientCount: recipients.length
    });

    // Store campaign details
    await state.set('campaigns', campaignId, {
        name: campaignName,
        subject,
        template,
        recipients,
        recipientCount: recipients.length,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        scheduledFor: scheduledFor || new Date().toISOString()
    });

    // Emit event to start content generation
    await emit({
        topic: 'campaign-scheduled',
        data: {
            campaignId,
            campaignName,
            subject,
            template,
            recipients,
            scheduledFor: scheduledFor || new Date().toISOString()
        }
    });

    logger.info('Campaign scheduled successfully', {
        campaignId,
        recipientCount: recipients.length
    });

    return {
        status: 200,
        body: {
            campaignId,
            status: 'scheduled',
            recipientCount: recipients.length,
            message: `Campaign "${campaignName}" scheduled for ${recipients.length} recipients`
        }
    };
};
