# Motia Workflow Orchestrator

A comprehensive learning project demonstrating [Motia](https://motia.dev)'s core features through practical workflow examples. This project showcases event-driven architecture, state management, scheduled tasks, and API endpoints using Motia's unified backend framework.

## 🎯 Learning Objectives

This project helps you understand:
- **Event-Driven Architecture**: How Steps communicate via events
- **State Management**: Persisting and retrieving data across workflow executions
- **Scheduled Tasks**: Running cron jobs and background tasks
- **API Endpoints**: Creating HTTP APIs as Steps
- **Observability**: Using Motia Workbench for monitoring and debugging
- **Workflow Orchestration**: Chaining multiple Steps into complex pipelines

## 📋 Project Structure

```
motia-workflow-orchestrator/
├── steps/
│   ├── hello/                    # Default example (from template)
│   │   ├── hello-api.step.ts
│   │   └── process-greeting.step.ts
│   ├── data-pipeline/            # Data Processing Pipeline
│   │   ├── fetch-data.step.ts
│   │   ├── transform-data.step.ts
│   │   ├── validate-data.step.ts
│   │   └── store-data.step.ts
│   ├── scheduled-tasks/          # Cron Job Examples
│   │   ├── daily-report.step.ts
│   │   ├── cleanup-job.step.ts
│   │   └── health-check.step.ts
│   └── email-campaign/           # Email Campaign Workflow
│       ├── schedule-campaign.step.ts
│       ├── generate-content.step.ts
│       ├── send-emails.step.ts
│       └── track-engagement.step.ts
├── motia.config.ts              # Motia configuration
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- Basic understanding of TypeScript

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd motia-workflow-orchestrator
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the Workbench:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The Workbench provides a visual interface to monitor and test all Steps

## 📚 Workflows Explained

### 1. Data Processing Pipeline

A 4-step event-driven pipeline demonstrating data flow from fetch to storage.

**Flow:** `Fetch → Transform → Validate → Store`

**Steps:**
- **FetchData** (API): Initiates pipeline via POST request
- **TransformData** (Event): Processes and normalizes data
- **ValidateData** (Event): Validates data quality
- **StoreData** (Event): Persists validated data

**Try it:**
```bash
curl -X POST http://localhost:3000/pipeline/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "source": "api.example.com",
    "batchSize": 50
  }'
```

**What to observe in Workbench:**
- Event flow through all 4 Steps
- State updates at each stage
- Execution traces and logs
- Pipeline duration metrics

---

### 2. Scheduled Tasks

Three cron jobs demonstrating different scheduling patterns and use cases.

**Steps:**
- **DailyReportGenerator**: Runs daily at 9 AM (`0 9 * * *`)
- **CleanupOldData**: Runs weekly on Sunday at 2 AM (`0 2 * * 0`)
- **SystemHealthCheck**: Runs every 5 minutes (`*/5 * * * *`)

**What to observe in Workbench:**
- Scheduled executions in the cron view
- Manual trigger capability for testing
- Health check alerts when metrics exceed thresholds
- State persistence of reports and cleanup logs

---

### 3. Email Campaign Workflow

A complete email campaign system with scheduling, content generation, sending, and tracking.

**Flow:** `Schedule → Generate Content → Send Emails → Track Engagement`

**Steps:**
- **ScheduleCampaign** (API): Creates a new campaign
- **GenerateContent** (Event): Generates personalized content
- **SendEmails** (Event): Sends emails with rate limiting
- **TrackEngagement** (Event): Tracks opens and clicks

**Try it:**
```bash
curl -X POST http://localhost:3000/campaign/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "campaignName": "Product Launch",
    "recipients": ["user1@example.com", "user2@example.com"],
    "subject": "Exciting News!",
    "template": "default"
  }'
```

**What to observe in Workbench:**
- Batch processing with rate limiting
- Progress tracking via state updates
- Individual email events
- Engagement metrics

## 🔍 Key Motia Concepts Demonstrated

### Event-Driven Communication

Steps communicate by emitting and subscribing to events:

```typescript
// Emitting an event
await emit({
  topic: 'data-fetched',
  data: { pipelineId, data: mockData }
});

// Subscribing to an event
export const config: EventConfig = {
  subscribes: ['data-fetched'],
  // ...
};
```

### State Management

Persist data across Step executions:

```typescript
// Set state
await state.set('pipelines', pipelineId, {
  status: 'processing',
  recordCount: 100
});

// Get state (in another Step)
const pipelineData = await state.get('pipelines', pipelineId);
```

### Logging & Observability

All logs are automatically captured in the Workbench:

```typescript
logger.info('Pipeline started', { pipelineId, source });
logger.warn('High memory usage detected');
logger.error('Validation failed', { errors });
```

## 🎓 Learning Path

**Recommended order to explore the project:**

1. **Start with Hello World** (`steps/hello/`)
   - Understand basic API and Event Steps
   - See simple event emission and subscription

2. **Explore Data Pipeline** (`steps/data-pipeline/`)
   - Learn event chaining
   - Understand state management
   - See error handling patterns

3. **Study Scheduled Tasks** (`steps/scheduled-tasks/`)
   - Learn cron syntax
   - Understand background job patterns
   - See conditional event emission

4. **Analyze Email Campaign** (`steps/email-campaign/`)
   - Complex multi-step workflow
   - Batch processing and rate limiting
   - Progress tracking patterns

## 🛠️ Development Tips

### Viewing Logs
All Step executions are logged in the Workbench. Click on any execution to see:
- Input/output data
- Execution timeline
- State changes
- Emitted events

### Testing Steps
Use the Workbench to:
- Manually trigger API endpoints
- Test cron jobs without waiting
- Inspect event payloads
- View state data

### Debugging
- Check the Workbench for execution traces
- Review logs for each Step
- Inspect state at different pipeline stages
- Use the visual event flow diagram

## 📖 Additional Resources

- [Motia Documentation](https://motia.dev/docs)
- [Motia Core Concepts](https://motia.dev/docs/concepts/overview)
- [Motia Workbench Guide](https://motia.dev/docs/concepts/workbench)
- [Motia Examples](https://motia.dev/docs/examples)

## 🤝 Next Steps

After mastering these workflows, consider:
- Adding Python Steps for multi-language support
- Implementing real database integration
- Adding authentication to API endpoints
- Creating custom error handling workflows
- Building a simple frontend to trigger workflows

## 📝 License

This is a learning project - feel free to use and modify as needed!

---

**Happy Learning with Motia! 🚀**
