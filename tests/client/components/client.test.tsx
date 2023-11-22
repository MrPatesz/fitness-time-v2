import {render, screen} from '@testing-library/react';

it('client test', () => {
  // Arrange
  render(<div>client test</div>);

  // Act
  const div = screen.queryByText('client test');

  // Assert
  expect(div).toBeVisible();
});
