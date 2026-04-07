<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Data Hub - Comprehensive Dataset Library</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        background-color: #f8f9fa;
        color: #333;
        line-height: 1.6;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px 48px 20px;
      }

      .header {
        background: white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border-bottom: 1px solid #e5e7eb;
        margin-bottom: 40px;
      }

      .header-content {
        max-width: 1280px;
        margin: 0 auto;
        padding: 24px 16px;
      }

      .header-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-logo-img {
        width: 44px;
        height: 44px;
        object-fit: contain;
        flex-shrink: 0;
      }

      .header-text h1 {
        font-size: 20px;
        font-weight: 700;
        color: #111827;
        margin: 0;
        line-height: 1.2;
      }

      .header-text p {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
        line-height: 1.2;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #6b7280;
      }

      .header-right svg {
        width: 16px;
        height: 16px;
      }

      .hero-section {
        margin-bottom: 32px;
      }

      .hero-title {
        font-size: 30px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 16px;
        line-height: 1.2;
      }

      .hero-description {
        font-size: 18px;
        color: #6b7280;
        line-height: 1.6;
        max-width: 768px;
      }

      .search-section {
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border: 1px solid #e5e7eb;
        padding: 16px;
        margin-bottom: 24px;
      }

      .search-container {
        flex: 1;
        min-width: 300px;
        position: relative;
      }

      .search-input {
        width: 100%;
        padding: 8px 12px 8px 40px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 16px;
        transition: all 0.2s ease;
        background: white;
      }

      .search-input:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        font-size: 16px;
      }

      .filter-select {
        padding: 8px 12px 8px 40px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 16px;
        background: white;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 150px;
        appearance: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 8px center;
        background-repeat: no-repeat;
        background-size: 16px;
        padding-right: 32px;
      }

      .filter-select:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      .search-row {
        display: flex;
        gap: 16px;
        align-items: center;
      }

      .filter-container {
        position: relative;
      }

      .filter-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        font-size: 16px;
      }

      .datasets-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .datasets-title {
        font-size: 20px;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }

      .datasets-count {
        font-size: 14px;
        color: #6b7280;
      }

      .datasets-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-top: 30px;
        align-items: stretch;
      }
      
      @media (max-width: 1200px) {
        .datasets-grid { grid-template-columns: repeat(2, 1fr); }
      }
      
      @media (max-width: 640px) {
        .datasets-grid { grid-template-columns: 1fr; }
      }

      .dataset-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
        border: 1px solid #e1e5e9;
      }

      .dataset-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      .dataset-thumbnail {
        flex-shrink: 0;
        width: 100%;
        height: 192px;
        object-fit: cover;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        color: #6c757d;
      }

      .dataset-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 24px;
      }

      .dataset-description {
        flex: 1;
      }

      .dataset-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }

      .dataset-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
        flex: 1;
      }

      .category-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-left: 12px;
        flex-shrink: 0;
      }

      .category-editorial { background: #e3f2fd; color: #1976d2; }
      .category-audience { background: #fff3e0; color: #f57c00; }
      .category-content { background: #e8f5e8; color: #388e3c; }
      .category-social { background: #fce4ec; color: #c2185b; }
      .category-streaming { background: #e1f5fe; color: #0288d1; }
      .category-audio { background: #f3e5f5; color: #7b1fa2; }
      .category-advertising { background: #fff8e1; color: #f9a825; }
      .category-commerce { background: #e8eaf6; color: #3949ab; }

      .dataset-description {
        color: #6c757d;
        font-size: 0.95rem;
        line-height: 1.5;
        margin-bottom: 20px;
      }

      .dataset-stats {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        color: #6c757d;
      }

      .stat-icon {
        width: 16px;
        height: 16px;
        opacity: 0.7;
      }

      @media (max-width: 768px) {
        .search-section {
          flex-direction: column;
        }
        
        .search-container {
          min-width: 100%;
        }
        
        .filter-select {
          min-width: 100%;
        }
        
        .datasets-grid {
          grid-template-columns: 1fr;
        }
        
        .header h1 {
          font-size: 2rem;
        }
      }
    </style>
  </head>
  <body>
    <header class="header">
      <div class="header-content">
        <div class="header-main">
          <div class="header-left">
            <img src="logo.png" alt="Data Hub" class="header-logo-img" />
            <div class="header-text">
              <h1>Data Hub</h1>
              <p>Comprehensive Dataset Library</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="container">
      <div class="hero-section">
        <h2 class="hero-title">Explore Our Data Collections</h2>
        <p class="hero-description">Access comprehensive datasets across social media, streaming, audio, and digital content. Each dataset includes detailed documentation, sample data, and complete data dictionaries to support your research and analysis needs.</p>
      </div>

      <div class="search-section">
        <div class="search-row">
          <div class="search-container">
            <div class="search-icon">🔍</div>
            <input 
              type="text" 
              id="searchInput" 
              class="search-input" 
              placeholder="Search datasets..."
            />
          </div>
          <div class="filter-container">
            <div class="filter-icon">⚙️</div>
            <select id="categoryFilter" class="filter-select">
              <option value="">All</option>
              <option value="Editorial">Editorial</option>
              <option value="Audience">Audience</option>
              <option value="Content">Content</option>
              <option value="Social Media">Social Media</option>
              <option value="Streaming">Streaming</option>
              <option value="Audio">Audio</option>
              <option value="Advertising">Advertising</option>
              <option value="Commerce">Commerce</option>
            </select>
          </div>
        </div>
      </div>

      <div class="datasets-header">
        <h3 class="datasets-title">Available Datasets</h3>
        <span class="datasets-count" id="datasetsCount">8 datasets found</span>
      </div>

      <div id="datasetsGrid" class="datasets-grid">
        <!-- Editorial Data -->
        <div class="dataset-card" data-href="editorial-data.html">
          <div class="dataset-thumbnail">
            <img src="https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Editorial Data" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 48px; color: #6c757d;">📊</div>
          </div>
          <div class="dataset-content">
            <div class="dataset-header">
              <h3 class="dataset-title">Editorial Data</h3>
              <span class="category-badge category-editorial">Editorial</span>
            </div>
            <p class="dataset-description">Comprehensive consumable content including articles, cards, videos, images, recipes, and other editorial assets with full versioning and lineage tracking.</p>
            <div class="dataset-stats">
              <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span>Updated: 2024-12-15</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📊</span>
                <span>Records: 5,000,000</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💾</span>
                <span>Size: TBD GB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Audience Data -->
        <div class="dataset-card" data-href="audience-data.html">
          <div class="dataset-thumbnail">
            <img src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Audience Data" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 48px; color: #6c757d;">📊</div>
          </div>
          <div class="dataset-content">
            <div class="dataset-header">
              <h3 class="dataset-title">Audience Demographics & Behavior</h3>
              <span class="category-badge category-audience">Audience</span>
            </div>
            <p class="dataset-description">Detailed audience data including demographics, interests, and online behavior patterns for targeted content delivery.</p>
            <div class="dataset-stats">
              <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span>Updated: 2024-12-14</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📊</span>
                <span>Records: 3,500,000</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💾</span>
                <span>Size: 2.1 GB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Performance -->
        <div class="dataset-card" data-href="content-performance.html">
          <div class="dataset-thumbnail">
            <img src="https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Content Performance" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 48px; color: #6c757d;">📊</div>
          </div>
          <div class="dataset-content">
            <div class="dataset-header">
              <h3 class="dataset-title">Digital Content Performance</h3>
              <span class="category-badge category-content">Content</span>
            </div>
            <p class="dataset-description">Cross-platform content performance metrics including engagement rates, reach, and conversion analytics.</p>
            <div class="dataset-stats">
              <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span>Updated: 2024-12-08</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📊</span>
                <span>Records: 1,250,000</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💾</span>
                <span>Size: 890 MB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Social Media Engagement -->
        <div class="dataset-card" data-href="social-media-engagement.html">
          <div class="dataset-thumbnail">
            <img src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Social Media Engagement" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 48px; color: #6c757d;">📊</div>
          </div>
          <div class="dataset-content">
            <div class="dataset-header">
              <h3 class="dataset-title">Social Media Engagement Metrics</h3>
              <span class="category-badge category-social">Social Media</span>
            </div>
            <p class="dataset-description">Comprehensive engagement data across major social platforms including likes, shares, comments, and reach metrics.</p>
            <div class="dataset-stats">
              <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span>Updated: 2024-12-15</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📊</span>
                <span>Records: 2,500,000</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💾</span>
                <span>Size: 1.2 GB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Streaming Viewership -->
        <div class="dataset-card" data-href="streaming-viewership.html">
          <div class="dataset-thumbnail">
            <img src="https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Streaming Viewership" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 48px; color: #6c757d;">📊</div>
          </div>
          <div class="dataset-content">
            <div class="dataset-header">
              <h3 class="dataset-title">Streaming Platform Viewership</h3>
              <span class="category-badge category-streaming">Streaming</span>
            </div>
            <p class="dataset-description">Detailed viewership analytics from multiple streaming platforms with demographic breakdowns and viewing patterns.</p>
            <div class="dataset-stats">
              <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span>Updated: 2024-12-10</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📊</span>
                <span>Records: 5,500,000</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💾</span>
                <span>Size: 3.4 GB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Podcast Analytics -->
        <div class="dataset-card" data-href="podcast-analytics.html">
          <div class="dataset-thumbnail">
            <img src="https://images.pexels.com/photos/6953876/pexels-photo-6953876.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Podcast Analytics" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 48px; color: #6c757d;">📊</div>
          </div>
          <div class="dataset-content">
            <div class="dataset-header">
              <h3 class="dataset-title">Podcast Listening Analytics</h3>
              <span class="category-badge category-audio">Audio</span>
            </div>
            <p class="dataset-description">In-depth podcast consumption data including episode performance, listener retention, and geographic distribution.</p>
            <div class="dataset-stats">
              <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span>Updated: 2024-12-12</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📊</span>
                <span>Records: 900,000</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💾</span>
                <span>Size: 580 MB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ad Performance -->
        <div class="dataset-card" data-href="ad-performance.html">
          <div class="dataset-thumbnail">
            <img src="https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Ad Performance" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 48px; color: #6c757d;">📊</div>
          </div>
          <div class="dataset-content">
            <div class="dataset-header">
              <h3 class="dataset-title">Advertising Campaign Performance</h3>
              <span class="category-badge category-advertising">Advertising</span>
            </div>
            <p class="dataset-description">Comprehensive advertising metrics across digital platforms with ROI analysis and audience targeting effectiveness.</p>
            <div class="dataset-stats">
              <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span>Updated: 2024-12-11</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📊</span>
                <span>Records: 700,000</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💾</span>
                <span>Size: 420 MB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Commerce Analytics -->
        <div class="dataset-card" data-href="commerce-analytics.html">
          <div class="dataset-thumbnail">
            <img src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Commerce Analytics" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 48px; color: #6c757d;">📊</div>
          </div>
          <div class="dataset-content">
            <div class="dataset-header">
              <h3 class="dataset-title">Commerce & E‑commerce Analytics</h3>
              <span class="category-badge category-commerce">Commerce</span>
            </div>
            <p class="dataset-description">Transaction data, conversion funnels, cart analytics, and revenue metrics across product categories and customer segments.</p>
            <div class="dataset-stats">
              <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span>Updated: 2024-12-13</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📊</span>
                <span>Records: 2,000,000</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💾</span>
                <span>Size: 1.8 GB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Commerce Analytics (Sales Channels) -->
        <div class="dataset-card" data-href="commerce-analytics.html">
          <div class="dataset-thumbnail">
            <img src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Commerce Analytics" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 48px; color: #6c757d;">🛒</div>
          </div>
          <div class="dataset-content">
            <div class="dataset-header">
              <h3 class="dataset-title">Commerce & E‑commerce Analytics</h3>
              <span class="category-badge category-commerce">Commerce</span>
            </div>
            <p class="dataset-description">Transaction data, conversion funnels, cart analytics, and revenue metrics across product categories and sales channels.</p>
            <div class="dataset-stats">
              <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span>Updated: 2024-12-13</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📊</span>
                <span>Records: 2,000,000</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💾</span>
                <span>Size: 1.1 GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      // Simple search and filter functionality that works in iframes
      document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const datasetCards = document.querySelectorAll('.dataset-card');

        function filterDatasets() {
          const searchTerm = searchInput.value.toLowerCase();
          const selectedCategory = categoryFilter.value;

          datasetCards.forEach(card => {
            const title = card.querySelector('.dataset-title').textContent.toLowerCase();
            const description = card.querySelector('.dataset-description').textContent.toLowerCase();
            const category = card.querySelector('.category-badge').textContent;

            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesCategory = selectedCategory === 'All' || category === selectedCategory;

            if (matchesSearch && matchesCategory) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        }

        searchInput.addEventListener('input', filterDatasets);
        categoryFilter.addEventListener('change', filterDatasets);

        datasetCards.forEach(card => {
          card.addEventListener('click', function() {
            const href = this.getAttribute('data-href');
            if (href) window.location.href = href;
          });
        });
      });
    </script>
  </body>
</html>
