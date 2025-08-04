// blog.js - Dynamically loads blog posts for blog.html and homepage

const posts = [
  {
    filename: "2025-08-04-rethinking-ai-integration-mcp-and-a2a.html",
    date: "2025-08-04",
    tags: ["AI", "MCP", "A2A", "Integration", "Protocols"],
    snippet: "Exploring two emerging protocols—Model Context Protocol (MCP) and Agent-to-Agent (A2A)—that promise to reshape how we build, secure, and scale AI systems."
  },
  {
    filename: "2025-07-29-microsfot-copilot-tuning-presentation-at-microsoft-copilot-user-group.html",
    date: "2025-07-29",
    tags: ["AI", "MLOps", "Azure"],
    snippet: "A practical look at Microsoft Copilot Tuning, featuring insights and real-world examples."
  },
  {
    filename: "2019-05-20-microsoft-build-2019-updates.html",
    date: "2019-05-20",
    tags: ["Microsoft", "Build", "Conference"],
    snippet: "Key takeaways and highlights from Microsoft Build 2019 for developers and tech leaders."
  },
  {
    filename: "2019-04-05-ai-and-iot-integration-on-the-edge.html",
    date: "2019-04-05",
    tags: ["AI", "IoT", "Edge"],
    snippet: "How AI and IoT are converging at the edge to enable smarter, faster solutions."
  },
  {
    filename: "2018-11-14-azure-monthly-news-summary-november-2018.html",
    date: "2018-11-14",
    tags: ["Azure", "News", "Cloud"],
    snippet: "A summary of the most important Azure news and updates for November 2018."
  },
  {
    filename: "2018-09-12-azure-monthly-news-summary-september-2018.html",
    date: "2018-09-12",
    tags: ["Azure", "News", "Cloud"],
    snippet: "September 2018's top Azure announcements and what they mean for your projects."
  },
  {
    filename: "2018-09-01-high-availability-for-azure-iot-edge-devices.html",
    date: "2018-09-01",
    tags: ["Azure", "IoT", "High Availability"],
    snippet: "Ensuring high availability for Azure IoT Edge devices in production environments."
  }
  // ...add more posts as needed...
];

// Helper to generate a UI Avatars thumbnail
function getThumbnail(title) {
  const initials = title.split(' ').map(w => w[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=128&background=random`;
}

// --- Homepage: render top blog posts as cards if #blog-cards-list exists ---
(function () {
  const blogCardsList = document.getElementById('blog-cards-list');
  if (blogCardsList) {
    // Show top 6 posts as cards, 3 per row
    blogCardsList.innerHTML = '';
    posts.slice(0, 6).forEach(post => {
      const title = post.filename.replace(/^[\d-]+/, '').replace(/-/g, ' ').replace(/\.html$/, '').replace(/\b\w/g, c => c.toUpperCase());
      const url = `blog.html?post=${encodeURIComponent(post.filename)}`;
      const card = document.createElement('div');
      card.className = 'col-md-4 mb-4';
      card.innerHTML = `
        <div class="card h-100">
          <img src="${getThumbnail(title)}" class="card-img-top" alt="Post thumbnail">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${title}</h5>
            <div class="mb-2 text-muted" style="font-size:0.95em;">${post.date}</div>
            <div class="mb-2">
              ${post.tags.map(tag => `<span class='badge bg-secondary me-1'>${tag}</span>`).join(' ')}
            </div>
            <p class="card-text mb-2">${post.snippet}</p>
            <a href="${url}" class="btn btn-primary mt-auto">Read More</a>
          </div>
        </div>
      `;
      blogCardsList.appendChild(card);
    });
  }
})();

// --- Dynamic loader for blog.html ---
(function () {
  const blogContent = document.getElementById('blog-content');
  if (!blogContent) return;
  // Helper to get query param
  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  // Render a single post fragment into #blog-content
  function loadPost(postFilename) {
    blogContent.innerHTML = '<div class="text-center my-5"><div class="spinner-border" role="status"></div></div>';
    fetch(`blog-posts/${postFilename}`)
      .then(resp => {
        if (!resp.ok) throw new Error('Not found');
        return resp.text();
      })
      .then(html => {
        blogContent.innerHTML = html + '<div class="mt-4"><a href="blog.html" class="btn btn-outline-secondary">&larr; Back to Blog List</a></div>';
        window.scrollTo(0, 0);
      })
      .catch(() => {
        blogContent.innerHTML = '<div class="alert alert-danger mt-5">Blog post not found.</div>';
      });
  }

  // Render the list of blog post cards (show all posts)
  function renderBlogList() {
    const row = document.createElement('div');
    row.className = 'row';
    posts.forEach(post => {
      const title = post.filename.replace(/^[\d-]+/, '').replace(/-/g, ' ').replace(/\.html$/, '').replace(/\b\w/g, c => c.toUpperCase());
      const url = `blog.html?post=${encodeURIComponent(post.filename)}`;
      const card = document.createElement('div');
      card.className = 'col-md-6 col-lg-4 mb-4';
      card.innerHTML = `
        <div class="card h-100">
          <img src="${getThumbnail(title)}" class="card-img-top" alt="Post thumbnail">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${title}</h5>
            <div class="mb-2 text-muted" style="font-size:0.95em;">${post.date}</div>
            <div class="mb-2">
              ${post.tags.map(tag => `<span class='badge bg-secondary me-1'>${tag}</span>`).join(' ')}
            </div>
            <p class="card-text mb-2">${post.snippet}</p>
            <a href="${url}" class="btn btn-primary mt-auto">Read More</a>
          </div>
        </div>
      `;
      row.appendChild(card);
    });
    blogContent.innerHTML = '';
    blogContent.appendChild(row);
  }

  // Main logic
  const postParam = getQueryParam('post');
  if (postParam) {
    loadPost(postParam);
  } else {
    renderBlogList();
  }
})();
