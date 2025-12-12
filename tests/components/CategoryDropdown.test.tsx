import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CategoryDropdown } from '../../components/quick-tasting/CategoryDropdown'
import userEvent from '@testing-library/user-event'

describe('CategoryDropdown', () => {
  const mockOnCategoryChange = jest.fn()
  const defaultProps = {
    category: 'coffee',
    onCategoryChange: mockOnCategoryChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the current category', () => {
    render(<CategoryDropdown {...defaultProps} />)
    expect(screen.getByDisplayValue('Coffee')).toBeInTheDocument()
  })

  it('displays all available categories', async () => {
    render(<CategoryDropdown {...defaultProps} />)
    const select = screen.getByRole('combobox')

    await userEvent.click(select)

    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('Tea')).toBeInTheDocument()
    expect(screen.getByText('Red Wine')).toBeInTheDocument()
    expect(screen.getByText('White Wine')).toBeInTheDocument()
    expect(screen.getByText('Wine (Other)')).toBeInTheDocument()
    expect(screen.getByText('Spirits (Other)')).toBeInTheDocument()
    expect(screen.getByText('Beer')).toBeInTheDocument()
    expect(screen.getByText('Chocolate')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('calls onCategoryChange when category is selected', async () => {
    render(<CategoryDropdown {...defaultProps} />)
    const select = screen.getByRole('combobox')

    await userEvent.selectOptions(select, 'tea')

    expect(mockOnCategoryChange).toHaveBeenCalledWith('tea')
  })

  it('shows correct display names for categories', () => {
    render(<CategoryDropdown {...defaultProps} category="spirits" />)
    expect(screen.getByDisplayValue('Spirits (Other)')).toBeInTheDocument()
  })

  it('handles custom category name for "other" category', () => {
    render(<CategoryDropdown {...defaultProps} category="other" />)
    expect(screen.getByDisplayValue('Other')).toBeInTheDocument()
  })

  it('is accessible with proper ARIA attributes', () => {
    render(<CategoryDropdown {...defaultProps} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveAttribute('aria-label', 'Select tasting category')
  })

  it('maintains focus after selection', async () => {
    render(<CategoryDropdown {...defaultProps} />)
    const select = screen.getByRole('combobox')

    await userEvent.selectOptions(select, 'wine')
    expect(select).toHaveFocus()
  })

  it('updates display when category prop changes', () => {
    const { rerender } = render(<CategoryDropdown {...defaultProps} />)
    expect(screen.getByDisplayValue('Coffee')).toBeInTheDocument()

    rerender(<CategoryDropdown {...defaultProps} category="wine" />)
    expect(screen.getByDisplayValue('Wine (Other)')).toBeInTheDocument()
  })
})
