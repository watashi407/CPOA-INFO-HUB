import React from 'react';

function PagesList({ pages = [], theme, activeTab, searchTerm, setContent, onItemClick, getDisplayName }) {
  const filteredPages = pages.filter(page =>
    getDisplayName(page).toLowerCase().includes(searchTerm?.toLowerCase?.() ?? '')
  );
  return (
    <ul>
      {(activeTab === 'all' ? pages : filteredPages).map((page, idx) => (
        <li key={page.id || idx} className={
          theme === 'dark'
            ? "py-2 px-2 border-b border-gray-700 cursor-pointer hover:bg-pink-500/30 rounded transition-colors text-[12px] flex items-center justify-between"
            : "py-2 px-2 border-b border-pink-100 cursor-pointer hover:bg-pink-200 rounded transition-colors text-[12px] flex items-center justify-between"
        }>
          <span
            className={theme === 'dark' ? "text-white/90" : "text-gray-900/90"}
            style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            onClick={() => { setContent(getDisplayName(page)); onItemClick && onItemClick(page); }}
          >
            {getDisplayName(page)}
          </span>
          {page?.links && page?.links?.oneNoteWebUrl && (
            <a
              href={page.links.oneNoteWebUrl.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="ml-2 flex items-center justify-center text-pink-500 hover:text-pink-700"
              title="Open in OneNote Web"
              style={{ minWidth: 20 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 20 20"><path d="M14.293 2.293a1 1 0 0 1 1.414 0l2 2A1 1 0 0 1 17 6h-3a1 1 0 1 1 0-2h.586l-3.293 3.293a1 1 0 0 1-1.414-1.414L15.586 2H15a1 1 0 1 1 0-2h3a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V3.414l-3.293 3.293a1 1 0 0 1-1.414-1.414L14.293 2.293z"/><path d="M5 4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3a1 1 0 1 0-2 0v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 1 0 0-2H5z"/></svg>
            </a>
          )}
        </li>
      ))}
      {(activeTab === 'search' && filteredPages.length === 0 && searchTerm) && (
        <li className={theme === 'dark' ? 'text-pink-200 py-4 text-center text-[12px]' : 'text-pink-400 py-4 text-center text-[12px]'}>No results found.</li>
      )}
    </ul>
  );
}

export default PagesList;
