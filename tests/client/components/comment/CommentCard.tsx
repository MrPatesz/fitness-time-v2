import {render, screen} from '@testing-library/react';
import {CommentCard} from '../../../../src/components/comment/CommentCard';
import {BasicCommentSchema} from '../../../../src/models/Comment';
import {comment1, user1} from '../../../mockData';

describe('CommentCard', () => {
  beforeEach(() => {
    // Arrange
    render(<CommentCard comment={BasicCommentSchema.parse({...comment1, user: user1})}/>);
  });

  it('displays text of comment', () => {
    // Act
    const text = screen.getByText(comment1.text);

    // Assert
    expect(text).toBeVisible();
  });
  it('displays user\'s name', () => {
    // Act
    const userName = screen.getByText(user1.name);

    // Assert
    expect(userName).toBeVisible();
  });
});
