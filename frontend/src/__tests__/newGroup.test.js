import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Groups from '../views/groups/groups';
import { MemoryRouter } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

jest.mock('../views/groups/CreateGroup', () => ({ open, onClose, onGroupCreated }) => (
  open ? (
    <div data-testid="create-group-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ) : null
));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

describe('Groups Component - Create Group', () => {
  const mockConfirmAndDeleteGroup = jest.fn();

  const renderComponent = () =>
    render(
      <AuthContext.Provider value={{ confirmAndDeleteGroup: mockConfirmAndDeleteGroup }}>
        <MemoryRouter>
          <Groups />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  it('renders the Create Group button', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('Create Group'));
    expect(screen.getByText('Create Group')).toBeInTheDocument();
  });

  it('opens the Create Group modal on button click', async () => {
    renderComponent();
    const createButton = await screen.findByText('Create Group');
    fireEvent.click(createButton);
    expect(await screen.findByTestId('create-group-modal')).toBeInTheDocument();
  });

  it('closes the Create Group modal when Close button is clicked', async () => {
    renderComponent();
    const createButton = await screen.findByText('Create Group');
    fireEvent.click(createButton);
    const closeButton = await screen.findByText('Close');
    fireEvent.click(closeButton);
    await waitFor(() =>
      expect(screen.queryByTestId('create-group-modal')).not.toBeInTheDocument()
    );
  });
});
