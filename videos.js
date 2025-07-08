// videos.js - Handles dynamic video section rendering

const videos = [
    {
        title: "KEDA Talk",
        desc: "KEDA: Kubernetes-based Event Driven Autoscaling",
        youtubeId: "-fpBGlxNNSk",
        url: "https://www.youtube.com/watch?v=-fpBGlxNNSk"
    },
    {
        title: "Sustainability in IoT Projects",
        desc: "Sustainability in IoT Projects",
        youtubeId: "kRELXEeyIX8",
        url: "https://www.youtube.com/watch?v=kRELXEeyIX8"
    },
    {
        title: "DDD Perth Talk",
        desc: "Talk at DDD Perth Conference",
        youtubeId: "yikSzz9l2qU",
        url: "https://www.youtube.com/watch?v=yikSzz9l2qU"
    },
    {
        title: "NDC Talk",
        desc: "Talk at NDC Conference",
        youtubeId: "22CJNW_0sH4",
        url: "https://www.youtube.com/watch?v=22CJNW_0sH4"
    },
    {
        title: "NDC Talk 2",
        desc: "Second talk at NDC Conference",
        youtubeId: "3_zCtScT05Y",
        url: "https://www.youtube.com/watch?v=3_zCtScT05Y"
    },
    {
        title: "vNEXT Webinar",
        desc: "Webinar by vNEXT",
        youtubeId: "gdzZUHQSm3A",
        url: "https://www.youtube.com/watch?v=gdzZUHQSm3A"
    },
    {
        title: "IoT Lessons",
        desc: "Lessons learned from IoT projects",
        youtubeId: "9WIJwi06aEg",
        url: "https://www.youtube.com/watch?v=9WIJwi06aEg"
    }
];

let videosShown = 0;
const videosPerPage = 3;

function renderVideos() {
    const section = document.getElementById('videos-section');
    if (!section) return;
    let html = '';
    for (let i = 0; i < videosShown; i++) {
        const v = videos[i];
        html += `
        <div class="col-md-4 mb-3">
            <div class="card h-100">
                <img src="https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg" class="card-img-top" alt="${v.title}">
                <div class="card-body">
                    <h5 class="card-title">${v.title}</h5>
                    <p class="card-text">${v.desc}</p>
                </div>
                <div class="card-footer bg-white border-0">
                    <a href="${v.url}" target="_blank" class="btn btn-primary w-100">Watch Video</a>
                </div>
            </div>
        </div>
        `;
    }
    section.innerHTML = html;
    const btn = document.getElementById('show-more-videos');
    if (btn) btn.style.display = (videosShown >= videos.length) ? 'none' : 'inline-block';
}

window.initVideosSection = function() {
    videosShown = Math.min(videosPerPage, videos.length);
    renderVideos();
    const btn = document.getElementById('show-more-videos');
    if (btn) {
        btn.onclick = function() {
            videosShown = Math.min(videosShown + videosPerPage, videos.length);
            renderVideos();
        };
    }
}
