import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const brandElement = screen.getByText(/cinema booking/i);
  expect(brandElement).toBeInTheDocument();
});
