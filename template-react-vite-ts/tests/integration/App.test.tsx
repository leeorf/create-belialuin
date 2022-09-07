import { render, screen } from '@testing-library/react';
import { App } from '@components/App';

it('should render App', () => {
  render(<App />);

  expect(screen.getByText(/hello belialuin/i)).toBeTruthy();
});
