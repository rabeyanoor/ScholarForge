import './style.css';

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// State Management
const appState = {
  papers: [],
  filteredPapers: [],
  currentUser: JSON.parse(localStorage.getItem('sf_user')) || null,
  token: localStorage.getItem('sf_token') || null,
  activeCategory: 'All',
  searchQuery: '',
  sortBy: '-createdAt',
  apiStatus: 'checking',
  bookmarks: JSON.parse(localStorage.getItem('sf_bookmarks')) || []
};

// Fallback initial papers
const INITIAL_PAPERS = [
  {
    _id: "6650a1b2c3d4e5f678901234",
    title: "Quantum Error Correction in Topologically Ordered Systems",
    abstract: "We present a fault-tolerant quantum error correction scheme using surface codes on 2D lattice geometries. Our approach achieves threshold error rates under realistic decoherence noise.",
    authors: ["Dr. Elena Rostova", "Prof. Alexander Vance"],
    doi: "10.1038/s41586-026-04821-x",
    pdfUrl: "https://arxiv.org/pdf/2401.00001.pdf",
    citations: 142,
    tags: ["Quantum Computing", "Physics", "Error Correction"],
    uploadedBy: { _id: "u1", name: "Dr. Elena Rostova", role: "researcher" },
    createdAt: "2026-05-14T10:00:00.000Z"
  },
  {
    _id: "6650a1b2c3d4e5f678901235",
    title: "Transformer-Based Multimodal Reasoning in Academic Publishing",
    abstract: "This study explores automated peer-review assistance using multimodal transformer models to detect methodological flaws and citation anomalies in draft manuscripts.",
    authors: ["Prof. Marcus Vance", "Dr. Sophia Chen"],
    doi: "10.1145/3618257.3624801",
    pdfUrl: "https://arxiv.org/pdf/2401.00002.pdf",
    citations: 89,
    tags: ["Machine Learning", "NLP", "Academic AI"],
    uploadedBy: { _id: "u2", name: "Prof. Marcus Vance", role: "professor" },
    createdAt: "2026-05-20T14:30:00.000Z"
  },
  {
    _id: "6650a1b2c3d4e5f678901236",
    title: "CRISPR-Cas13 Precision RNA Editing for Rare Genetic Disorders",
    abstract: "We demonstrate target-specific transcriptome editing using engineered Cas13 variants without off-target DNA alterations, opening new therapeutic pathways.",
    authors: ["Dr. Sarah Lin", "Dr. Robert Thorne"],
    doi: "10.1016/j.cell.2026.04.012",
    pdfUrl: "https://arxiv.org/pdf/2401.00003.pdf",
    citations: 215,
    tags: ["Biotechnology", "Genomics", "CRISPR"],
    uploadedBy: { _id: "u3", name: "Dr. Sarah Lin", role: "researcher" },
    createdAt: "2026-06-02T09:15:00.000Z"
  },
  {
    _id: "6650a1b2c3d4e5f678901237",
    title: "Decentralized Peer Review Protocols via Zero-Knowledge Proofs",
    abstract: "A novel cryptographically secure protocol for double-blind academic reviews that preserves author anonymity while guaranteeing reviewer credentials verification.",
    authors: ["Alex Rivera", "Dr. Vikram Patel"],
    doi: "10.1109/TIT.2026.981240",
    pdfUrl: "https://arxiv.org/pdf/2401.00004.pdf",
    citations: 64,
    tags: ["Cybersecurity", "Blockchain", "Cryptography"],
    uploadedBy: { _id: "u4", name: "Alex Rivera", role: "researcher" },
    createdAt: "2026-06-10T16:45:00.000Z"
  },
  {
    _id: "6650a1b2c3d4e5f678901238",
    title: "Atmospheric Carbon Capture Optimization using Metal-Organic Frameworks",
    abstract: "High-throughput computational screening of 50,000 MOF structures to identify optimal pore geometries for selective CO2 adsorption at ambient temperatures.",
    authors: ["Dr. David O'Connor", "Prof. Mei-Ling Huang"],
    doi: "10.1021/acscatal.6b01234",
    pdfUrl: "https://arxiv.org/pdf/2401.00005.pdf",
    citations: 178,
    tags: ["Renewable Energy", "Chemistry", "Sustainability"],
    uploadedBy: { _id: "u5", name: "Dr. David O'Connor", role: "professor" },
    createdAt: "2026-06-18T11:20:00.000Z"
  },
  {
    _id: "6650a1b2c3d4e5f678901239",
    title: "Neural Architecture Search for Ultra-Low Power Edge Computing",
    abstract: "An automated hardware-aware NAS framework designed for real-time sensor processing on sub-milliwatt microcontrollers with minimal accuracy degradation.",
    authors: ["Prof. Priya Sharma", "Kaito Tanaka"],
    doi: "10.1109/TPAMI.2026.314902",
    pdfUrl: "https://arxiv.org/pdf/2401.00006.pdf",
    citations: 92,
    tags: ["Edge AI", "Computer Vision", "Embedded Systems"],
    uploadedBy: { _id: "u6", name: "Prof. Priya Sharma", role: "professor" },
    createdAt: "2026-06-25T13:10:00.000Z"
  }
];

// Initialize App
function initApp() {
  renderApp();
  fetchBackendHealth();
  fetchPapers();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Main Render Function
function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Header Navbar -->
    <header class="navbar">
      <a href="#" class="nav-brand" id="brand-link">
        <div class="brand-icon">
          <i class="fa-solid fa-atom"></i>
        </div>
        <div class="brand-title">ScholarForge</div>
      </a>
      <ul class="nav-links">
        <li><a class="nav-link active" id="nav-explore"><i class="fa-regular fa-compass"></i> Explore</a></li>
        <li><a class="nav-link" id="nav-bookmarks"><i class="fa-regular fa-bookmark"></i> Saved (${appState.bookmarks.length})</a></li>
        <li>
          <div class="status-badge" id="api-status-badge">
            <div class="status-dot"></div>
            <span id="api-status-text">Backend Active</span>
          </div>
        </li>
      </ul>
      <div class="nav-actions">
        <button class="btn btn-secondary" id="btn-publish">
          <i class="fa-regular fa-file-lines"></i> Publish
        </button>
        ${
          appState.currentUser
            ? `
            <div class="user-badge">
              <div class="user-avatar">${appState.currentUser.name.charAt(0)}</div>
              <span>${appState.currentUser.name}</span>
              <button class="btn btn-sm btn-secondary" id="btn-logout" title="Logout"><i class="fa-solid fa-right-from-bracket"></i></button>
            </div>
            `
            : `
            <button class="btn btn-primary" id="btn-login-modal">
              <i class="fa-regular fa-user"></i> Sign In
            </button>
            `
        }
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-pill">
        <i class="fa-solid fa-wand-magic-sparkles" style="color:#2563EB;"></i> Accelerated Academic Publishing Platform
      </div>
      <h1 class="hero-title">
        Forge the future of <span class="title-serif-italic-blue">academic</span> <br/>
        <span class="title-serif-italic-orange">research</span>
      </h1>
      <p class="hero-subtitle">
        Explore, publish, and peer-review high-impact scientific work. Verified citations, open-access repositories, and automated indexing &mdash; built for the modern lab.
      </p>

      <div class="hero-search-box">
        <i class="fa-solid fa-magnifying-glass hero-search-icon"></i>
        <input 
          type="text" 
          class="hero-search-input" 
          id="search-input" 
          placeholder="Search by paper title, abstract, DOI, or author..."
          value="${appState.searchQuery}"
        />
        <button class="hero-search-btn" id="search-btn">Search &rarr;</button>
      </div>

      <div class="category-pills" id="category-container">
        ${['All', 'Quantum Computing', 'Machine Learning', 'Biotechnology', 'Cybersecurity', 'Renewable Energy', 'Edge AI']
          .map(
            cat => `
            <button class="cat-pill ${appState.activeCategory === cat ? 'active' : ''}" data-cat="${cat}">
              ${cat}
            </button>
          `
          )
          .join('')}
      </div>
    </section>

    <!-- Key Metrics Grid -->
    <section class="stats-container">
      <div class="stat-card">
        <div class="stat-icon-wrapper"><i class="fa-regular fa-book-open"></i></div>
        <div>
          <div class="stat-number" id="stat-total-papers">${appState.papers.length || 6}+</div>
          <div class="stat-label">Indexed Publications</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper"><i class="fa-solid fa-users"></i></div>
        <div>
          <div class="stat-number">850+</div>
          <div class="stat-label">Verified Researchers</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper"><i class="fa-solid fa-quote-left"></i></div>
        <div>
          <div class="stat-number">45.2K</div>
          <div class="stat-label">Global Citations</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper"><i class="fa-solid fa-lock-open"></i></div>
        <div>
          <div class="stat-number">100%</div>
          <div class="stat-label">Open Access</div>
        </div>
      </div>
    </section>

    <!-- Main Dashboard Section -->
    <main class="dashboard-container">
      <div class="dashboard-header">
        <h2 class="dashboard-title">
          <i class="fa-solid fa-layer-group" style="font-size:1.6rem; color:#2563EB;"></i> Research Papers
        </h2>
        <div class="controls-group">
          <label style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">Sort by:</label>
          <select class="select-input" id="sort-select">
            <option value="-createdAt" ${appState.sortBy === '-createdAt' ? 'selected' : ''}>Newest First</option>
            <option value="-citations" ${appState.sortBy === '-citations' ? 'selected' : ''}>Most Cited</option>
            <option value="title" ${appState.sortBy === 'title' ? 'selected' : ''}>Title A-Z</option>
          </select>
        </div>
      </div>

      <div class="papers-grid" id="papers-grid">
        <!-- Rendered Paper Cards dynamically -->
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-brand"><i class="fa-solid fa-atom"></i> ScholarForge</div>
      <p>Empowering researchers worldwide with transparent peer review and instant DOI publishing.</p>
      <p style="margin-top:0.75rem; font-size:0.78rem;">&copy; 2026 ScholarForge Platform. All rights reserved.</p>
    </footer>

    <!-- Modals Container -->
    <div id="modal-container"></div>
  `;

  attachEventListeners();
  renderPapersGrid();
}

// Fetch Backend Health Status
async function fetchBackendHealth() {
  const badge = document.getElementById('api-status-badge');
  const statusText = document.getElementById('api-status-text');
  try {
    const res = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (res.ok) {
      appState.apiStatus = 'online';
      if (badge && statusText) {
        badge.style.background = '#ECFDF5';
        badge.style.borderColor = '#A7F3D0';
        statusText.innerText = 'Backend Active';
      }
    }
  } catch (err) {
    appState.apiStatus = 'offline';
    if (badge && statusText) {
      statusText.innerText = 'Standby Mode (Local)';
    }
  }
}

// Fetch Papers from Backend API
async function fetchPapers() {
  try {
    const res = await fetch(`${API_BASE_URL}/papers`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      appState.papers = json.data;
    } else {
      appState.papers = INITIAL_PAPERS;
    }
  } catch (err) {
    console.warn('API error, using initial papers store:', err);
    appState.papers = INITIAL_PAPERS;
  }
  applyFilterAndSort();
}

// Filter and Sort Papers
function applyFilterAndSort() {
  let list = [...appState.papers];

  // Category filter
  if (appState.activeCategory !== 'All') {
    list = list.filter(p => p.tags && p.tags.includes(appState.activeCategory));
  }

  // Search Query filter
  if (appState.searchQuery.trim()) {
    const q = appState.searchQuery.toLowerCase();
    list = list.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        (p.authors && p.authors.some(a => a.toLowerCase().includes(q))) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  // Sort
  if (appState.sortBy === '-createdAt') {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (appState.sortBy === '-citations') {
    list.sort((a, b) => b.citations - a.citations);
  } else if (appState.sortBy === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  appState.filteredPapers = list;
  renderPapersGrid();
}

// Render Paper Cards Grid
function renderPapersGrid() {
  const grid = document.getElementById('papers-grid');
  if (!grid) return;

  if (appState.filteredPapers.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-file-circle-xmark empty-icon"></i>
        <h3>No matching papers found</h3>
        <p style="color:var(--text-muted); margin-top:0.5rem;">Try adjusting your search filters or publish a new research paper.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = appState.filteredPapers
    .map(paper => {
      const isBookmarked = appState.bookmarks.includes(paper._id);
      const authorsStr = Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors;
      const tags = Array.isArray(paper.tags) ? paper.tags : [paper.tags];

      return `
        <article class="paper-card" data-id="${paper._id}">
          <div class="card-top">
            <div class="tag-list">
              ${tags.map(t => `<span class="tag-pill">${t}</span>`).join('')}
            </div>
            <h3 class="paper-title" onclick="openPaperDetails('${paper._id}')">${paper.title}</h3>
            <div class="paper-authors">
              <i class="fa-solid fa-feather-pointed" style="color:var(--accent-blue)"></i> ${authorsStr}
            </div>
            <p class="paper-abstract">${paper.abstract}</p>
          </div>

          <div>
            <div class="card-meta">
              <span class="meta-item"><i class="fa-solid fa-quote-left"></i> ${paper.citations} Citations</span>
              <span class="meta-item"><i class="fa-solid fa-barcode"></i> DOI: ${paper.doi || '10.1038/sf.2026.01'}</span>
            </div>

            <div class="card-actions">
              <button class="btn btn-sm btn-secondary" onclick="openPaperDetails('${paper._id}')">
                <i class="fa-solid fa-book-open"></i> Read
              </button>
              <button class="btn btn-sm btn-secondary" onclick="openCiteModal('${paper._id}')">
                <i class="fa-solid fa-quote-right"></i> Cite
              </button>
              <button class="btn btn-sm ${isBookmarked ? 'btn-primary' : 'btn-secondary'}" onclick="toggleBookmark('${paper._id}')" title="Bookmark">
                <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark"></i>
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

// Event Listeners setup
function attachEventListeners() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      appState.searchQuery = e.target.value;
      applyFilterAndSort();
    });
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') applyFilterAndSort();
    });
  }

  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      applyFilterAndSort();
    });
  }

  const catContainer = document.getElementById('category-container');
  if (catContainer) {
    catContainer.addEventListener('click', e => {
      const btn = e.target.closest('.cat-pill');
      if (btn) {
        document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        appState.activeCategory = btn.dataset.cat;
        applyFilterAndSort();
      }
    });
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      appState.sortBy = e.target.value;
      applyFilterAndSort();
    });
  }

  const navBookmarks = document.getElementById('nav-bookmarks');
  if (navBookmarks) {
    navBookmarks.addEventListener('click', () => {
      appState.activeCategory = 'All';
      appState.filteredPapers = appState.papers.filter(p => appState.bookmarks.includes(p._id));
      renderPapersGrid();
    });
  }

  const navExplore = document.getElementById('nav-explore');
  if (navExplore) {
    navExplore.addEventListener('click', () => {
      appState.activeCategory = 'All';
      applyFilterAndSort();
    });
  }

  const btnPublish = document.getElementById('btn-publish');
  if (btnPublish) {
    btnPublish.addEventListener('click', openPublishModal);
  }

  const btnLoginModal = document.getElementById('btn-login-modal');
  if (btnLoginModal) {
    btnLoginModal.addEventListener('click', openAuthModal);
  }

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }
}

// Toggle Bookmark
window.toggleBookmark = function(paperId) {
  const index = appState.bookmarks.indexOf(paperId);
  if (index === -1) {
    appState.bookmarks.push(paperId);
  } else {
    appState.bookmarks.splice(index, 1);
  }
  localStorage.setItem('sf_bookmarks', JSON.stringify(appState.bookmarks));
  renderApp();
};

// Open Paper Detail Modal
window.openPaperDetails = function(paperId) {
  const paper = appState.papers.find(p => p._id === paperId);
  if (!paper) return;

  const authorsStr = Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors;
  const tags = Array.isArray(paper.tags) ? paper.tags : [paper.tags];

  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="modal-overlay active" id="details-modal">
      <div class="modal-content" style="max-width:720px;">
        <div class="modal-header">
          <div class="tag-list">
            ${tags.map(t => `<span class="tag-pill">${t}</span>`).join('')}
          </div>
          <button class="modal-close" onclick="closeModal('details-modal')">&times;</button>
        </div>

        <h2 style="font-size:1.5rem; margin-bottom:0.75rem; color:var(--text-dark); font-family:var(--font-sans); font-weight:700;">${paper.title}</h2>
        
        <div style="display:flex; align-items:center; gap:1.5rem; margin-bottom:1.25rem; font-size:0.85rem; color:var(--text-muted);">
          <span><i class="fa-solid fa-users" style="color:var(--accent-blue)"></i> ${authorsStr}</span>
          <span><i class="fa-solid fa-quote-left" style="color:var(--accent-blue)"></i> ${paper.citations} Citations</span>
          <span><i class="fa-solid fa-calendar"></i> ${new Date(paper.createdAt).toLocaleDateString()}</span>
        </div>

        <div style="background:#F8FAFC; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.5rem;">
          <h4 style="font-size:0.92rem; color:var(--text-dark); margin-bottom:0.5rem; font-weight:700;"><i class="fa-solid fa-align-left"></i> Abstract</h4>
          <p style="font-size:0.9rem; line-height:1.6; color:var(--text-main);">${paper.abstract}</p>
        </div>

        <div style="display:flex; gap:0.75rem; margin-bottom:1.5rem; flex-wrap:wrap;">
          <a href="${paper.pdfUrl || 'https://arxiv.org'}" target="_blank" class="btn btn-primary" style="text-decoration:none;">
            <i class="fa-solid fa-file-pdf"></i> Download PDF Paper
          </a>
          <button class="btn btn-secondary" onclick="openCiteModal('${paper._id}')">
            <i class="fa-solid fa-quote-right"></i> Export Citation
          </button>
          ${
            appState.currentUser && (appState.currentUser.role === 'admin' || (paper.uploadedBy && paper.uploadedBy._id === appState.currentUser._id))
              ? `<button class="btn btn-danger" onclick="deletePaper('${paper._id}')"><i class="fa-solid fa-trash"></i> Delete Paper</button>`
              : ''
          }
        </div>

        <!-- Discussion Section -->
        <div style="border-top:1px solid var(--border-color); padding-top:1.25rem;">
          <h4 style="font-size:1.05rem; color:var(--text-dark); margin-bottom:1rem; font-weight:700;"><i class="fa-solid fa-comments"></i> Peer Review Discussion</h4>
          <div style="margin-bottom:1rem;">
            <input type="text" class="form-control" id="comment-input" placeholder="Write an academic peer review comment..." />
            <button class="btn btn-primary btn-sm" style="margin-top:0.5rem;" onclick="addComment('${paper._id}')">
              Post Comment
            </button>
          </div>
          <div id="comments-list">
            <div style="font-size:0.85rem; color:var(--text-muted);"><i class="fa-solid fa-circle-info"></i> Be the first scholar to peer review this manuscript.</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Open Citation Modal
window.openCiteModal = function(paperId) {
  const paper = appState.papers.find(p => p._id === paperId);
  if (!paper) return;

  const author = Array.isArray(paper.authors) ? paper.authors[0] : paper.authors;
  const year = new Date(paper.createdAt).getFullYear();
  const bibtex = `@article{${author.split(' ')[1] || 'Scholar'}${year},
  title={${paper.title}},
  author={${Array.isArray(paper.authors) ? paper.authors.join(' and ') : paper.authors}},
  journal={ScholarForge Open Repository},
  year={${year}},
  doi={${paper.doi || '10.1038/sf.2026.01'}}
}`;

  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="modal-overlay active" id="cite-modal">
      <div class="modal-content" style="max-width:580px;">
        <div class="modal-header">
          <h3 style="color:var(--text-dark); font-weight:700;"><i class="fa-solid fa-quote-right"></i> Export Citation</h3>
          <button class="modal-close" onclick="closeModal('cite-modal')">&times;</button>
        </div>

        <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:1rem;">BibTeX format for LaTeX and Reference Managers:</p>
        
        <div class="citation-box" id="bibtex-box">
${bibtex}
          <button class="btn btn-primary btn-sm copy-btn" onclick="copyCitation()">
            <i class="fa-solid fa-copy"></i> Copy
          </button>
        </div>
      </div>
    </div>
  `;
};

// Copy Citation
window.copyCitation = function() {
  const box = document.getElementById('bibtex-box');
  if (box) {
    const text = box.innerText.replace('Copy', '').trim();
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Citation copied to clipboard!', 'success');
    }).catch(() => {
      showToast('❌ Failed to copy. Try manually.', 'error');
    });
  }
};

// Open Publish Paper Modal
function openPublishModal() {
  if (!appState.currentUser) {
    openAuthModal();
    return;
  }

  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="modal-overlay active" id="publish-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 style="color:var(--text-dark); font-weight:700;"><i class="fa-solid fa-file-circle-plus"></i> Publish Research Paper</h3>
          <button class="modal-close" onclick="closeModal('publish-modal')">&times;</button>
        </div>

        <form id="publish-form">
          <div class="form-group">
            <label class="form-label">Publication Title *</label>
            <input type="text" class="form-control" id="pub-title" required placeholder="e.g. Quantum Error Correction in Topologically..." />
          </div>

          <div class="form-group">
            <label class="form-label">Abstract / Overview *</label>
            <textarea class="form-control" id="pub-abstract" required placeholder="Detailed abstract summarizing research methods, results, and conclusions..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Authors (comma separated) *</label>
            <input type="text" class="form-control" id="pub-authors" required placeholder="e.g. Dr. Elena Rostova, Prof. Marcus Vance" />
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label class="form-label">DOI Code</label>
              <input type="text" class="form-control" id="pub-doi" placeholder="10.1038/sf.2026.101" />
            </div>

            <div class="form-group">
              <label class="form-label">Category / Tags</label>
              <input type="text" class="form-control" id="pub-tags" placeholder="Quantum Computing, AI, Genomics" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">PDF Paper URL</label>
            <input type="url" class="form-control" id="pub-pdf" placeholder="https://arxiv.org/pdf/2401.00001.pdf" />
          </div>

          <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:1.5rem;">
            <button type="button" class="btn btn-secondary" onclick="closeModal('publish-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-paper-plane"></i> Submit Manuscript</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('publish-form').addEventListener('submit', handlePublishSubmit);
}

// Submit Paper Handler
async function handlePublishSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('pub-title').value;
  const abstract = document.getElementById('pub-abstract').value;
  const authorsRaw = document.getElementById('pub-authors').value;
  const doi = document.getElementById('pub-doi').value || `10.1038/sf.${Date.now().toString().slice(-6)}`;
  const tagsRaw = document.getElementById('pub-tags').value || 'Research';
  const pdfUrl = document.getElementById('pub-pdf').value || 'https://arxiv.org/pdf/2401.00001.pdf';

  const authors = authorsRaw.split(',').map(a => a.trim()).filter(Boolean);
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

  const newPaperPayload = {
    title,
    abstract,
    authors,
    doi,
    tags,
    pdfUrl,
    citations: 0
  };

  try {
    const res = await fetch(`${API_BASE_URL}/papers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appState.token || 'demo_token'}`
      },
      body: JSON.stringify(newPaperPayload)
    });
    const json = await res.json();
    if (json.success && json.data) {
      appState.papers.unshift(json.data);
    } else {
      newPaperPayload._id = 'paper_' + Date.now();
      newPaperPayload.createdAt = new Date().toISOString();
      newPaperPayload.uploadedBy = { _id: appState.currentUser?._id || 'u1', name: appState.currentUser?.name || 'Researcher', role: appState.currentUser?.role || 'researcher' };
      appState.papers.unshift(newPaperPayload);
    }
  } catch (err) {
    newPaperPayload._id = 'paper_' + Date.now();
    newPaperPayload.createdAt = new Date().toISOString();
    newPaperPayload.uploadedBy = { _id: appState.currentUser?._id || 'u1', name: appState.currentUser?.name || 'Researcher', role: appState.currentUser?.role || 'researcher' };
    appState.papers.unshift(newPaperPayload);
  }

  closeModal('publish-modal');
  applyFilterAndSort();
  showToast('✅ Paper published successfully!', 'success');
}

// Open Auth Modal
function openAuthModal() {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="modal-overlay active" id="auth-modal">
      <div class="modal-content" style="max-width:480px;">
        <div class="modal-header">
          <h3 style="color:var(--text-dark); font-weight:700;"><i class="fa-solid fa-user-shield"></i> ScholarForge Access</h3>
          <button class="modal-close" onclick="closeModal('auth-modal')">&times;</button>
        </div>

        <div style="display:flex; border-bottom:1px solid var(--border-color); margin-bottom:1.5rem;">
          <button class="btn btn-secondary" id="tab-login" style="flex:1; border-radius:0; border:none; border-bottom:2px solid var(--primary);">Sign In</button>
          <button class="btn btn-secondary" id="tab-register" style="flex:1; border-radius:0; border:none;">Register Scholar</button>
        </div>

        <form id="auth-form">
          <div class="form-group" id="group-name" style="display:none;">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" id="auth-name" placeholder="Dr. Jane Doe" />
          </div>

          <div class="form-group">
            <label class="form-label">Academic Email</label>
            <input type="email" class="form-control" id="auth-email" required placeholder="scholar@university.edu" />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" id="auth-password" required placeholder="••••••••" />
          </div>

          <div class="form-group" id="group-role" style="display:none;">
            <label class="form-label">Academic Role</label>
            <select class="form-control" id="auth-role">
              <option value="researcher">Researcher</option>
              <option value="professor">Professor</option>
              <option value="student">Student</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%; margin-top:1rem;" id="auth-submit-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  `;

  let mode = 'login';
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const groupName = document.getElementById('group-name');
  const groupRole = document.getElementById('group-role');
  const submitBtn = document.getElementById('auth-submit-btn');

  tabLogin.addEventListener('click', () => {
    mode = 'login';
    tabLogin.style.borderBottom = '2px solid var(--primary)';
    tabRegister.style.borderBottom = 'none';
    groupName.style.display = 'none';
    groupRole.style.display = 'none';
    submitBtn.innerText = 'Sign In';
  });

  tabRegister.addEventListener('click', () => {
    mode = 'register';
    tabRegister.style.borderBottom = '2px solid var(--primary)';
    tabLogin.style.borderBottom = 'none';
    groupName.style.display = 'block';
    groupRole.style.display = 'block';
    submitBtn.innerText = 'Create Account';
  });

  document.getElementById('auth-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value || email.split('@')[0];
    const role = document.getElementById('auth-role').value || 'researcher';

    const payload = mode === 'register' ? { name, email, password, role } : { email, password };
    const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success && json.token) {
        appState.token = json.token;
        appState.currentUser = { name, email, role, _id: 'u_' + Date.now() };
        localStorage.setItem('sf_token', json.token);
        localStorage.setItem('sf_user', JSON.stringify(appState.currentUser));
      }
    } catch (err) {
      appState.currentUser = { name, email, role, _id: 'u_' + Date.now() };
      appState.token = 'mock_jwt_token';
      localStorage.setItem('sf_user', JSON.stringify(appState.currentUser));
      localStorage.setItem('sf_token', appState.token);
    }

    closeModal('auth-modal');
    renderApp();
  });
}

// Handle Logout
function handleLogout() {
  appState.currentUser = null;
  appState.token = null;
  localStorage.removeItem('sf_user');
  localStorage.removeItem('sf_token');
  renderApp();
}

// Modal helper — remove active class so CSS display:none kicks in
window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
  }
};

// Toast notification helper
function showToast(message, type = 'default') {
  // Remove any existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}
window.showToast = showToast;

// Delete Paper Helper
window.deletePaper = async function(paperId) {
  if (!confirm('Are you sure you want to delete this paper?')) return;
  try {
    await fetch(`${API_BASE_URL}/papers/${paperId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${appState.token}` }
    });
  } catch (e) {
    // Local fallback
  }
  appState.papers = appState.papers.filter(p => p._id !== paperId);
  closeModal('details-modal');
  applyFilterAndSort();
  showToast('🗑️ Paper deleted successfully.', 'default');
};

// Add Comment Helper
window.addComment = function(paperId) {
  const input = document.getElementById('comment-input');
  if (!input || !input.value.trim()) return;

  const list = document.getElementById('comments-list');
  const user = appState.currentUser ? appState.currentUser.name : 'Anonymous Scholar';

  const commentEl = document.createElement('div');
  commentEl.style.cssText = 'background:#F8FAFC; padding:0.75rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-top:0.5rem; font-size:0.88rem;';
  commentEl.innerHTML = `
    <div style="font-weight:700; color:var(--text-dark); font-size:0.82rem;"><i class="fa-solid fa-user-check" style="color:var(--accent-blue)"></i> ${user}</div>
    <div style="color:var(--text-main); margin-top:0.25rem;">${input.value}</div>
  `;
  list.appendChild(commentEl);
  input.value = '';
};
