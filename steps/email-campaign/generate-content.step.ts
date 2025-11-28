import type { EventConfig, Handlers } from 'motia';
import { z } from 'zod';

const inputSchema = z.object({
    campaignId: z.string(),
    campaignName: z.string(),
    subject: z.string(),
    template: z.string(),
    recipients: z.array(z.string()),
    scheduledFor: z.string()
});

export const config: EventConfig = {
    name: 'GenerateContent',
    type: 'event',
    description: 'Generates personalized email content for campaign',
    subscribes: ['campaign-scheduled'],
    emits: ['content-generated'],
    flows: ['email-campaign'],
    input: inputSchema
};

export const handler: Handlers['GenerateContent'] = async (input, { emit, logger, state }) => {
    const { campaignId, campaignName, subject, template, recipients, scheduledFor } = input;

    logger.info('Generating campaign content', { campaignId, template });

    // Update campaign status
    await state.set('campaigns', campaignId, {
        status: 'generating-content',
        contentGenerationStartedAt: new Date().toISOString()
    });

    // Simulate AI-powered content generation
    const contentVariations = [
        'Exciting news awaits you!',
        'Don\'t miss out on this opportunity!',
        'Special offer just for you!',
        'Your exclusive update is here!'
    ];

    const generatedContent = {
        subject,
        bodyTemplate: template,
        personalizationFields: ['firstName', 'lastName', 'company'],
        contentVariations,
        generatedAt: new Date().toISOString()
    };

    // Store generated content
    await state.set('campaign-content', campaignId, generatedContent);

    logger.info('Content generated successfully', {
        campaignId,
        variationsCount: contentVariations.length
    });

    // Emit event to start sending
    await emit({
        topic: 'content-generated',
        data: {
            campaignId,
            campaignName,
            content: generatedContent,
            recipients,
            scheduledFor
        }
    });
};
