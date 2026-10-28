/**
 * SearchBar component tests
 * Vitest + @testing-library/react
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../src/components/SearchBar/SearchBar.jsx';

describe('SearchBar', () => {
    it('renders input with placeholder', () => {
        render(<SearchBar value="" onChange={vi.fn()} />);
        const input = screen.getByPlaceholderText(/search creators/i);
        expect(input).toBeInTheDocument();
        expect(input.value).toBe('');
    });

    it('calls onChange when user types', () => {
        const onChange = vi.fn();
        render(<SearchBar value="" onChange={onChange} />);

        const input = screen.getByPlaceholderText(/search creators/i);
        fireEvent.change(input, { target: { value: 'MrBeast' } });
        expect(onChange).toHaveBeenCalledWith('MrBeast');
    });

    it('renders clear button when value is present and clears on click', () => {
        const onChange = vi.fn();
        render(<SearchBar value="Beast" onChange={onChange} />);

        const clearBtn = screen.getByRole('button', { name: /clear/i });
        expect(clearBtn).toBeInTheDocument();

        fireEvent.click(clearBtn);
        expect(onChange).toHaveBeenCalledWith('');
    });

    it('clears input when Escape is pressed', () => {
        const onChange = vi.fn();
        render(<SearchBar value="Beast" onChange={onChange} />);

        const input = screen.getByPlaceholderText(/search creators/i);
        fireEvent.keyDown(input, { key: 'Escape' });
        expect(onChange).toHaveBeenCalledWith('');
    });
});

