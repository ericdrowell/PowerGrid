import React from 'react';
import styled from '@emotion/styled';
import { CellProps, CellViewModel } from '../../src/types';

const Cell = styled.div({
  backgroundColor: '#888',
  color: '#eee',
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderTop: '1px solid #4a4a4a',
  borderLeft: '1px solid #4a4a4a',
  boxSizing: 'border-box',
});

const FooterCell: React.FC<CellProps<CellViewModel>> = ({ viewModel }) => <Cell>{viewModel.value}</Cell>;

export default FooterCell;