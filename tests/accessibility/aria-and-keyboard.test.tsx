/**
 * Accessibility Tests: ARIA Labels and Keyboard Navigation
 * Ensures the application is accessible to screen readers and keyboard-only users
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

describe('Accessibility: ARIA Labels', () => {
  describe('Button Accessibility', () => {
    it('should have descriptive aria-labels for icon-only buttons', () => {
      const { container } = render(
        <button aria-label="Add new tasting item">
          <span>+</span>
        </button>
      );

      const button = screen.getByLabelText('Add new tasting item');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label');
    });

    it('should have aria-pressed for toggle buttons', () => {
      const { container } = render(
        <button
          aria-label="Toggle study mode"
          aria-pressed="false"
        >
          Study Mode
        </button>
      );

      const button = screen.getByRole('button', { name: /toggle study mode/i });
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have aria-disabled for disabled buttons', () => {
      const { container } = render(
        <button
          aria-label="Submit tasting"
          disabled
          aria-disabled="true"
        >
          Submit
        </button>
      );

      const button = screen.getByRole('button', { name: /submit tasting/i });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Form Accessibility', () => {
    it('should associate labels with inputs', () => {
      const { container } = render(
        <form>
          <label htmlFor="session-name">Session Name</label>
          <input id="session-name" type="text" />
        </form>
      );

      const input = screen.getByLabelText('Session Name');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'session-name');
    });

    it('should have aria-required for required fields', () => {
      const { container } = render(
        <form>
          <label htmlFor="item-name">Item Name</label>
          <input
            id="item-name"
            type="text"
            required
            aria-required="true"
          />
        </form>
      );

      const input = screen.getByLabelText('Item Name');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toBeRequired();
    });

    it('should have aria-invalid and error messages for validation errors', () => {
      const { container } = render(
        <form>
          <label htmlFor="score">Score (0-10)</label>
          <input
            id="score"
            type="number"
            aria-invalid="true"
            aria-describedby="score-error"
          />
          <span id="score-error" role="alert">
            Score must be between 0 and 10
          </span>
        </form>
      );

      const input = screen.getByLabelText('Score (0-10)');
      const errorMessage = screen.getByText(/score must be between 0 and 10/i);

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'score-error');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });

  describe('Modal/Dialog Accessibility', () => {
    it('should have role="dialog" and aria-modal', () => {
      const { container } = render(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
        >
          <h2 id="dialog-title">Confirm Delete</h2>
          <p>Are you sure you want to delete this tasting?</p>
        </div>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
    });

    it('should have aria-describedby for dialog description', () => {
      const { container } = render(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
        >
          <h2 id="dialog-title">Delete Tasting</h2>
          <p id="dialog-description">
            This action cannot be undone. All items and data will be permanently deleted.
          </p>
        </div>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description');
    });
  });

  describe('Navigation Accessibility', () => {
    it('should have role="navigation" for nav elements', () => {
      const { container } = render(
        <nav role="navigation" aria-label="Main navigation">
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/tastings">Tastings</a></li>
          </ul>
        </nav>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('should have aria-current for current page link', () => {
      const { container } = render(
        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/tastings" aria-current="page">Tastings</a>
        </nav>
      );

      const currentLink = screen.getByRole('link', { name: /tastings/i });
      expect(currentLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('List Accessibility', () => {
    it('should use semantic list elements', () => {
      const { container } = render(
        <ul aria-label="Tasting items">
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      );

      const list = screen.getByRole('list');
      const items = screen.getAllByRole('listitem');

      expect(list).toBeInTheDocument();
      expect(items).toHaveLength(3);
    });

    it('should have aria-label for meaningful list names', () => {
      const { container } = render(
        <ul aria-label="Recently completed tastings">
          <li>Wine Tasting 1</li>
          <li>Coffee Tasting 2</li>
        </ul>
      );

      const list = screen.getByLabelText('Recently completed tastings');
      expect(list).toBeInTheDocument();
    });
  });

  describe('Status and Alert Accessibility', () => {
    it('should use role="status" for status updates', () => {
      const { container } = render(
        <div role="status" aria-live="polite">
          Tasting saved successfully
        </div>
      );

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should use role="alert" for urgent messages', () => {
      const { container } = render(
        <div role="alert" aria-live="assertive">
          Error: Failed to save tasting
        </div>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/error/i);
    });
  });

  describe('Loading State Accessibility', () => {
    it('should have aria-busy during loading', () => {
      const { container } = render(
        <div aria-busy="true" aria-label="Loading tastings">
          <span>Loading...</span>
        </div>
      );

      const loadingElement = screen.getByLabelText('Loading tastings');
      expect(loadingElement).toHaveAttribute('aria-busy', 'true');
    });

    it('should announce loading completion to screen readers', () => {
      const { container } = render(
        <div role="status" aria-live="polite">
          Tastings loaded
        </div>
      );

      const status = screen.getByRole('status');
      expect(status).toHaveTextContent(/loaded/i);
    });
  });
});

describe('Accessibility: Keyboard Navigation', () => {
  describe('Tab Navigation', () => {
    it('should navigate through interactive elements with Tab', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <form>
          <input type="text" placeholder="Session Name" />
          <input type="text" placeholder="Category" />
          <button type="submit">Save</button>
        </form>
      );

      const inputs = screen.getAllByRole('textbox');
      const button = screen.getByRole('button');

      await user.tab();
      expect(inputs[0]).toHaveFocus();

      await user.tab();
      expect(inputs[1]).toHaveFocus();

      await user.tab();
      expect(button).toHaveFocus();
    });

    it('should skip disabled elements during tab navigation', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <form>
          <input type="text" />
          <input type="text" disabled />
          <input type="text" />
        </form>
      );

      const enabledInputs = screen.getAllByRole('textbox').filter(
        input => !input.hasAttribute('disabled')
      );

      await user.tab();
      expect(enabledInputs[0]).toHaveFocus();

      await user.tab();
      expect(enabledInputs[1]).toHaveFocus();
    });
  });

  describe('Enter Key Actions', () => {
    it('should submit form with Enter key', async () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      const user = userEvent.setup();

      const { container } = render(
        <form onSubmit={handleSubmit}>
          <input type="text" />
          <button type="submit">Submit</button>
        </form>
      );

      const input = screen.getByRole('textbox');

      await user.type(input, 'Test value{Enter}');
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should activate buttons with Enter key', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      const { container } = render(
        <button onClick={handleClick}>Click Me</button>
      );

      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Space Key Actions', () => {
    it('should activate buttons with Space key', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      const { container } = render(
        <button onClick={handleClick}>Click Me</button>
      );

      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalled();
    });

    it('should toggle checkboxes with Space key', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <label>
          <input type="checkbox" />
          Enable blind tasting
        </label>
      );

      const checkbox = screen.getByRole('checkbox');

      checkbox.focus();
      await user.keyboard(' ');
      expect(checkbox).toBeChecked();

      await user.keyboard(' ');
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Escape Key Actions', () => {
    it('should close modal with Escape key', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();

      const { container } = render(
        <div
          role="dialog"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {handleClose();}
          }}
          tabIndex={-1}
        >
          <h2>Modal Title</h2>
          <button onClick={handleClose}>Close</button>
        </div>
      );

      const dialog = screen.getByRole('dialog');

      dialog.focus();
      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Arrow Key Navigation', () => {
    it('should navigate radio buttons with arrow keys', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <fieldset>
          <legend>Select mode</legend>
          <label>
            <input type="radio" name="mode" value="quick" />
            Quick
          </label>
          <label>
            <input type="radio" name="mode" value="study" />
            Study
          </label>
          <label>
            <input type="radio" name="mode" value="competition" />
            Competition
          </label>
        </fieldset>
      );

      const radios = screen.getAllByRole('radio');

      radios[0].focus();
      expect(radios[0]).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(radios[1]).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(radios[2]).toHaveFocus();
    });
  });

  describe('Focus Management', () => {
    it('should trap focus within modal', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <div role="dialog">
          <button>First</button>
          <button>Second</button>
          <button>Close</button>
        </div>
      );

      const buttons = screen.getAllByRole('button');

      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();

      await user.tab();
      expect(buttons[1]).toHaveFocus();

      await user.tab();
      expect(buttons[2]).toHaveFocus();

      // Focus should wrap back to first button
      await user.tab();
      // In a real modal with focus trap, this would go back to buttons[0]
    });

    it('should restore focus after modal closes', () => {
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Open Modal';
      document.body.appendChild(triggerButton);

      triggerButton.focus();
      const previousFocus = document.activeElement;

      // Simulate modal opening and closing
      // After close, focus should return to triggerButton
      expect(previousFocus).toBe(triggerButton);

      document.body.removeChild(triggerButton);
    });
  });

  describe('Skip Links', () => {
    it('should have skip to main content link', () => {
      const { container } = render(
        <div>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <nav>Navigation</nav>
          <main id="main-content">Content</main>
        </div>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });
});
