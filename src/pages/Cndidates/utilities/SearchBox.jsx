import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { GrSearch, GoLocation, API_CONFIG, debounce, AuthService, CacheService } from './utilssearch';
import '../../../assets/Stylesheet/Search.css';


function SearchBox({ searchParams, handleSearchInputChange, handleSearch, isSearching }) {
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);

  const fetchSuggestions = useCallback(
    async (query, field) => {
      if (!query) {
        setSuggestions([]);
        return;
      }

      const cacheKey = `autocomplete_${field || 'keyword'}_${query}`;
      const cachedSuggestions = CacheService.getItem(cacheKey);
      if (cachedSuggestions) {
        setSuggestions(cachedSuggestions);
        return;
      }

      try {
        const response = await axios.get(
          `${API_CONFIG.baseURL}${API_CONFIG.endpoints.autocomplete}`,
          {
            params: { q: query },
            headers: AuthService.getAuthHeaders(),
          }
        );

        const filteredSuggestions = response.data.filter(
          (s) => !field || s.type === field || (field === 'keyword' && s.type !== 'location')
        );

        setSuggestions(filteredSuggestions);
        CacheService.setItem(cacheKey, filteredSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error.response?.status, error.response?.data);
        setSuggestions([]);
      }
    },
    []
  );

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  const onInputChange = (e) => {
    const { name, value } = e.target;
    handleSearchInputChange(e);
    setActiveField(name);
    debouncedFetchSuggestions(value, name === 'keyword' ? null : 'location');
  };

  const handleSuggestionClick = (suggestion) => {
    const field = suggestion.type === 'location' ? 'location' : 'keyword';
    // Pass both value and suggestion type
    handleSearchInputChange({
      target: { name: field, value: suggestion.value },
      suggestionType: suggestion.type, // Add suggestion type
    });
    setSuggestions([]);
    setActiveField(null);
    handleSearch();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % suggestions.length;
      document.querySelectorAll('.suggestion-item')[nextIndex].focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + suggestions.length) % suggestions.length;
      document.querySelectorAll('.suggestion-item')[prevIndex].focus();
    }
    if (e.key === 'Enter' && document.activeElement.classList.contains('suggestion-item')) {
      const suggestion = suggestions[index];
      handleSuggestionClick(suggestion);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest('.search-input-container') &&
        !e.target.closest('.suggestions-list')
      ) {
        setSuggestions([]);
        setActiveField(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuggestions([]);
    setActiveField(null);
    handleSearch();
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-input-container">
        <div className="search-input-group">
          <div className="icon-wrapper">
            <GrSearch className="search-icon" />
          </div>
          <div className="autocomplete-wrapper">
            <input
              type="text"
              name="keyword"
              value={searchParams.keyword}
              onChange={onInputChange}
              className="search-input"
              placeholder="Job title, keywords, or company"
              disabled={isSearching}
              autoComplete="off"
            />
            {activeField === 'keyword' && suggestions.length > 0 && (
              <ul className={`suggestions-list ${suggestions.length > 0 ? 'active' : ''}`}>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={`${suggestion.type}-${suggestion.value}-${index}`}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    tabIndex={0}
                  >
                    <span className="suggestion-type">{suggestion.type}:</span> {suggestion.value}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="search-divider"></div>

        <div className="search-input-group">
          <div className="icon-wrapper">
            <GoLocation className="location-icon" />
          </div>
          <div className="autocomplete-wrapper">
            <input
              type="text"
              name="location"
              value={searchParams.location}
              onChange={onInputChange}
              className="search-input"
              placeholder="City, state, zip code, or 'remote'"
              disabled={isSearching}
              autoComplete="off"
            />
            {activeField === 'location' && suggestions.length > 0 && (
              <ul className={`suggestions-list ${suggestions.length > 0 ? 'active' : ''}`}>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={`${suggestion.type}-${suggestion.value}-${index}`}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    tabIndex={0}
                  >
                    <span className="suggestion-type">{suggestion.type}:</span> {suggestion.value}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button type="submit" className="search-button-search" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Find jobs'}
        </button>
      </div>
    </form>
  );
}

export default SearchBox;