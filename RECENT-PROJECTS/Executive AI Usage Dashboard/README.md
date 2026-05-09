# Executive AI Usage Dashboard

A comprehensive dashboard for tracking and visualizing the usage, adoption, and licensing of various AI tools (Slack AI, ChatGPT, Adobe Firefly, GitHub Copilot, and Microsoft Copilot) across the organization.

## Features

*   **KPI Cards**: High-level metrics for licenses allocated, active users, and utilization rates.
*   **Charts & Visualizations**:
    *   **Observed Users by Tool**: Ranking of tools by active user count.
    *   **License Allocation**: Visual breakdown of purchased vs. remaining licenses by segment.
    *   **Licensed vs. Active**: Utilization rates across different business segments.
    *   **Usage Depth**: Analysis of usage depth (e.g., messages vs. projects) for specific tools like ChatGPT.
*   **Responsive Design**: optimized for various screen sizes using Tailwind CSS.

## Tech Stack

*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Charts**: Recharts
*   **Icons**: Lucide React
*   **Testing**: Vitest & React Testing Library

## Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm

### Installation

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    npm install
    ```

### Development

Start the local development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Building for Production

Build the application for production:

```bash
npm run build
```

The output will be in the `dist` directory.

### Testing

Run the unit tests:

```bash
npm run test
```

## Deployment

This project is configured for deployment on AWS Amplify. Pushing changes to the `main` branch (after connecting your repository to Amplify) will trigger a build and deployment.

See `amplify.yml` for the build configuration.