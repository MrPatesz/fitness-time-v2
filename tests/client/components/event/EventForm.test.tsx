import {fireEvent, render, screen} from '@testing-library/react';
import {EventForm} from '../../../../src/components/event/EventForm';
import {api} from '../../../../src/utils/api';
import {getDefaultCreateEvent} from '../../../../src/utils/defaultObjects';

describe('EventForm', () => {
  beforeEach(() => {
    // Arrange
    const Component = api.withTRPC(() => (
      <EventForm
        originalEvent={getDefaultCreateEvent()}
        loading={false}
        onSubmit={() => undefined}
      />
    ));
    render(<Component/>);
  });

  it('has disabled submit button initially', () => {
    // Act
    const submitButton = screen.getByText('button.submit').closest('button');

    // Assert
    expect(submitButton).toBeDisabled();
  });

  it('has disabled reset button initially', () => {
    // Act
    const resetButton = screen.getByText('button.reset').closest('button');

    // Assert
    expect(resetButton).toBeDisabled();
  });
  it('has enabled reset button after form becomes dirty', () => {
    // Arrange
    const descInput = screen.getByLabelText('eventForm.description.label');
    fireEvent.change(descInput, {target: {value: 'test event'}});

    // Act
    const resetButton = screen.getByText('button.reset').closest('button');

    // Assert
    expect(resetButton).not.toBeDisabled();
  });
});
