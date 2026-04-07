# ChatGPT Enablement Dashboard

A modern, high-performance Executive Dashboard for tracking the adoption, engagement, and impact of ChatGPT Enterprise across the organization.

![Dashboard Preview](public/assets/logo.png)

## 🚀 Overview

This dashboard serves as the central source of truth for the **ChatGPT Enablement Program**. It transforms raw platform usage data and Office Hours attendance logs into actionable intelligence, allowing stakeholders to visualize:

*   **Adoption Rates**: Enabled vs. active users broken down by Business Segment (e.g. Corporate HQ, Regional Operations, Content & Editorial).
*   **Feature Depth**: Usage of advanced features like Custom GPTs, Projects, and Tools.
*   **Engagement Quality**: Beyond simple login counts, we track "Average Messages per Active User" to gauge real value.
*   **Office Hours Intelligence**: Analyze attendance trends and extract trending topics from participant questions using keyword analysis.

## ⚡ Key Features

*   **Executive Overview**: High-level KPI tiles (Enabled Users, MAU, Active Rate, Total Messages) with instant filtering capability.
*   **Smart Opportunity Finder**: Automatically identifies business segments that are enabled but under-utilizing specific features (e.g., "High enablement but low GPT adoption").
*   **Office Hours Analytics**:
    *   **Topic Extraction**: Visualizes trending themes (e.g., "Governance", "Prompting") from participant questions.
    *   **PII Protection**: Sensitive participant details (names/emails) are hidden by default behind a robust "Show PII" toggle.
*   **Presentation Mode**: The dashboard comes pre-loaded with the **January 2026 Executive Report** data, making it ready for immediate presentation without manual file uploads.

## 🛠️ Tech Stack & Architecture

Built for speed, aesthetics, and reliability.

*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) (High-performance build tool).
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first styling with comprehensive design tokens).
    *   *Custom Design System*: Features a "Glassmorphism" aesthetic with translucent cards and vibrant gradients.
*   **Visualization**: [Recharts](https://recharts.org/) (Responsive, composable charting library).
*   **Icons**: [Lucide React](https://lucide.dev/).
*   **Routing**: [React Router v6](https://reactrouter.com/).
*   **Data Handling**:
    *   **Context API**: Global state management for filtering and metrics.
    *   **Strict Typing**: Full TypeScript support for all data models (PlatformRow, Meeting, Participant).

## 📦 Installation & Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/nbcnews/chatgpt-dashboard.git
    cd chatgpt-dashboard
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    npm ci
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

4.  **Build for production**:
    ```bash
    npm run build
    ```

## ☁️ Deployment (AWS Amplify)

This project is optimized for deployment on **AWS Amplify**.

1.  **Push to GitHub**: Ensure your code is pushed to your repository.
2.  **Connect to Amplify**:
    *   Go to the AWS Amplify Console.
    *   Select "Host web app" -> "GitHub".
    *   Authorize usage and select the `chatgpt-dashboard` repo.
3.  **Build Settings**: Amplify should automatically detect the settings, but an `amplify.yml` file is included in the root to enforce them:
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Deploy**: Click "Save and Deploy". Your dashboard will be live in minutes.

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components (KPICard, FilterBar, Sidebar)
├── context/            # Global DataContext for state & filtering
├── data/               # Pre-loaded presentation data (Jan 2026 Report)
├── pages/              # Main route views (Overview, Adoption, Engagement, OfficeHours)
├── types/              # TypeScript definitions
├── utils/              # Parsers and helpers
└── index.css           # Global styles & Tailwind directives
```

## 🔐 Security & Data Privacy

*   **PII Handling**: The application includes specific logic to redact email addresses and names in the UI.
*   **Client-Side Only**: This is a Single Page Application (SPA). All data processing happens in the user's browser; no data is sent to an external backend server by the dashboard itself.

## 🤝 Contribution

1.  Create a feature branch (`git checkout -b feature/amazing-feature`).
2.  Commit your changes (`git commit -m 'Add amazing feature'`).
3.  Push to the branch (`git push origin feature/amazing-feature`).
4.  Open a Pull Request.

---
*Built by the Enablement Team • February 2026*
