import React from 'react';
import styled from '@emotion/styled';
import { CellProps, CellViewModel } from '../../src/types';

const Cell = styled.div({
  backgroundColor: '#eee',
  color: '#4a4a4a',
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderBottom: '1px solid #ddd',
  borderRight: '1px solid #ddd',
  boxSizing: 'border-box',
});

const HeaderCell: React.FC<CellProps<CellViewModel>> = ({ viewModel }) => <Cell>{viewModel.value}</Cell>;

export default HeaderCell;