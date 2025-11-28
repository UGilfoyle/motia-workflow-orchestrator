import type { EventConfig, Handlers } from 'motia';
import { z } from 'zod';

const inputSchema = z.object({
    campaignId: z.string(),
    recipient: z.string(),
    subject: z.string(),
    sentAt: z.string(),
    status: z.string()
});

export const config: EventConfig = {
    name: 'TrackEngagement',
    type: 'event',
    description: 'Tracks individual email engagement (opens, clicks)',
    subscribes: ['email-sent'],
    emits: [],
    flows: ['email-campaign'],
    input: inputSchema
};

export const handler: Handlers['TrackEngagement'] = async (input, { logger, state }) => {
    const { campaignId, recipient, subject, sentAt, status } = input;

    // Simulate engagement tracking
    const engagementData = {
        recipient,
        subject,
        sentAt,
        status,
        opened: Math.random() > 0.4, // 60% open rate
        openedAt: Math.random() > 0.4 ? new Date(Date.now() + Math.random() * 3600000).toISOString() : null,
        clicked: Math.random() > 0.7, // 30% click rate
        clickedAt: Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 7200000).toISOString() : null,
        trackedAt: new Date().toISOString()
    };

    // Store engagement data
    const trackingKey = `${campaignId}-${recipient.replace(/[^a-zA-Z0-9]/g, '-')}`;
    await state.set('email-tracking', trackingKey, engagementData);

    if (engagementData.opened) {
        logger.info('Email opened', {
            campaignId,
            recipient,
            openedAt: engagementData.openedAt
        });
    }

    if (engagementData.clicked) {
        logger.info('Email link clicked', {
            campaignId,
            recipient,
            clickedAt: engagementData.clickedAt
        });
    }
};
