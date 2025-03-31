import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GroupDetails from '../views/groups/groupDetails';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// Mock AddExpenseModal to avoid rendering unrelated UI
jest.mock('../views/groups/AddMemberModal', () => () => <></>);

// Mock AddMemberModal and add recognizable text and a data-testid
jest.mock('../views/groups/AddMemberModal', () => (props) => {
  return props.open ? (
    <div data-testid="add-member-modal">
      <p>Mock Add Member Modal</p>
      <button onClick={props.onClose}>Close Modal</button>
    </div>
  ) : null;
});

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/users')) {
      return Promise.resolve({
        json: () =>
          Promise.resolve([
            { id: 1, name: 'Alice', username: 'alice' },
            { id: 2, name: 'Bob', username: 'bob' },
          ]),
      });
    }
    if (url.includes('/expenses')) {
      return Promise.resolve({ json: () => Promise.resolve([]) });
    }
    return Promise.resolve({
      json: () => Promise.resolve({ users: [], id: 'group1', name: 'Test Group' }),
    });
  });

  localStorage.setItem('userid', JSON.stringify(1));
  localStorage.setItem('authTokens', JSON.stringify('fake-token'));
});

describe('GroupDetails - Add Member flow', () => {
  it('shows Add Member button', async () => {
    render(<GroupDetails groupId="group1" groupName="Test Group" />, { wrapper: MemoryRouter });
    expect(await screen.findByText('Add Member')).toBeInTheDocument();
  });

  it('opens AddMemberModal on button click', async () => {
    render(<GroupDetails groupId="group1" groupName="Test Group" />, { wrapper: MemoryRouter });

    const addBtn = await screen.findByRole('button', { name: /add member/i });
    fireEvent.click(addBtn);

    expect(await screen.findByTestId('add-member-modal')).toBeInTheDocument();
    expect(screen.getByText(/mock add member modal/i)).toBeInTheDocument();
  });

  it('closes AddMemberModal when "Close Modal" is clicked', async () => {
    render(<GroupDetails groupId="group1" groupName="Test Group" />, { wrapper: MemoryRouter });

    fireEvent.click(await screen.findByRole('button', { name: /add member/i }));
    fireEvent.click(await screen.findByText('Close Modal'));

    await waitFor(() =>
      expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument()
    );
  });
});

