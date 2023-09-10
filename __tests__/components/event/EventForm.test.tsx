/**
 * @jest-environment jsdom
 */

import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {EventForm} from '../../../src/components/event/EventForm';
import {getDefaultCreateEvent} from '../../../src/utils/defaultObjects';

describe('EventForm', () => {
  it('has disabled submit button initially', () => {
    // Arrange
    render(
      <EventForm
        originalEvent={getDefaultCreateEvent()}
        loading={false}
        onSubmit={() => {
        }}
      />
    );

    // Act
    const button = screen.getByText('button.submit').closest('button');

    // Assert
    expect(button).toBeDisabled();
  });
});
