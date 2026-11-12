import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import '../style/animatedSearchBar.css'; // Import your CSS styles

export const AnimatedSearchBar = ({
    placeholder,
    type,
    id,
    onInput

}) => {
    const [isExpanded] = useState(true);
    // const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    return (
        <div className={`search-container ${isExpanded ? 'expanded' : ''}`}>
            {/* Search Icon */}
            <div
                className={`service-tracker-search-icon ${isExpanded ? 'expanded' : ''}`}
                onClick={() => !isExpanded && inputRef.current?.focus()}
            >
                <Search size={20} />
            </div>

            {/* Input Field */}
            <input
                id={id}
                onInput={onInput}
                type={type}
                placeholder={placeholder}
                className={`search-input ${isExpanded ? 'expanded' : ''}`}
            />

            {/* Clear Button */}
            {/* <button
                type="button"
                onClick={handleClear}
                className={`clear-button ${isExpanded && query ? 'visible' : ''}`}
            >
                <X size={14} />
            </button> */}

            {/* Animated Border */}
            <div className={`animated-border ${isExpanded ? 'visible' : ''}`}>
                <div className="border-inner" />
            </div>
        </div>
    );
};