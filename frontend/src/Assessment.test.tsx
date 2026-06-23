import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import Assessment from './pages/Assessment'
import { MemoryRouter } from 'react-router-dom'
import { A11yProvider } from './context/A11yContext'

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

test('renders assessment heading', () => {
  render(
    <A11yProvider>
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    </A11yProvider>
  )
  // Buscamos el texto real que aparece en tu HTML
  const heading = screen.getByText(/Chat Terapéutico MindGuard/i)
  expect(heading).toBeInTheDocument()
})

test('renders intro section features', () => {
    render(
      <A11yProvider>
        <MemoryRouter>
          <Assessment />
        </MemoryRouter>
      </A11yProvider>
    )
    // Verificamos que aparezcan las características de la intro
    expect(screen.getByText(/Privacidad Total/i)).toBeInTheDocument()
    expect(screen.getByText(/Análisis Inteligente/i)).toBeInTheDocument()
})

test('renders start button', () => {
    render(
      <A11yProvider>
        <MemoryRouter>
          <Assessment />
        </MemoryRouter>
      </A11yProvider>
    )
    // Verificamos el botón de comenzar
    const button = screen.getByText(/Comenzar Conversación/i)
    expect(button).toBeInTheDocument()
})
