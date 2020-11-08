import React, { useState } from 'react';
import CssReset from '../src/CssReset';
import PowerGrid from '../src/PowerGrid';
import { Position, Cell } from '../src/types';
import generateData from './dataGenerator';
import { DemoRatingCellViewModel } from './types';
import CellFactory from './cells/CellFactory';
import TextCell from './cells/TextCell';

const HeaderCell = CellFactory({
  backgroundColor: '#eee',
  color: '#4a4a4a',
  borderColor: '#ddd',
  borderTop: 'none',
  borderLeft: 'none',
});

const FooterCell = CellFactory({
  backgroundColor: '#888',
  color: '#eee',
  borderColor: '#4a4a4a',
  borderBottom: 'none',
  borderRight: 'none',
});

const IntersectionCell = CellFactory({
  backgroundColor: '#deeffa',
  color: '#333',
  borderColor: '#bddaeb',
  borderWidth: '2px',
})

const NUM_COLS = 100;
const NUM_ROWS = 4000;
const NUM_COL_HEADER_ROWS = 1;
const NUM_ROW_HEADER_ROWS = 1;
const NUM_COL_FOOTER_ROWS = 1;
const NUM_ROW_FOOTER_ROWS = 1;
const CELL_WIDTH = 75;
const CELL_HEIGHT = 30;
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 600;
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
  {
    TextCell,
    HeaderCell,
    FooterCell,
    IntersectionCell,
  }
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
        rowHeaders: {
          ...viewModel.headers.rowHeaders,
          cells: [...viewModel.headers.rowHeaders.cells.slice(0, row), ...viewModel.headers.rowHeaders.cells.slice(row + 1)],
        },
      },
      footers: {
        ...viewModel.footers,
        rowFooters: {
          ...viewModel.footers.rowFooters,
          cells: [...viewModel.footers.rowFooters.cells.slice(0, row), ...viewModel.footers.rowFooters.cells.slice(row + 1)],
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
