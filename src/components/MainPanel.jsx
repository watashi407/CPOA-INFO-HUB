import React from 'react';

function MainPanel({ theme, level, selectedPage, content, pageHtmlContent, status }) {
  return (
    <div className="flex-1 flex flex-col items-center w-full">
      <div className={
        theme === 'dark'
          ? "w-full bg-gradient-to-r from-pink-400 to-red-300 text-white text-center py-2 sm:py-3 font-semibold text-base sm:text-lg rounded-t-xl tracking-wide shadow"
          : "w-full bg-gradient-to-r from-pink-200 to-red-100 text-gray-900 text-center py-2 sm:py-3 font-semibold text-base sm:text-lg rounded-t-xl tracking-wide shadow"
      }>
        RESULT OR VALIDATION STATUS
      </div>
      <div
        className={
          theme === 'dark'
            ? "flex-1 w-full bg-gray-800/80 rounded-b-xl flex items-center justify-center shadow-inner"
            : theme === 'blue'
            ? "flex-1 w-full bg-blue-50 rounded-b-xl flex items-center justify-center shadow-inner"
            : "flex-1 w-full bg-pink-50 rounded-b-xl flex items-center justify-center shadow-inner"
        }
      >
        {level === 'page' && selectedPage ? (
          <div
            className={
              theme === 'dark'
                ? "bg-gray-900/80 w-full max-w-4xl min-h-40 flex flex-col items-center justify-center rounded-2xl shadow-xl text-white text-center p-2 sm:p-6 border border-pink-400/30"
                : theme === 'blue'
                ? "bg-white w-full max-w-4xl min-h-40 flex flex-col items-center justify-center rounded-2xl shadow-xl text-blue-900 text-center p-2 sm:p-6 border border-blue-200/30"
                : "bg-white w-full max-w-4xl min-h-40 flex flex-col items-center justify-center rounded-2xl shadow-xl text-gray-900 text-center p-2 sm:p-6 border border-pink-200/30"
            }
            style={{ maxHeight: '80vh', overflow: 'auto', position: 'relative', zIndex: 10, margin: '0 auto' }}
          >
            <div className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">{selectedPage.title || 'Untitled Page'}</div>
            <div className="mb-2 sm:mb-6 text-xs sm:text-base break-words max-w-full">{selectedPage.createdDateTime ? `Created: ${new Date(selectedPage.createdDateTime).toLocaleString()}` : ''}</div>
            {selectedPage.webUrlNote && (
              <a
                href={selectedPage.webUrlNote}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  theme === 'dark'
                    ? "inline-block mb-4 px-4 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600 transition-colors"
                    : "inline-block mb-4 px-4 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600 transition-colors"
                }
              >
                Open in OneNote
              </a>
            )}
            <div className="w-full text-left bg-white text-gray-900 rounded-xl p-2 sm:p-4 overflow-x-auto" style={{ maxHeight: '120vh', height: '60vh', overflow: 'auto', width: '100%', minWidth: 0, minHeight: '240px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch' }}>
              {pageHtmlContent ? (
                <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                  <div id="onenote-content-render" style={{ width: '100%', height: '100%', overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: pageHtmlContent }} />
                </div>
              ) : (
                <div className="text-pink-400">Loading content...</div>
              )}
            </div>
          </div>
        ) : (
          <div
            className={
              theme === 'dark'
                ? "bg-gray-900/80 w-full max-w-2xl h-60 sm:h-96 flex items-center justify-center rounded-2xl shadow-xl text-lg sm:text-2xl text-white text-center p-4 sm:p-10 border border-pink-400/30"
                : "bg-white w-full max-w-2xl h-60 sm:h-96 flex items-center justify-center rounded-2xl shadow-xl text-lg sm:text-2xl text-gray-900 text-center p-4 sm:p-10 border border-pink-200/30"
            }
          >
            {content}
          </div>
        )}
      </div>
      <div className={
        theme === 'dark'
          ? "text-center text-pink-400 mt-2 sm:mt-4 min-h-6 text-base sm:text-lg font-medium drop-shadow"
          : "text-center text-pink-600 mt-2 sm:mt-4 min-h-6 text-base sm:text-lg font-medium drop-shadow"
      }>
        {status}
      </div>
    </div>
  );
}

export default MainPanel;
