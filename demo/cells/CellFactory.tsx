import React from 'react';
import styled, { Interpolation } from '@emotion/styled';
import { CellProps, CellViewModel } from '../../src/types';

export default (style: Interpolation): React.FC<CellProps<CellViewModel>> => {
  const Cell = styled.div({
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: '1px',
    borderStyle: 'solid',
    boxSizing: 'border-box',
  }, style);

  return ({ viewModel }) => <Cell>{viewModel.value}</Cell>;
};
