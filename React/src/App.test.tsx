import { render } from '@testing-library/react';
import App from './App';

test('renders scheduler container', () => {
  const { container } = render(<App />);
  expect(container.querySelector('.app-container')).toBeTruthy();
});
