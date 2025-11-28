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
        })
    }
};

export const handler: Handlers['ScheduleCampaign'] = async (input, { emit, logger, state }) => {
    const { campaignName, recipients, subject, template, scheduledFor } = input.body;
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
