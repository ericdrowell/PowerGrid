import React, { useState } from 'react';
import CssReset from '../src/CssReset';
import PowerGrid from '../src/PowerGrid';
import { Position, Cell } from '../src/types';
import generateData from './dataGenerator';
import { DemoRatingCellViewModel } from './types';

const NUM_COLS = 100;
const NUM_ROWS = 4000;
const NUM_COL_HEADER_ROWS = 2;
const NUM_ROW_HEADER_ROWS = 1;
const NUM_COL_FOOTER_ROWS = 2;
const NUM_ROW_FOOTER_ROWS = 3;
const CELL_WIDTH = 75;
const CELL_HEIGHT = 30;
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 550;
// const VIEWPORT_WIDTH = 800;
// const VIEWPORT_HEIGHT = 500;
const COL_HEADER_HEIGHT = 30;
const ROW_HEADER_WIDTH = 70;
const COL_FOOTER_HEIGHT = 30;
const ROW_FOOTER_WIDTH = 100;

const GENERATE_INTERSECTIONS = true;

const gridViewModel = generateData(
  NUM_COLS,
  NUM_ROWS,
  CELL_WIDTH,
  CELL_HEIGHT,
  NUM_COL_HEADER_ROWS,
  COL_HEADER_HEIGHT,
  NUM_ROW_HEADER_ROWS,
  ROW_HEADER_WIDTH,
  NUM_COL_FOOTER_ROWS,
  COL_FOOTER_HEIGHT,
  NUM_ROW_FOOTER_ROWS,
  ROW_FOOTER_WIDTH,
  GENERATE_INTERSECTIONS,
);

console.log('gridViewModel:');
console.log(gridViewModel);

const App: React.FC = () => {
  const [viewModel, setViewModel] = useState(gridViewModel);
  
  const onScroll = (scrollPosition: Position) => {
    // console.log(`scroll position: ${scrollPosition.x}, ${scrollPosition.y}`);
  }
  
  const collapseRow = (row: number) => {   
    setViewModel({
      ...viewModel,
      cells: [...viewModel.cells.slice(0, row), ...viewModel.cells.slice(row + 1)],
      rowHeights: [...viewModel.rowHeights.slice(0, row), ...viewModel.rowHeights.slice(row + 1)],
      headers: {
        ...viewModel.headers,
        rowHeader: {
          ...viewModel.headers.rowHeader,
          cells: [...viewModel.headers.rowHeader.cells.slice(0, row), ...viewModel.headers.rowHeader.cells.slice(row + 1)],
        },
      },
      footers: {
        ...viewModel.footers,
        rowFooter: {
          ...viewModel.footers.rowFooter,
          cells: [...viewModel.footers.rowFooter.cells.slice(0, row), ...viewModel.footers.rowFooter.cells.slice(row + 1)],
        },
      },
    });
  };
  
  const onCellClick = (cell: Cell<DemoRatingCellViewModel>, col: number, row: number) => {
    collapseRow(row);
  };

  return (
    <>
      <CssReset />
      <PowerGrid
        width={VIEWPORT_WIDTH}
        height={VIEWPORT_HEIGHT}
        viewModel={viewModel}
        onCellClick={onCellClick}
        onScroll={onScroll}
      />
    </>
  );
};

export default App;
