# Developer Agent Competitive Analysis Dashboard

An executive-level competitive analysis dashboard comparing five major developer agent tools:
- Google Antigravity
- Claude Code
- GitHub Copilot
- OpenAI Codex
- Cursor

## Features

- **Executive Summary**: 7 key insights for senior leadership
- **Competitive Comparison**: Side-by-side analysis of all tools
- **Capability Scorecard**: Quantitative scoring across 5 dimensions
- **Strategic Implications**: What this landscape means for the future
- **Actionable Recommendations**: Tool-by-tool guidance and implementation timeline

## Tech Stack

- **Next.js 14+** - React framework with static export
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **AWS Amplify** - Deployment platform

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
```

This creates a static export in the `out/` directory.

## Deploy to AWS Amplify

### Option 1: Deploy via Git (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Amplify**:
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" > "Host web app"
   - Choose "GitHub" and authorize
   - Select your repository
   - Amplify will auto-detect the `amplify.yml` configuration
   - Click "Save and deploy"

3. **Access your app**:
   - Amplify will provide a URL like `https://main.xxxxxxxxx.amplifyapp.com`
   - Set up a custom domain if needed

### Option 2: Manual Deploy

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Deploy using Amplify CLI**:
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   amplify init
   amplify publish
   ```

### Environment Variables (if needed)

If you need to add environment variables in Amplify:
1. Go to your app in Amplify Console
2. Click "Environment variables" in the left sidebar
3. Add key-value pairs
4. Redeploy

## Project Structure

```
dev-agents-dashboard/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── ExecutiveSummary.tsx
│   ├── ComparisonTable.tsx
│   ├── CapabilityScorecard.tsx
│   ├── StrategicImplications.tsx
│   └── Recommendations.tsx
├── amplify.yml             # Amplify build configuration
├── next.config.js          # Next.js config (static export)
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
└── package.json
```

## Customization

### Update Content

All content is in the component files under `/components`. Edit the data structures within each component to update:
- Tool comparisons
- Scores
- Recommendations
- Strategic insights

### Styling

The dashboard uses Tailwind CSS. To customize:
- Edit `tailwind.config.js` for theme colors
- Modify component classes for layout changes
- Update `app/globals.css` for global styles

### Add New Sections

1. Create a new component in `/components`
2. Import and add it to `app/page.tsx`
3. Add navigation link in the quick navigation section

## Performance

- Static export means **instant page loads**
- No server-side rendering overhead
- Optimized for Amplify CDN distribution
- Mobile responsive design

## License

MIT

## Support

For issues or questions about deployment, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
