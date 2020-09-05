import React from 'react';
import styled from '@emotion/styled';
import { CellProps } from '../../src/types';
import { Rating } from '../types';

const Cell = styled.td<{ rating: Rating }>(({ rating }) => {
  let backgroundColor = '#eee';
  let color = '#333';
  switch (rating) {
    case Rating.Bad:
      backgroundColor = '#ffc7ce';
      color = '#9c0006';
      break;
    case Rating.Neutral:
      backgroundColor = '#ffeb9c';
      color = '#9c5700';
      break;
    case Rating.Good:
      backgroundColor = '#c6efce';
      color = '#267c27';
      break;
  }
  return {
    backgroundColor,
    color,
    '&:hover': {
      backgroundColor: '#b0d9fe',
    },
  };
});

const TextCell: React.FC<CellProps> = (props: CellProps) => {
  const { viewModel, onClick, row, style } = props;

  return (
    <Cell
      rating={viewModel.rating}
      onClick={onClick}
      data-row={row}
      style={style}
    >
      {viewModel.value}
    </Cell>
  )
};

export default TextCell;