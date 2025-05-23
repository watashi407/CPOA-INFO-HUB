import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useMsal } from '@azure/msal-react';
import DOMPurify from 'dompurify';

const GRAPH_SCOPES = ["Notes.Read.All", "User.Read"];

const Sidebar = lazy(() => import('./components/Sidebar'));
const MainPanel = lazy(() => import('./components/MainPanel'));

function App() {
  const { instance, accounts } = useMsal();
  const [status, setStatus] = useState('');
  const [content, setContent] = useState('CONTENT HERE');
  const [theme, setTheme] = useState('blue');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pages, setPages] = useState([]); // This will be used for notebooks, sections, or pages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState('notebook'); // 'notebook' | 'section' | 'page'
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null); // Add selectedPage state
  const [pageHtmlContent, setPageHtmlContent] = useState(''); // Add state for HTML content

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const searchInputRef = useRef();

  const isAuthenticated = accounts && accounts.length > 0;

  // Fetch all notebooks from the SharePoint site (site group endpoint)
  useEffect(() => {
    if (!isAuthenticated || level !== 'notebook') return;
    let ignore = false;
    async function fetchNotebooksFromSite() {
      setLoading(true);
      setError(null);
      setStatus('');
      let allNotebooks = [];
      // Replace with your actual site hostname and path
      const siteHostname = 'cpoaglobalinc-my.sharepoint.com';
      const sitePath = '/personal/hrbo_cpoaglobal_com';
      let siteId = '';
      try {
        const token = await getAccessToken();
        // 1. Get the site ID
        const siteRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteHostname}:${sitePath}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!siteRes.ok) throw new Error('Failed to fetch site ID');
        const siteData = await siteRes.json();
        siteId = siteData.id;
        // 2. Get all notebooks from the site
        let nextLink = `https://graph.microsoft.com/v1.0/sites/${siteId}/onenote/notebooks?$top=100`;
        while (nextLink) {
          const res = await fetch(nextLink, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to fetch notebooks from site');
          const data = await res.json();
          allNotebooks = allNotebooks.concat(data.value || []);
          nextLink = data['@odata.nextLink'] || null;
        }
        if (!ignore) {
          setPages(allNotebooks);
          setStatus(`All site notebooks loaded. Total: ${allNotebooks.length}`);
        }
      } catch (e) {
        if (!ignore) {
          setError(e);
          setStatus('Error: ' + e.message);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchNotebooksFromSite();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, level]);

  // Fetch sections when a notebook is selected
  useEffect(() => {
    if (!isAuthenticated || !selectedNotebook || level !== 'section') return;
    let ignore = false;
    async function fetchSections() {
      setLoading(true);
      setError(null);
      setStatus('');
      let allSections = [];
      let sectionLink = `${selectedNotebook.sectionsUrl}?$top=100`;
      try {
        const token = await getAccessToken();
        while (sectionLink) {
          const res = await fetch(sectionLink, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to fetch sections');
          const data = await res.json();
          allSections = allSections.concat(data.value || []);
          sectionLink = data['@odata.nextLink'] || null;
        }
        if (!ignore) {
          setPages(allSections);
          setStatus(`Sections loaded. Total: ${allSections.length}`);
        }
      } catch (e) {
        if (!ignore) {
          setError(e);
          setStatus('Error: ' + e.message);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchSections();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedNotebook, level]);

  // Fetch pages when a section is selected
  useEffect(() => {
    if (!isAuthenticated || !selectedSection || level !== 'page') return;
    let ignore = false;
    async function fetchPages() {
      setLoading(true);
      setError(null);
      setStatus('');
      let allPages = [];
      let pageLink = `${selectedSection.pagesUrl}?$top=100`;
      try {
        const token = await getAccessToken();
        while (pageLink) {
          const res = await fetch(pageLink, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to fetch pages');
          const data = await res.json();
          allPages = allPages.concat(data.value || []);
          pageLink = data['@odata.nextLink'] || null;
        }
        if (!ignore) {
          setPages(allPages);
          setStatus(`Pages loaded. Total: ${allPages.length}`);
        }
      } catch (e) {
        if (!ignore) {
          setError(e);
          setStatus('Error: ' + e.message);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchPages();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedSection, level]);

  // Navigation handlers
  const handleNotebookClick = (notebook) => {
    setSelectedNotebook(notebook);
    setSelectedSection(null);
    setLevel('section');
    setSearchTerm('');
    setContent(notebook.displayName);
  };
  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setLevel('page');
    setSearchTerm('');
    setContent(section.displayName);
  };
  const handlePageClick = async (page) => {
    setContent(page.title || 'Untitled Page');
    setSelectedPage(page);
    setPageHtmlContent('');
    try {
      const token = await getAccessToken();
      const contentUrl = page.contentUrl;
      if (!contentUrl) throw new Error('No contentUrl found for this page');
      console.log('[OneNote] Fetching page content:', contentUrl);
      const res = await fetch(contentUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch page content');
      const html = await res.text();
      // Extract <body> content only
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      let bodyHtml = bodyMatch ? bodyMatch[1] : html;

      // Parse HTML and process images
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(bodyHtml, 'text/html');
      const imgTags = Array.from(doc.querySelectorAll('img'));
      // Check for both src and data-fullres-src attributes
      const graphImgs = imgTags.filter(img => {
        const src = img.getAttribute('src');
        const fullres = img.getAttribute('data-fullres-src');
        return (
          (src && src.startsWith('https://graph.microsoft.com/')) ||
          (fullres && fullres.startsWith('https://graph.microsoft.com/'))
        );
      });

      await Promise.all(graphImgs.map(async (img) => {
        try {
          // Prefer data-fullres-src if present
          const url = img.getAttribute('data-fullres-src') || img.getAttribute('src');
          const imgRes = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!imgRes.ok) {
            console.error('Failed to fetch image:', url, imgRes.status);
            return;
          }
          const blob = await imgRes.blob();
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          img.setAttribute('src', dataUrl);
          // Remove data-fullres-src to avoid confusion
          img.removeAttribute('data-fullres-src');
        } catch (e) {
          console.error('Error loading image:', e);
        }
      }));

      // Serialize the updated HTML
      const updatedHtml = doc.body ? doc.body.innerHTML : bodyHtml;
      // Sanitize HTML
      const safeHtml = DOMPurify.sanitize(updatedHtml);
      setPageHtmlContent(safeHtml);
    } catch (e) {
      setPageHtmlContent('<div style="color:red;">Failed to load page content.</div>');
    }
  };
  const handleBack = () => {
    if (level === 'page') {
      setLevel('section');
      setSelectedSection(null);
      setContent(selectedNotebook ? selectedNotebook.displayName : '');
    } else if (level === 'section') {
      setLevel('notebook');
      setSelectedNotebook(null);
      setContent('CONTENT HERE');
    }
    setSearchTerm('');
  };

  // Dynamic label for All Pages tab
  const allPagesLabel = level === 'notebook' ? 'All Notebooks' : level === 'section' ? 'All Sections' : 'All Pages';

  // Dynamic filtered list
  let filteredList = [];
  if (level === 'notebook') {
    filteredList = pages.filter(nb => nb.displayName && nb.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
  } else if (level === 'section') {
    filteredList = pages.filter(sec => sec.displayName && sec.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
  } else if (level === 'page') {
    filteredList = pages.filter(pg => pg.title && pg.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  // Dynamic click handler
  const handleListClick = (item) => {
    if (level === 'notebook') return handleNotebookClick(item);
    if (level === 'section') return handleSectionClick(item);
    if (level === 'page') return handlePageClick(item);
  };

  // Dynamic display name
  const getDisplayName = (item) => {
    if (level === 'notebook' || level === 'section') return item.displayName || 'Untitled';
    if (level === 'page') return item.title || 'Untitled Page';
    return '';
  };

  const handleLogin = async () => {
    try {
      await instance.loginPopup({ scopes: GRAPH_SCOPES });
      setStatus('Login successful!');
    } catch (e) {
      setStatus('Login failed: ' + e.message);
    }
  };

  const handleLogout = () => {
    instance.logoutPopup();
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'blue' : prev === 'blue' ? 'light' : 'dark'));
  };

  const getAccessToken = async () => {
    if (!accounts || accounts.length === 0) {
      throw new Error('not_authenticated');
    }
    try {
      const response = await instance.acquireTokenSilent({
        scopes: GRAPH_SCOPES,
        account: accounts[0],
      });
      console.log('access key coming onenote', response.accessToken); // Debug log
      return response.accessToken;
    } catch (e) {
      if (e.errorCode === 'interaction_required' || e.message?.includes('interaction_required')) {
        throw new Error('auth_popup_required');
      }
      if (e.errorCode === 'no_account_found' || e.message?.includes('no_account')) {
        throw new Error('not_authenticated');
      }
      throw e;
    }
  };

  const handleReAuth = async () => {
    try {
      await instance.acquireTokenPopup({ scopes: GRAPH_SCOPES });
      setStatus('Re-authentication successful!');
      setError(null);
    } catch (err) {
      setStatus('Re-authentication failed: ' + err.message);
    }
  };

  // Update filteredPages to filter by notebook name
  const filteredPages = pages.filter(page =>
    page.displayName && page.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 1. Get query combinations from OpenAI
  async function getQueryCombinations(prompt) {
    const systemPrompt = `Given the following user request, generate a concise array of 3-6 search queries that could be used to find relevant OneNote pages. Return ONLY a JSON array of strings.\nRequest: ${prompt}`;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: systemPrompt },
        ],
        max_tokens: 256,
        temperature: 0.2,
      }),
    });
    const data = await res.json();
    try {
      let text = data.choices?.[0]?.message?.content;
      // Remove code block markers and trim
      if (text) {
        text = text.replace(/^```json[\r\n]+|^```[\r\n]+|```$/gm, '').trim();
      }
      const arr = JSON.parse(text);
      if (Array.isArray(arr)) return arr;
      throw new Error('OpenAI did not return an array');
    } catch (e) {
      throw new Error('Failed to parse OpenAI response: ' + e.message);
    }
  }

  // 2. Fetch all section IDs
  async function fetchAllSectionIds(token) {
    let sectionIds = [];
    let next = 'https://graph.microsoft.com/v1.0/sites/root/onenote/sections?$top=100';
    while (next) {
      const res = await fetch(next, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.value) {
        sectionIds.push(...data.value.map(s => s.id));
      }
      next = data['@odata.nextLink'];
    }
    return sectionIds;
  }

  // 3. Search all pages in all sections for matches
  async function searchPagesByQueries(token, sectionIds, queries) {
    let foundPages = [];
    let checkedPages = new Set();
    for (const sectionId of sectionIds) {
      let next = `https://graph.microsoft.com/v1.0/onenote/sections/${sectionId}/pages?$top=100`;
      while (next) {
        const res = await fetch(next, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.value) {
          for (const page of data.value) {
            if (checkedPages.has(page.id)) continue;
            checkedPages.add(page.id);
            const title = page.title?.toLowerCase?.() || page.displayName?.toLowerCase?.() || '';
            if (queries.some(q => title.includes(q.toLowerCase()))) {
              foundPages.push(page);
            }
          }
        }
        next = data['@odata.nextLink'];
      }
    }
    return foundPages;
  }

  // 4. Fallback: fetch all pages if no matches
  async function fetchAllPages(token, sectionIds) {
    let allPages = [];
    let checkedPages = new Set();
    for (const sectionId of sectionIds) {
      let next = `https://graph.microsoft.com/v1.0/onenote/sections/${sectionId}/pages?$top=100`;
      while (next) {
        const res = await fetch(next, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.value) {
          for (const page of data.value) {
            if (!checkedPages.has(page.id)) {
              checkedPages.add(page.id);
              allPages.push(page);
            }
          }
        }
        next = data['@odata.nextLink'];
      }
    }
    return allPages;
  }

  // 5. Handler for search input (Enter key)
  const handleSearchInputKeyDown = async (e) => {
    if (e.key === 'Enter' && activeTab === 'search' && searchTerm.trim()) {
      setSearchLoading(true);
      setSearchError(null);
      setSearchResults([]);
      try {
        const token = await getAccessToken();
        // 1. Get AI query combinations
        const queries = await getQueryCombinations(searchTerm.trim());
        // 2. Get all section IDs
        const sectionIds = await fetchAllSectionIds(token);
        // 3. Search for matches
        let foundPages = await searchPagesByQueries(token, sectionIds, queries);
        // 4. If no matches, fetch all pages
        if (foundPages.length === 0) {
          foundPages = await fetchAllPages(token, sectionIds);
        }
        setSearchResults(foundPages);
      } catch (err) {
        setSearchError(err.message);
      } finally {
        setSearchLoading(false);
      }
    }
  };

  // Attach keydown handler to search input
  useEffect(() => {
    const input = searchInputRef.current;
    if (input) {
      input.addEventListener('keydown', handleSearchInputKeyDown, { passive: true });
      return () => input.removeEventListener('keydown', handleSearchInputKeyDown, { passive: true });
    }
  }, [activeTab, searchTerm]);

  // Add this useEffect to sync theme with <body> class for CSS variable theming
  useEffect(() => {
    document.body.classList.remove('dark', 'blue', 'light');
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <div className={
      theme === 'dark'
        ? "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex flex-col font-roboto"
        : theme === 'blue'
        ? "min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 flex flex-col font-roboto"
        : "min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-200 flex flex-col font-roboto"
    }>
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 gap-2 sm:gap-0">
        <div className={theme === 'dark' ? "text-xl sm:text-2xl font-bold text-white tracking-widest select-none drop-shadow-lg" : theme === 'blue' ? "text-xl sm:text-2xl font-bold text-blue-800 tracking-widest select-none drop-shadow-lg" : "text-xl sm:text-2xl font-bold text-gray-800 tracking-widest select-none drop-shadow-lg"}>CPOA INFORMATION HUB</div>
        <div className="flex gap-2 sm:gap-4 items-center mt-2 sm:mt-0">
          <button
            onClick={handleThemeToggle}
            className={theme === 'dark' ? "bg-gray-800 text-blue-300 px-4 sm:px-5 py-2 rounded-xl text-base font-semibold shadow hover:bg-gray-700 transition-colors" : theme === 'blue' ? "bg-blue-200 text-blue-800 px-4 sm:px-5 py-2 rounded-xl text-base font-semibold shadow hover:bg-blue-300 transition-colors" : "bg-pink-200 text-gray-800 px-4 sm:px-5 py-2 rounded-xl text-base font-semibold shadow hover:bg-pink-300 transition-colors"}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? 'Blue Mode' : theme === 'blue' ? 'Light Mode' : 'Dark Mode'}
          </button>
          {isAuthenticated ? (
            <button onClick={handleLogout} className={theme === 'dark' ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white px-3 sm:px-8 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:scale-105 transition-transform" : theme === 'blue' ? "bg-gradient-to-r from-blue-400 to-blue-200 text-blue-900 px-3 sm:px-8 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:scale-105 transition-transform" : "bg-gradient-to-r from-pink-400 to-red-200 text-gray-900 px-3 sm:px-8 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:scale-105 transition-transform"}>LOGOUT</button>
          ) : (
            <button onClick={handleLogin} className={theme === 'dark' ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white px-3 sm:px-8 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:scale-105 transition-transform" : theme === 'blue' ? "bg-gradient-to-r from-blue-400 to-blue-200 text-blue-900 px-3 sm:px-8 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:scale-105 transition-transform" : "bg-gradient-to-r from-pink-400 to-red-200 text-gray-900 px-3 sm:px-8 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:scale-105 transition-transform"}>LOGIN MICROSOFT</button>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 sm:gap-8 px-2 sm:px-6 md:px-12 pb-4 sm:pb-12 w-full max-w-full">
        <Suspense fallback={<div>Loading Sidebar...</div>}>
          <Sidebar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchInputRef={searchInputRef}
            theme={theme}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            allPagesLabel={allPagesLabel}
            level={level}
            handleBack={handleBack}
            isAuthenticated={isAuthenticated}
            loading={loading}
            error={error}
            searchLoading={searchLoading}
            searchError={searchError}
            filteredList={filteredList}
            searchResults={searchResults}
            setContent={setContent}
            handleListClick={handleListClick}
            getDisplayName={getDisplayName}
          />
        </Suspense>
        <Suspense fallback={<div>Loading Main Panel...</div>}>
          <MainPanel
            theme={theme}
            level={level}
            selectedPage={selectedPage}
            content={content}
            pageHtmlContent={pageHtmlContent}
            status={status}
          />
        </Suspense>
      </div>
    </div>
  );
}

export default App;

