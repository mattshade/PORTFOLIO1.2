# AI Data Hub

A modern, responsive data catalog showcasing AI and analytics datasets with interactive browsing, search, and detailed information pages.

## 🚀 Live Demo

Deploy this application to any static hosting service to create your live demo.

## ✨ Features

- **Interactive Dataset Browser** - Browse through curated AI and analytics datasets
- **Advanced Search & Filtering** - Search by title/description and filter by category
- **Detailed Dataset Pages** - Comprehensive information with sample data and data dictionaries
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Modern UI/UX** - Clean, professional interface with smooth animations
- **Static Deployment** - Pure HTML/CSS/JavaScript - no build process required

## 📊 Available Datasets

### Editorial Data
- **5M records** - Comprehensive consumable content including articles, cards, videos, images, recipes
- **Full versioning** - Complete lineage tracking and document versioning
- **US-centric content** - Focused on US market with support entities

### Audience Demographics & Behavior
- **3.5M records** - Detailed audience insights and behavioral patterns
- **Demographic analysis** - Age, gender, location, and interest-based segmentation
- **Engagement metrics** - User interaction and content consumption patterns

### Digital Content Performance
- **1.25M records** - Cross-platform content performance metrics
- **Engagement rates** - Click-through rates, time on page, bounce rates
- **Conversion analytics** - Content-to-action conversion tracking

### Social Media Engagement Metrics
- **2.5M records** - Comprehensive social media analytics
- **Multi-platform** - Facebook, Instagram, Twitter, LinkedIn data
- **Engagement tracking** - Likes, shares, comments, reach metrics

### Streaming Platform Viewership
- **5.5M records** - Detailed streaming analytics
- **Multi-platform** - Netflix, Hulu, Amazon Prime, Disney+ data
- **Viewing patterns** - Watch time, completion rates, device preferences

### Podcast Listening Analytics
- **900K records** - In-depth podcast consumption data
- **Performance metrics** - Download stats, listening duration, retention
- **Geographic distribution** - Global listener demographics

### Advertising Campaign Performance
- **700K records** - Comprehensive advertising metrics
- **Multi-platform** - Google Ads, Facebook Ads, LinkedIn Ads
- **ROI analysis** - Cost, conversion, and effectiveness metrics

## 🛠️ Technology Stack

- **HTML5** - Semantic markup and modern web standards
- **CSS3** - Custom styling with Flexbox and Grid layouts
- **JavaScript (ES6+)** - Modern JavaScript with no dependencies
- **Responsive Design** - Mobile-first approach with breakpoints
- **Progressive Enhancement** - Works without JavaScript (graceful degradation)

## 📁 Project Structure

```
ai-data-hub/
├── index.html                 # Main dataset browser page
├── 404.html                   # SPA routing fallback
├── assets/                    # Static assets
│   ├── thumbnails/           # Dataset thumbnail images
│   ├── index-DZUB1dRP.css    # Main stylesheet
│   └── index-FQiX9QlF.js     # Main JavaScript bundle
├── editorial-data.html        # Editorial Data detail page
├── audience-data.html         # Audience Data detail page
├── content-performance.html   # Content Performance detail page
├── social-media-engagement.html # Social Media detail page
├── streaming-viewership.html  # Streaming detail page
├── podcast-analytics.html     # Podcast detail page
├── ad-performance.html        # Advertising detail page
├── SHAREPOINT-DEPLOYMENT-GUIDE.md # SharePoint deployment guide
└── DEPLOYMENT-CHECKLIST.md   # Deployment checklist
```

## 🚀 Quick Start

### Local Development

1. **Download or clone the repository**
   ```bash
   # If using Git
   git clone https://github.com/your-org/ai-data-hub.git
   cd ai-data-hub
   
   # Or download as ZIP and extract
   ```

2. **Serve locally** (using Python)
   ```bash
   python3 -m http.server 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Alternative Local Servers

**Using Node.js (if you have it installed)**
```bash
npx serve .
```

**Using PHP**
```bash
php -S localhost:8000
```

## 🌐 Deployment Options

### Static Hosting Services
1. **Netlify** - Drag and drop the folder or connect GitHub repository
2. **Vercel** - Import GitHub repository or upload files
3. **AWS S3** - Upload files to S3 bucket with static website hosting
4. **Azure Static Web Apps** - Connect GitHub repository
5. **Firebase Hosting** - Deploy using Firebase CLI or web interface

### SharePoint Deployment

#### Option 1: Direct File Upload
1. Follow the detailed guide in `SHAREPOINT-DEPLOYMENT-GUIDE.md`
2. Upload all files to SharePoint document library
3. Set `index.html` as the default page
4. Configure proper MIME types for assets

#### Option 2: Using SharePoint Web Parts

**Step 1: Upload Files to SharePoint**
1. Navigate to your SharePoint site
2. Go to **Documents** or **Site Contents** → **Documents**
3. Create a new folder called "ai-data-hub" (optional)
4. Upload all files from this repository:
   - `index.html`
   - `404.html`
   - All `.html` dataset detail pages
   - `assets/` folder (with all CSS, JS, and image files)

**Step 2: Create a New Page**
1. Go to **Pages** in your SharePoint site
2. Click **+ New** → **Page**
3. Choose a page template (Blank page recommended)
4. Give your page a title like "AI Data Hub"

**Step 3: Add Content Using Web Parts**

**Method A: Embed Web Part (Recommended)**
1. Click **+** to add a web part
2. Search for "Embed" or "Embed Code"
3. Select **Embed** web part
4. Click **Add an embed code**
5. Enter the URL to your uploaded `index.html` file:
   ```
   https://yourtenant.sharepoint.com/sites/yoursite/Documents/ai-data-hub/index.html
   ```
6. Click **Embed**
7. The page will display your AI Data Hub

**Method B: Content Editor Web Part**
1. Click **+** to add a web part
2. Search for "Content Editor" or "Script Editor"
3. Select **Content Editor** web part
4. Click **Edit web part**
5. In the **Content Link** field, enter the path to your `index.html`:
   ```
   /sites/yoursite/Documents/ai-data-hub/index.html
   ```
6. Click **OK** and **Save**

**Method C: Page Viewer Web Part**
1. Click **+** to add a web part
2. Search for "Page Viewer"
3. Select **Page Viewer** web part
4. In the **Link** field, enter the full URL to your `index.html`
5. Set **Height** to 800px or 100vh for full screen
6. Click **OK** and **Save**

**Step 4: Configure Web Part Settings**
1. Click the **Edit** button on your web part
2. Configure these settings:
   - **Height**: Set to 800px or 100vh
   - **Width**: Set to 100% or leave default
   - **Scrolling**: Enable if needed
   - **Border**: Disable for cleaner look
3. Click **OK** and **Save** the page

**Step 5: Test and Publish**
1. Click **Preview** to test the page
2. Verify all datasets load correctly
3. Test navigation between pages
4. Click **Publish** when ready

#### Complete Step-by-Step SharePoint Deployment

**Step 1: Upload Files to SharePoint**

1. **Navigate to SharePoint Documents**
   - Go to your SharePoint site
   - Click **Documents** in the left navigation
   - Or go to **Site Contents** → **Documents**

2. **Create a Folder (Recommended)**
   - Click **+ New** → **Folder**
   - Name it `ai-data-hub`
   - Click **Create**

3. **Upload All Files**
   Upload these files in this order:
   
   **Main Files:**
   - `index.html` (main page)
   - `404.html` (routing fallback)
   
   **Dataset Detail Pages:**
   - `editorial-data.html`
   - `audience-data.html`
   - `content-performance.html`
   - `social-media-engagement.html`
   - `streaming-viewership.html`
   - `podcast-analytics.html`
   - `ad-performance.html`
   
   **Assets Folder:**
   - Upload the entire `assets/` folder
   - This contains:
     - `index-DZUB1dRP.css` (styles)
     - `index-FQiX9QlF.js` (JavaScript)
     - `thumbnails/` folder with images

**Step 2: Create a SharePoint Page**

1. **Create New Page**
   - Go to **Pages** in your SharePoint site
   - Click **+ New** → **Page**
   - Choose **Blank page**
   - Title it "AI Data Hub"

2. **Get Your File URL**
   - Go back to **Documents** → **ai-data-hub** folder
   - Right-click on `index.html`
   - Click **Copy link** or **Get link**
   - Copy the full URL (you'll need this)

**Step 3: Add Web Part (Choose One Method)**

**Method A: Embed Web Part (Recommended)**

1. **Add Embed Web Part**
   - On your new page, click **+** to add a web part
   - Search for "Embed" or "Embed Code"
   - Select **Embed** web part
   - Click **Add an embed code**

2. **Configure Embed**
   - Paste your `index.html` URL in the embed field
   - Click **Embed**
   - The page should now show your AI Data Hub

3. **Configure Settings**
   - Click the **Edit** button on the web part
   - Set these settings:
     - **Height**: `800px` or `100vh`
     - **Width**: `100%`
     - **Scrolling**: `Yes`
     - **Border**: `No`
   - Click **OK**

**Method B: Content Editor Web Part**

1. **Add Content Editor**
   - Click **+** to add a web part
   - Search for "Content Editor" or "Script Editor"
   - Select **Content Editor** web part

2. **Configure Content Editor**
   - Click **Edit web part**
   - In **Content Link**, enter the path to your file:
     ```
     /sites/yoursite/Documents/ai-data-hub/index.html
     ```
   - Set **Height** to `800px`
   - Click **OK**

**Method C: Page Viewer Web Part**

1. **Add Page Viewer**
   - Click **+** to add a web part
   - Search for "Page Viewer"
   - Select **Page Viewer** web part

2. **Configure Page Viewer**
   - In **Link**, paste your full `index.html` URL
   - Set **Height** to `800px`
   - Set **Width** to `100%`
   - Enable **Scrolling**
   - Click **OK**

**Step 4: Test and Publish**

1. **Test Your Page**
   - Click **Preview** to test
   - Verify all datasets load correctly
   - Test clicking on dataset cards
   - Check that images load properly
   - Test the search and filter functionality

2. **Publish**
   - If everything looks good, click **Publish**
   - Your AI Data Hub is now live!

#### Making Changes Using Web Parts

**Updating Content:**
1. **Edit existing files**: Upload new versions of HTML/CSS/JS files to replace old ones
2. **Add new datasets**: Create new `.html` files and update `index.html`
3. **Modify styling**: Edit CSS in `index.html` or create separate stylesheets

**Adding New Pages:**
1. Create new `.html` files for additional content
2. Upload to the same SharePoint folder
3. Update navigation links in `index.html`
4. The changes will appear automatically in the web part

#### Troubleshooting Web Parts

**Issue: "This website doesn't support embedding"**
- **Solution**: Use **Content Editor** or **Page Viewer** instead
- **Alternative**: Upload files to a different location and try again

**Issue: Blank white page**
- **Solution**: Check file permissions and ensure all assets are uploaded
- **Check**: Verify the URL path is correct and accessible

**Issue: Styling looks broken**
- **Solution**: Ensure CSS and JS files are in the `assets/` folder
- **Check**: Verify relative paths are correct (`./assets/` not `/assets/`)

**Issue: Images not loading**
- **Solution**: Upload all images to the `assets/thumbnails/` folder
- **Check**: Verify image file names match exactly (case-sensitive)

**Issue: CORS errors**
- **Solution**: Use the same domain for all files
- **Check**: Ensure all files are in the same SharePoint folder

**Best Practices:**
- Keep all files in the same SharePoint folder
- Use relative paths for assets (`./assets/` not absolute URLs)
- Test changes in a separate folder first
- Document any custom modifications

#### Quick Reference Checklist

**Files to Upload:**
- [ ] `index.html`
- [ ] `404.html`
- [ ] `editorial-data.html`
- [ ] `audience-data.html`
- [ ] `content-performance.html`
- [ ] `social-media-engagement.html`
- [ ] `streaming-viewership.html`
- [ ] `podcast-analytics.html`
- [ ] `ad-performance.html`
- [ ] `assets/` folder (with CSS, JS, and images)

**Web Part Settings:**
- [ ] Height: `800px` or `100vh`
- [ ] Width: `100%`
- [ ] Scrolling: `Yes`
- [ ] Border: `No`

**Testing:**
- [ ] Main page loads
- [ ] All datasets display
- [ ] Images load correctly
- [ ] Search works
- [ ] Filter works
- [ ] Dataset detail pages work
- [ ] Navigation works

#### Quick Reference: Web Part Settings

**Embed Web Part Settings:**
```
URL: https://yourtenant.sharepoint.com/sites/yoursite/Documents/ai-data-hub/index.html
Height: 800px (or 100vh for full screen)
Width: 100%
Scrolling: Yes
Border: No
```

**Content Editor Web Part Settings:**
```
Content Link: /sites/yoursite/Documents/ai-data-hub/index.html
Height: 800px
Width: 100%
Chrome Type: None
```

**Page Viewer Web Part Settings:**
```
Link: https://yourtenant.sharepoint.com/sites/yoursite/Documents/ai-data-hub/index.html
Height: 800px
Width: 100%
Scrolling: Yes
Border: No
```

#### Common Issues and Solutions

**Issue: "This website doesn't support embedding"**
- **Solution**: Use Content Editor or Page Viewer web parts instead
- **Alternative**: Upload files to a different location and try again

**Issue: Blank white page**
- **Solution**: Check file permissions and ensure all assets are uploaded
- **Check**: Verify the URL path is correct and accessible

**Issue: Styling looks broken**
- **Solution**: Ensure CSS and JS files are in the `assets/` folder
- **Check**: Verify relative paths are correct (`./assets/` not `/assets/`)

**Issue: Images not loading**
- **Solution**: Upload all images to the `assets/thumbnails/` folder
- **Check**: Verify image file names match exactly (case-sensitive)

## 🎨 Customization

### Adding New Datasets
1. Edit the `datasets` array in `index.html` (around line 450)
2. Add new dataset object with required fields:
   ```javascript
   {
     id: 'unique-id',
     title: 'Dataset Title',
     description: 'Dataset description',
     category: 'Category Name',
     thumbnail: 'path/to/image.jpg',
     recordCount: 1000000,
     fileSize: '500 MB',
     lastUpdated: '2024-12-15',
     overview: 'Detailed overview...',
     sampleData: [...],
     dataDictionary: [...]
   }
   ```
3. Create corresponding detail page (e.g., `unique-id.html`)
4. Update category filter options if needed

### Styling Customization
- Edit the CSS in `index.html` (between `<style>` tags)
- Modify color schemes, fonts, layouts as needed
- All styles are self-contained in the HTML file

### Adding New Categories
1. Add category to the filter dropdown in `index.html`
2. Update the `filterDatasets()` function if needed
3. Add corresponding CSS classes for category-specific styling

## 📱 Browser Support

- **Chrome** 60+
- **Firefox** 60+
- **Safari** 12+
- **Edge** 79+
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork or download the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request or share your changes

**Note**: This is a static HTML application, so you can also simply edit the files directly and test locally.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Dataset thumbnails from [Pexels](https://www.pexels.com/)
- Icons from [Lucide](https://lucide.dev/)
- Design inspiration from modern data catalog interfaces

## 📞 Support

For questions, issues, or contributions:
- Contact the development team
- Check the deployment guides for troubleshooting
- Review the troubleshooting sections in this README

---

**Built with ❤️ for the AI and Data community**