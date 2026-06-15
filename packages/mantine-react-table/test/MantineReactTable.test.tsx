import { type ReactElement } from 'react';

import { MantineProvider } from '@mantine/core';

import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from '../src';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

type Person = {
  age: number;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive';
};

const data: Person[] = [
  { age: 32, firstName: 'Ada', lastName: 'Lovelace', status: 'active' },
  { age: 41, firstName: 'Grace', lastName: 'Hopper', status: 'inactive' },
  { age: 28, firstName: 'Katherine', lastName: 'Johnson', status: 'active' },
];

const columns: MRT_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  { accessorKey: 'lastName', header: 'Last name' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'status', header: 'Status' },
];

const renderWithMantine = (ui: ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

const getBodyRows = () =>
  within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row');

describe('MantineReactTable', () => {
  it('renders columns, rows, and pagination controls with Mantine v8', () => {
    renderWithMantine(<MantineReactTable columns={columns} data={data} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Grace')).toBeInTheDocument();
    expect(screen.getByText('Katherine')).toBeInTheDocument();
    expect(screen.getByText(/rows per page/i)).toBeInTheDocument();
  });

  it('sorts rows when a sortable header is clicked', async () => {
    const user = userEvent.setup();
    renderWithMantine(<MantineReactTable columns={columns} data={data} />);

    await user.click(screen.getByRole('button', { name: /sort by age descending/i }));

    expect(within(getBodyRows()[0]).getByText('Grace')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /sorted by age descending/i }));

    expect(within(getBodyRows()[0]).getByText('Katherine')).toBeInTheDocument();
  });

  it('filters rows through the global search input', async () => {
    const user = userEvent.setup();
    renderWithMantine(<MantineReactTable columns={columns} data={data} />);

    await user.click(screen.getByRole('button', { name: /show\/hide search/i }));
    await user.type(screen.getByPlaceholderText(/search/i), 'hopper');

    await waitFor(() => {
      expect(screen.getByText('Grace')).toBeInTheDocument();
      expect(screen.queryByText('Ada')).not.toBeInTheDocument();
      expect(screen.queryByText('Katherine')).not.toBeInTheDocument();
    });
  });

  it('supports controlled row selection callbacks', async () => {
    const user = userEvent.setup();
    const onRowSelectionChange = vi.fn();

    renderWithMantine(
      <MantineReactTable
        columns={columns}
        data={data}
        enableRowSelection
        getRowId={(row) => row.firstName}
        onRowSelectionChange={onRowSelectionChange}
      />,
    );

    await user.click(screen.getAllByRole('checkbox', { name: /toggle select row/i })[0]);

    expect(onRowSelectionChange).toHaveBeenCalledTimes(1);
    expect(onRowSelectionChange.mock.calls[0][0]({})).toEqual({ Ada: true });
  });

  it('renders custom empty-state fallback from a table instance', () => {
    const EmptyTable = () => {
      const table = useMantineReactTable({
        columns,
        data: [],
        renderEmptyRowsFallback: () => <div>No matching people</div>,
      });

      return <MantineReactTable table={table} />;
    };

    renderWithMantine(<EmptyTable />);

    expect(screen.getByText('No matching people')).toBeInTheDocument();
  });
});
