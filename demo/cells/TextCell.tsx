import React from 'react';
import styled from '@emotion/styled';
import { CellProps } from '../../src/types';
import { Rating, DemoRatingCellViewModel } from '../types';

const Cell = styled.td<{ rating: Rating; }>(({ rating }) => {
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
  const { col, colspan, onClick, row, rowspan, style, viewModel: { rating, value } } = props;

  return (
    <Cell
      role="gridcell"
      aria-colindex={col + 1}
      aria-rowindex={row + 1}
      rating={rating}
      onClick={onClick}
      data-row={row}
      colSpan={colspan}
      rowSpan={rowspan}
      style={{ ...style, width: `${props.width - 2}px` }}
    >
      {value}
    </Cell>
  )
};

export default TextCell;