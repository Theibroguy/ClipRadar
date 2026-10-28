import './SearchBar.css';

/**
 * SearchBar — accessible search input for filtering clips in real time.
 *
 * Props:
 *   value {string} - search query
 *   onChange {function} - callback when text changes
 *   placeholder {string} - placeholder text
 */
export default function SearchBar({
    value = '',
    onChange,
    placeholder = 'Search creators, titles, AI summaries, or tags…',
}) {
    function handleChange(e) {
        onChange(e.target.value);
    }

    function handleClear() {
        onChange('');
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            handleClear();
        }
    }

    return (
        <div className="search-bar" role="search">
            <span className="search-bar__icon" aria-hidden="true">
                🔍
            </span>
            <input
                type="text"
                className="search-bar__input"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                aria-label="Search clips"
                id="search-clips-input"
            />
            {value && (
                <button
                    type="button"
                    className="search-bar__clear-btn"
                    onClick={handleClear}
                    aria-label="Clear search query"
                    title="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    );
}

