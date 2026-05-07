import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Assessment from './pages/Assessment'

test('renders assessment heading', () => {
  render(<Assessment />)
  const heading = screen.getByText(/MindGuard IA Assessment/i)
  expect(heading).toBeInTheDocument()
})

test('renders phq-9 section', () => {
    render(<Assessment />)
    const phq9Section = screen.getByText(/PHQ-9/i)
    expect(phq9Section).toBeInTheDocument()
})
