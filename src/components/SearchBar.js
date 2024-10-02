import "../styles/SearchBar.css";
import { MagnifyingGlass, ArrowLeft } from "phosphor-react";
import SearchResultItem from "./SearchResultItem";
import { useState, useEffect, useCallback } from "react";
import { addEscKeyDownListener } from "../scripts/scripts";

function SearchBar() {
  const [query, setQuery] = useState("");
  const [resultItems, setResultItems] = useState([]);
  const fetchResults = useCallback(async () => {
    const terms = normalize(query).split(" ");
    const url = `${process.env.REACT_APP_API_BASE_URL}/api/search-users/${query}`;
    try {
      const response = await fetch(url);
      const resObj = await response.json();
      if (Array.isArray(resObj)) {
        setResultItems(
          resObj.sort((a, b) =>
            normalize(a.first_name).substring(0, terms[0].length) === terms[0]
              ? -1
              : 1
          )
        );
      }
    } catch (error) {
      console.log("error", error);
    }
  }, [query]); // Ensure that query is a dependency for fetchResults

  // Fetch search results whenever the query changes
  useEffect(() => {
    if (query.length === 0) {
      setResultItems([]);
    } else {
      fetchResults();
    }

    // Cleanup function for Esc key listener
    const removeEscKeyDownListener = addEscKeyDownListener();

    return () => {
      removeEscKeyDownListener();
    };
  }, [query, fetchResults]); // Added fetchResults as a dependency

  // Fetch search results
  
  // Handle input change
  function handleInputChanged(e) {
    setQuery(e.target.value);
  }

  // Normalize input string
  function normalize(str) {
    return str.trim().toLowerCase();
  }

  // Prevent default behavior when input is focused
  function handleInputFocused(e) {
    e.preventDefault();
  }

  return (
    <div className="SearchBar" tabIndex={-1}>
      <input
        type="text"
        placeholder="Search vise"
        value={query}
        onChange={handleInputChanged}
        onFocus={handleInputFocused}
      />
      <MagnifyingGlass className="magnifying-glass" />
      <div className="window">
        <div className="top-bar">
          <button
            type="button"
            className="back-btn"
            onClick={() => {
              document.activeElement.blur();
            }}
          >
            <ArrowLeft className="arrow-left" />
          </button>
        </div>
        <div className="results">
          {resultItems.length ? (
            resultItems.map((user) => (
              <SearchResultItem user={user} query={query} key={user._id} />
            ))
          ) : (
            <div className="no-results">
              {!query ? "Start typing to find friends!" : "No results found"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
