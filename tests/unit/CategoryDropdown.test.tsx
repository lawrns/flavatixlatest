import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryDropdown } from '../../components/quick-tasting/CategoryDropdown'

describe('CategoryDropdown Unit Tests', () => {
  it('renders with correct default className', () => {
    render(<CategoryDropdown category="coffee" onCategoryChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('form-input')
  })

  it('applies custom className', () => {
    render(<CategoryDropdown category="tea" onCategoryChange={() => {}} className="custom-class" />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('form-input', 'custom-class')
  })

  it('renders with loading disabled state', () => {
    render(<CategoryDropdown category="wine" onCategoryChange={() => {}} isLoading={true} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeDisabled()
    expect(select).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('renders without loading state by default', () => {
    render(<CategoryDropdown category="spirits" onCategoryChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).not.toBeDisabled()
    expect(select).not.toHaveClass('opacity-50')
  })

  it('has correct aria-label', () => {
    render(<CategoryDropdown category="beer" onCategoryChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveAttribute('aria-label', 'Select tasting category')
  })

  it('has correct name attribute', () => {
    render(<CategoryDropdown category="chocolate" onCategoryChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveAttribute('name', 'category')
  })

  it('renders all category options', () => {
    render(<CategoryDropdown category="other" onCategoryChange={() => {}} />)
    expect(screen.getByRole('option', { name: 'Coffee' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Tea' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Red Wine' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'White Wine' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Wine (Other)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Spirits (Other)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Beer' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Chocolate' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument()
  })

  it('sets correct value attribute', () => {
    render(<CategoryDropdown category="coffee" onCategoryChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('coffee')
  })

  it('calls onChange with correct value', async () => {
    const mockOnChange = jest.fn()
    render(<CategoryDropdown category="coffee" onCategoryChange={mockOnChange} />)
    const select = screen.getByRole('combobox')

    await userEvent.selectOptions(select, 'tea')

    expect(mockOnChange).toHaveBeenCalledWith('tea')
  })
})
