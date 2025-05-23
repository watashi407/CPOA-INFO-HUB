import React from 'react';
import PagesList from './PagesList';

function Sidebar({
  searchTerm,
  setSearchTerm,
  searchInputRef,
  theme,
  activeTab,
  setActiveTab,
  allPagesLabel,
  level,
  handleBack,
  isAuthenticated,
  loading,
  error,
  searchLoading,
  searchError,
  filteredList,
  searchResults,
  setContent,
  handleListClick,
  getDisplayName,
}) {
  return (
    <div className="w-full lg:w-1/4 flex flex-col mb-4 lg:mb-0">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        ref={searchInputRef}
        className={
          theme === 'dark'
            ? "mb-2 px-4 sm:px-5 py-2 sm:py-3 rounded-xl bg-gray-900/80 text-white text-base sm:text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
            : theme === 'blue'
            ? "mb-2 px-4 sm:px-5 py-2 sm:py-3 rounded-xl bg-blue-100 text-blue-900 text-base sm:text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-blue-400"
            : "mb-2 px-4 sm:px-5 py-2 sm:py-3 rounded-xl bg-white text-gray-900 text-base sm:text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-400"
        }
      />
      {/* Tabs */}
      <div className="flex">
        <button
          className={
            (activeTab === 'all'
              ? (theme === 'dark' ? 'bg-blue-500 text-white' : theme === 'blue' ? 'bg-blue-400 text-white' : 'bg-blue-200 text-gray-900')
              : (theme === 'dark' ? 'bg-gray-800 text-blue-200' : theme === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-blue-50 text-blue-400')) +
            ' flex-1 py-2 rounded-tl-xl font-semibold text-base sm:text-lg transition-colors duration-200 shadow'
          }
          onClick={() => setActiveTab('all')}
        >
          {allPagesLabel}
        </button>
        <button
          className={
            (activeTab === 'search'
              ? (theme === 'dark' ? 'bg-blue-500 text-white' : theme === 'blue' ? 'bg-blue-400 text-white' : 'bg-blue-200 text-gray-900')
              : (theme === 'dark' ? 'bg-gray-800 text-blue-200' : theme === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-blue-50 text-blue-400')) +
            ' flex-1 py-2 rounded-tr-xl font-semibold text-base sm:text-lg transition-colors duration-200 shadow'
          }
          onClick={() => setActiveTab('search')}
        >
          Search Result
        </button>
      </div>
      {/* Back Button for navigation */}
      {(level === 'section' || level === 'page') && (
        <button
          onClick={handleBack}
          className={
            theme === 'dark' ? 'mb-2 mt-2 bg-gray-700 text-blue-200 px-4 py-2 rounded shadow hover:bg-gray-600' : theme === 'blue' ? 'mb-2 mt-2 bg-blue-100 text-blue-700 px-4 py-2 rounded shadow hover:bg-blue-200' : 'mb-2 mt-2 bg-blue-100 text-blue-600 px-4 py-2 rounded shadow hover:bg-blue-200'
          }
        >
          ← Back
        </button>
      )}
      {/* Tab Content */}
      <div
        className={
          theme === 'dark'
            ? "flex-1 bg-gray-800/80 rounded-b-xl p-2 sm:p-4 overflow-y-auto shadow-inner"
            : theme === 'blue'
            ? "flex-1 bg-blue-50 rounded-b-xl p-2 sm:p-4 overflow-y-auto shadow-inner"
            : "flex-1 bg-blue-50 rounded-b-xl p-2 sm:p-4 overflow-y-auto shadow-inner"
        }
        style={{
          height: '120px',
          maxHeight: '120px',
          minHeight: '120px',
          overflowY: 'auto',
          ...(window.innerWidth >= 640 ? { height: '300px', maxHeight: '300px', minHeight: '120px' } : {}),
        }}
      >
        {isAuthenticated ? (
          loading ? (
            <div className="text-center text-blue-400 py-4">Loading pages...</div>
          ) : error && error.message === 'auth_popup_required' ? (
            <div className="text-center text-blue-400 py-4">
              Session expired or consent required.<br />
              <button onClick={handleReAuth} className={
                theme === 'dark' ? "mt-4 bg-blue-500 text-white px-4 py-2 rounded shadow" : theme === 'blue' ? "mt-4 bg-blue-400 text-white px-4 py-2 rounded shadow" : "mt-4 bg-blue-200 text-gray-900 px-4 py-2 rounded shadow"
              }>Re-authenticate</button>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 py-4">{error.message}</div>
          ) : (
            activeTab === 'search' ? (
              searchLoading ? (
                <div className="text-center text-blue-400 py-4">Searching...</div>
              ) : searchError ? (
                <div className="text-center text-red-400 py-4">{searchError}</div>
              ) : (
                <PagesList
                  pages={searchResults}
                  theme={theme}
                  activeTab={activeTab}
                  searchTerm={searchTerm}
                  setContent={setContent}
                  onItemClick={handleListClick}
                  getDisplayName={getDisplayName}
                />
              )
            ) : (
              <PagesList
                pages={filteredList}
                theme={theme}
                activeTab={activeTab}
                searchTerm={searchTerm}
                setContent={setContent}
                onItemClick={handleListClick}
                getDisplayName={getDisplayName}
              />
            )
          )
        ) : (
          <div className="text-center text-blue-400 py-4">Please login to load pages.</div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
