import { MantineReactTable, type MRT_ColumnDef } from '../../src';

import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react';
import { IconCopy, IconDownload } from '@tabler/icons-react';

const meta: Meta = {
  title: 'Features/Cell Action Examples',
};

export default meta;

interface Row {
  address: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  state: string;
}

const columns: MRT_ColumnDef<Row>[] = [
  {
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'state',
    header: 'State',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone Number',
  },
];

const data: Row[] = [...Array(100)].map(() => ({
  address: faker.location.streetAddress(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  phoneNumber: faker.phone.number(),
  state: faker.location.state(),
}));

export const CellContextMenu = () => {
  return (
    <MantineReactTable
      columns={columns}
      data={data}
      mantineTableBodyCellProps={({ cell }) => ({
        onContextMenu: (event) => {
          event.preventDefault();
          console.log('Context menu actions', [
            {
              icon: <IconCopy size={16} />,
              key: 'copy',
              title: 'Copy to clipboard',
              value: cell.getValue(),
            },
            {
              icon: <IconDownload size={16} />,
              key: 'download',
              title: 'Download to your device',
            },
          ]);
        },
        style: {
          cursor: 'context-menu',
        },
      })}
    />
  );
};
