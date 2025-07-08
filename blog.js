// blog.js - Dynamically loads blog posts as cards for the homepage

const posts = [
  {
    filename: "2019-07-18-mlops_on_azure_by_rolf_tesmer.html",
    date: "2019-07-18",
    tags: ["AI", "MLOps", "Azure"],
    snippet: "A practical look at MLOps on Azure, featuring Rolf Tesmer's insights and real-world examples."
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

const blogCardsList = document.getElementById('blog-cards-list');
const showMoreBtn = document.createElement('button');
showMoreBtn.className = 'btn btn-outline-primary mt-3 w-100';
showMoreBtn.textContent = 'Show More';
let visibleCount = 6;

function renderPosts() {
  blogCardsList.innerHTML = '';
  posts.slice(0, visibleCount).forEach(post => {
    const title = post.filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ').replace(/\.html$/, '').replace(/\b\w/g, c => c.toUpperCase());
    const url = `blog-posts/${post.filename}`;
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
          <a href="${url}" target="_blank" class="btn btn-primary mt-auto">Read More</a>
        </div>
      </div>
    `;
    blogCardsList.appendChild(card);
  });
  if (visibleCount < posts.length) {
    const wrapper = document.createElement('div');
    wrapper.className = 'col-12';
    wrapper.appendChild(showMoreBtn);
    blogCardsList.appendChild(wrapper);
  }
}

showMoreBtn.onclick = function() {
  visibleCount += 6;
  renderPosts();
};

renderPosts();
