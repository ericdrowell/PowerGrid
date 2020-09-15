import React from 'react';
import styled from '@emotion/styled';
import { CellProps } from '../../src/types';
import { Rating, DemoRatingCellViewModel } from '../types';

const Cell = styled.div<{ rating: Rating; }>(({ rating }) => {
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

const TextCell: React.FC<CellProps<DemoRatingCellViewModel>> = (props: CellProps<DemoRatingCellViewModel>) => {
  const { onClick, row, viewModel: { rating, value } } = props;

  return (
    <Cell
      rating={rating}
      onClick={onClick}
      data-row={row}
      style={{ height: '100%', margin: '2px 2px 0 0' }}
    >
      {value}
    </Cell>
  )
};

export default TextCell;