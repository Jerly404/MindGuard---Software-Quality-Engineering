import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import Assessment from './pages/Assessment'
import { MemoryRouter } from 'react-router-dom'

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

test('renders assessment heading', () => {
  render(
    <MemoryRouter>
      <Assessment />
    </MemoryRouter>
  )
  // Buscamos el texto real que aparece en tu HTML
  const heading = screen.getByText(/Chat Terapéutico MindGuard/i)
  expect(heading).toBeInTheDocument()
})

test('renders intro section features', () => {
    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    )
    // Verificamos que aparezcan las características de la intro
    expect(screen.getByText(/Privacidad Total/i)).toBeInTheDocument()
    expect(screen.getByText(/Análisis Inteligente/i)).toBeInTheDocument()
})

test('renders start button', () => {
    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    )
    // Verificamos el botón de comenzar
    const button = screen.getByText(/Comenzar Conversación/i)
    expect(button).toBeInTheDocument()
})
