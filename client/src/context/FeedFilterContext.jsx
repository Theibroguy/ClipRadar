import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const DEFAULT_FILTERS = { platform: 'youtube', category: 'all' };

const FeedFilterContext = createContext(null);

export function FeedFilterProvider({ children }) {
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const setPlatform = useCallback((platform) => {
        setFilters((prev) => ({ ...prev, platform }));
    }, []);

    const setCategory = useCallback((category) => {
        setFilters((prev) => ({ ...prev, category }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters((prev) => ({ platform: prev.platform || 'youtube', category: 'all' }));
        setShowSavedOnly(false);
        setSearchQuery('');
    }, []);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.category && filters.category !== 'all') count++;
        if (showSavedOnly) count++;
        if (searchQuery.trim()) count++;
        return count;
    }, [filters, showSavedOnly, searchQuery]);

    const value = useMemo(
        () => ({
            filters,
            setFilters,
            setPlatform,
            setCategory,
            showSavedOnly,
            setShowSavedOnly,
            searchQuery,
            setSearchQuery,
            resetFilters,
            activeFilterCount,
        }),
        [filters, setPlatform, setCategory, showSavedOnly, searchQuery, resetFilters, activeFilterCount]
    );

    return <FeedFilterContext.Provider value={value}>{children}</FeedFilterContext.Provider>;
}

export function useFeedFilters() {
    return useContext(FeedFilterContext);
}

