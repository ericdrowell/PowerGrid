import { TextCell, HeaderCell, FooterCell, IntersectionCell } from './cells';
import { CellViewModel, GridViewModel, Cell } from '../src/types';
import { Rating, DemoRatingCellViewModel } from './types';

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

const generateData = (
  NUM_COLS: number,
  NUM_ROWS: number,
  CELL_WIDTH: number,
  CELL_HEIGHT: number,
  NUM_COL_HEADER_ROWS: number,
  COL_HEADER_HEIGHT: number,
  NUM_ROW_HEADER_ROWS: number,
  ROW_HEADER_WIDTH: number,
  NUM_COL_FOOTER_ROWS: number,
  COL_FOOTER_HEIGHT: number,
  NUM_ROW_FOOTER_ROWS: number,
  ROW_FOOTER_WIDTH: number,
  GENERATE_INTERSECTIONS: boolean,
): GridViewModel<DemoRatingCellViewModel, CellViewModel> => {
  const gridViewModel: GridViewModel<DemoRatingCellViewModel, CellViewModel> = {
    // maxCellsWhileScrolling: 200,
    colWidths: [],
    rowHeights: [],
    cells: [],
    headers: {
      rowHeader: {
        widths: [],
        cells: [],
      },
      colHeader: {
        heights: [],
        cells: [],
      },
      leftIntersections: [],
      rightIntersections: [],
    },
    footers: {
      rowFooter: {
        widths: [],
        cells: [],
      },
      colFooter: {
        heights: [],
        cells: [],
      },
      leftIntersections: [],
      rightIntersections: [],
    },
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
    gridViewModel.colWidths[c] = CELL_WIDTH;
  }
  for (let r = 0; r < NUM_ROWS; r++) {
    gridViewModel.rowHeights[r] = CELL_HEIGHT;
  }
  for (let r = 0; r < NUM_ROWS; r++) {
    gridViewModel.cells[r] = [];
    for (let c = 0; c < NUM_COLS; c++) {
      const cell: Cell<DemoRatingCellViewModel> = {
        renderer: TextCell,
        viewModel: {
          value: r + ',' + c,
          rating: getRating()
        }
      };

      gridViewModel.cells[r][c] = cell;
    }
  }

  // generate row headers
  for (let c = 0; c < NUM_ROW_HEADER_ROWS; c++) {
    gridViewModel.headers.rowHeader.widths[c] = ROW_HEADER_WIDTH;
  }
  for (let r = 0; r < NUM_ROWS; r++) {
    gridViewModel.headers.rowHeader.cells[r] = [];
    for (let c = 0; c < NUM_ROW_HEADER_ROWS; c++) {
      const cell: Cell<CellViewModel> = {
        renderer: HeaderCell,
        viewModel: {
          value: 'R' + r
        }
      };

      if (r === 1) {
        cell.rowspan = 2;
      }
      
      if (r !== 2) {
        gridViewModel.headers.rowHeader.cells[r][c] = cell;
      }
      
    }
  }
  
  // generate row footers
  for (let c = 0; c < NUM_ROW_FOOTER_ROWS; c++) {
    gridViewModel.footers.rowFooter.widths[c] = ROW_FOOTER_WIDTH;
  }
  for (let r = 0; r < NUM_ROWS; r++) {
    gridViewModel.footers.rowFooter.cells[r] = [];
    for (let c = 0; c < NUM_ROW_FOOTER_ROWS; c++) {
      const cell: Cell<CellViewModel> = {
        renderer: FooterCell,
        viewModel: {
          value: 'R' + r
        }
      };

      if (r === 1) {
        cell.rowspan = 2;
      }
      
      if (r !== 2) {
        gridViewModel.footers.rowFooter.cells[r][c] = cell;
      }
      
    }
  }

  // generate column headers
  for (let r = 0; r < NUM_COL_HEADER_ROWS; r++) {
    gridViewModel.headers.colHeader.heights[r] = COL_HEADER_HEIGHT;
  }
  for (let r = 0; r < NUM_COL_HEADER_ROWS; r++) {
    gridViewModel.headers.colHeader.cells[r] = [];
    for (let c = 0; c < NUM_COLS; c++) {
      const cell: Cell<CellViewModel> = {
        renderer: HeaderCell,
        viewModel: {
          value: 'C' + c
        }
      };

      if (c === 1) {
        cell.colspan = 2;
      }

      if (c !== 2) {
        gridViewModel.headers.colHeader.cells[r][c] = cell;
      }
      
    }
  }
  
  // generate column footers
  for (let r = 0; r < NUM_COL_FOOTER_ROWS; r++) {
    gridViewModel.footers.colFooter.heights[r] = COL_FOOTER_HEIGHT;
  }
  for (let r = 0; r < NUM_COL_FOOTER_ROWS; r++) {
    gridViewModel.footers.colFooter.cells[r] = [];
    for (let c = 0; c < NUM_COLS; c++) {
      const cell: Cell<CellViewModel> = {
        renderer: FooterCell,
        viewModel: {
          value: 'C' + c
        }
      };

      if (c === 1) {
        cell.colspan = 2;
      }

      if (c !== 2) {
        gridViewModel.footers.colFooter.cells[r][c] = cell;
      }
      
    }
  }
  
  if (GENERATE_INTERSECTIONS) {
    // generate header left intersections
    for (let r = 0; r < NUM_COL_HEADER_ROWS; r++) {
      gridViewModel.headers.leftIntersections[r] = [];
      for (let c = 0; c < NUM_ROW_HEADER_ROWS; c++) {
        const cell: Cell<CellViewModel> = {
          renderer: IntersectionCell,
          viewModel: {
            value: `C${c}R${r}`,
          }
        };
        gridViewModel.headers.leftIntersections[r][c] = cell;
      }
    }
    
    // generate header right intersections
    for (let r = 0; r < NUM_COL_HEADER_ROWS; r++) {
      gridViewModel.headers.rightIntersections[r] = [];
      for (let c = 0; c < NUM_ROW_FOOTER_ROWS; c++) {
        const cell: Cell<CellViewModel> = {
          renderer: IntersectionCell,
          viewModel: {
            value: `C${c}R${r}`,
          }
        };
        gridViewModel.headers.rightIntersections[r][c] = cell;
      }
    }
    
    // generate footer left intersections
    for (let r = 0; r < NUM_COL_FOOTER_ROWS; r++) {
      gridViewModel.footers.leftIntersections[r] = [];
      for (let c = 0; c < NUM_ROW_HEADER_ROWS; c++) {
        const cell: Cell<CellViewModel> = {
          renderer: IntersectionCell,
          viewModel: {
            value: `C${c}R${r}`,
          }
        };
        gridViewModel.footers.leftIntersections[r][c] = cell;
      }
    }
  
    // generate footer right intersections
    for (let r = 0; r < NUM_COL_FOOTER_ROWS; r++) {
      gridViewModel.footers.rightIntersections[r] = [];
      for (let c = 0; c < NUM_ROW_FOOTER_ROWS; c++) {
        const cell: Cell<CellViewModel> = {
          renderer: IntersectionCell,
          viewModel: {
            value: `C${c}R${r}`,
          }
        };
        gridViewModel.footers.rightIntersections[r][c] = cell;
      }
    }
    
    // gridViewModel.headers.leftIntersections = [[{
    //   renderer: IntersectionCell,
    //   viewModel: {
    //     value: 'Merged Cells',
    //   },
    //   colspan: NUM_ROW_HEADER_ROWS,
    //   rowspan: NUM_COL_HEADER_ROWS,
    // }]];
    
    // gridViewModel.headers.rightIntersections = [[{
    //   renderer: IntersectionCell,
    //   viewModel: {
    //     value: 'Merged Cells',
    //   },
    //   colspan: NUM_ROW_FOOTER_ROWS,
    //   rowspan: NUM_COL_HEADER_ROWS,
    // }]];
    
    // gridViewModel.footers.leftIntersections = [[{
    //   renderer: IntersectionCell,
    //   viewModel: {
    //     value: 'Merged Cells',
    //   },
    //   colspan: NUM_ROW_HEADER_ROWS,
    //   rowspan: NUM_COL_FOOTER_ROWS,
    // }]];
    
    // gridViewModel.footers.rightIntersections = [[{
    //   renderer: IntersectionCell,
    //   viewModel: {
    //     value: 'Merged Cells',
    //   },
    //   colspan: NUM_ROW_FOOTER_ROWS,
    //   rowspan: NUM_COL_FOOTER_ROWS,
    // }]];
  }

  return gridViewModel;
};

export default generateData;