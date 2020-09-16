import React from 'react';
import styled from '@emotion/styled';
import { CellProps, CellViewModel } from '../../src/types';

const Cell = styled.div({
  backgroundColor: '#deeffa',
  color: '#333',
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #bddaeb',
  boxSizing: 'border-box',
  fontStyle: 'italic',
});

const IntersectionCell: React.FC<CellProps<CellViewModel>> = ({ viewModel }) => <Cell>{viewModel.value}</Cell>;

export default IntersectionCell;