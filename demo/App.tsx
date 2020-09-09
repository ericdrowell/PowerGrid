import React, { useState } from 'react';
import styled from '@emotion/styled';
import CssReset from '../src/CssReset';
import PowerGrid from '../src/PowerGrid';
import TextCell from './cells/TextCell';
import { GridViewModel, Cell } from '../src/types';
import { Rating, DemoCellViewModel, DemoRatingCellViewModel } from './types';

const NUM_COLS = 100;
const NUM_ROWS = 4000;
const CELL_WIDTH = 75;
const CELL_HEIGHT = 30;
const SCROLLBAR_SIZE = 14;
// const VIEWPORT_WIDTH = 1280;
// const VIEWPORT_HEIGHT = 550;
const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 500;
const COL_HEADER_HEIGHT = 30;
const ROW_HEADER_WIDTH = 70;

const getRating = (): Rating => {
  let val = Math.random();

  if (val < 0.2) {
    return Rating.Bad;
  } else if (val < 0.6) {
    return Rating.Neutral;
  } else {
    return Rating.Good;
  }
};

const generateData = (): {
  colHeadersViewModel: GridViewModel<DemoCellViewModel>;
  rowHeadersViewModel: GridViewModel<DemoCellViewModel>;
  mainViewModel: GridViewModel<DemoRatingCellViewModel>;
} => {
  const mainViewModel: GridViewModel<DemoRatingCellViewModel> = {
    //maxCellsWhileScrolling: 200,
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
    x: 0,
    y: 0,
    colWidths: [],
    rowHeights: [],
    cells: []
  };

  /*
  cell schema
  {
    renderer
    row
    col
    viewModel
  }

  */
  for (let c = 0; c < NUM_COLS; c++) {
    mainViewModel.colWidths[c] = CELL_WIDTH;
  }
  for (let r = 0; r < NUM_ROWS; r++) {
    mainViewModel.rowHeights[r] = CELL_HEIGHT;
  }
  for (let r = 0; r < NUM_ROWS; r++) {
    mainViewModel.cells[r] = [];
    for (let c = 0; c < NUM_COLS; c++) {
      const cell: Cell<DemoRatingCellViewModel> = {
        renderer: TextCell,
        viewModel: {
          value: r + ',' + c,
          rating: getRating()
        }
      };

      mainViewModel.cells[r][c] = cell;
    }
  }

  const rowHeadersViewModel: GridViewModel<DemoCellViewModel> = {
    hideScrollbars: true,
    width: ROW_HEADER_WIDTH,
    height: VIEWPORT_HEIGHT - SCROLLBAR_SIZE,
    x: 0,
    y: 0,
    colWidths: [],
    rowHeights: [],
    cells: []
  };
  for (let c = 0; c < 1; c++) {
    rowHeadersViewModel.colWidths[c] = ROW_HEADER_WIDTH;
  }
  for (let r = 0; r < NUM_ROWS; r++) {
    rowHeadersViewModel.rowHeights[r] = CELL_HEIGHT;
  }
  for (let r = 0; r < NUM_ROWS; r++) {
    rowHeadersViewModel.cells[r] = [];
    for (let c = 0; c < 1; c++) {
      const cell: Cell<DemoCellViewModel> = {
        renderer: TextCell,
        viewModel: {
          value: 'R' + r
        }
      };

      if (r === 1) {
        cell.rowspan = 2;
      }
      
      if (r !== 2) {
        rowHeadersViewModel.cells[r][c] = cell;
      }
      
    }
  }

  const colHeadersViewModel: GridViewModel<DemoCellViewModel> = {
    hideScrollbars: true,
    width: VIEWPORT_WIDTH - SCROLLBAR_SIZE,
    height: COL_HEADER_HEIGHT,
    x: 0,
    y: 0,
    colWidths: [],
    rowHeights: [],
    cells: []
  };
  for (let c = 0; c < NUM_COLS; c++) {
    colHeadersViewModel.colWidths[c] = CELL_WIDTH;
  }
  for (let r = 0; r < 1; r++) {
    colHeadersViewModel.rowHeights[r] = COL_HEADER_HEIGHT;
  }
  for (let r = 0; r < 1; r++) {
    colHeadersViewModel.cells[r] = [];
    for (let c = 0; c < NUM_COLS; c++) {
      const cell: Cell<DemoCellViewModel> = {
        renderer: TextCell,
        viewModel: {
          value: 'C' + c
        }
      };

      if (c === 1) {
        cell.colspan = 2;
      }

      if (c !== 2) {
        colHeadersViewModel.cells[r][c] = cell;
      }
      
    }
  }
  return {
    colHeadersViewModel,
    rowHeadersViewModel,
    mainViewModel,
  };
};

const { colHeadersViewModel, rowHeadersViewModel, mainViewModel } = generateData();

console.log('mainViewModel:');
console.log(mainViewModel);
console.log('rowHeadersViewModel:');
console.log(rowHeadersViewModel);
console.log('colHeadersViewModel:');
console.log(colHeadersViewModel);

const Flex = styled.div({
  display: 'flex',
})

const ExampleGrid = styled.div(Flex, {
  flexDirection: 'column',
});

const Left = styled.div({
  flex: '0 0 70px',
});

const App: React.FC = () => {
  const [headerViewModels, setHeaderViewModels] = useState({ col: colHeadersViewModel, row: rowHeadersViewModel });
  const [bodyViewModel, setBodyViewModel] = useState(mainViewModel);
  
  const onViewModelUpdate = () => {
    setHeaderViewModels({
      col: {
        ...headerViewModels.col,
        x: bodyViewModel.x,
      },
      row: {
        ...headerViewModels.row,
        y: bodyViewModel.y,
      }
    });
  }
  
  const collapseRow = (row: number) => {   
    setBodyViewModel({
      ...bodyViewModel,
      cells: [...bodyViewModel.cells.slice(0, row), ...bodyViewModel.cells.slice(row + 1)],
      rowHeights: [...bodyViewModel.rowHeights.slice(0, row), ...bodyViewModel.rowHeights.slice(row + 1)],
    });
    
    setHeaderViewModels({
      ...headerViewModels,
      row: {
        ...headerViewModels.row,
        cells: [...headerViewModels.row.cells.slice(0, row), ...headerViewModels.row.cells.slice(row + 1)],
        rowHeights: [...headerViewModels.row.rowHeights.slice(0, row), ...headerViewModels.row.rowHeights.slice(row + 1)],
      },
    });
  };
  
  const onCellClick = (evt: React.MouseEvent<HTMLElement>) => {
    const row = (evt.target as HTMLElement).getAttribute('data-row');
    collapseRow(+row!);
  };

  return (
    <>
      <CssReset />
      <ExampleGrid>
        <Flex>
          <Left />
          <PowerGrid<DemoCellViewModel> viewModel={headerViewModels.col} />
        </Flex>
        <Flex>
          <PowerGrid<DemoCellViewModel> viewModel={headerViewModels.row} />
          <PowerGrid<DemoRatingCellViewModel> viewModel={bodyViewModel} onViewModelUpdate={onViewModelUpdate} onCellClick={onCellClick} />
        </Flex>
      </ExampleGrid>
    </>
  );
};

export default App;
