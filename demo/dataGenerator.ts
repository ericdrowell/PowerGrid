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
      rowHeaders: {
        widths: [],
        cells: [],
      },
      colHeaders: {
        heights: [],
        cells: [],
      },
    },
    footers: {
      rowFooters: {
        widths: [],
        cells: [],
      },
      colFooters: {
        heights: [],
        cells: [],
      },
    },
    intersections: {
      topLeftIntersections: GENERATE_INTERSECTIONS ? [] : undefined,
      topRightIntersections: GENERATE_INTERSECTIONS ? [] : undefined,
      bottomLeftIntersections: GENERATE_INTERSECTIONS ? [] : undefined,
      bottomRightIntersections: GENERATE_INTERSECTIONS ? [] : undefined,
    }
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
    gridViewModel.headers.rowHeaders.widths[c] = ROW_HEADER_WIDTH;
  }
  for (let r = 0; r < NUM_ROWS; r++) {
    gridViewModel.headers.rowHeaders.cells[r] = [];
    for (let c = 0; c < NUM_ROW_HEADER_ROWS; c++) {
      const cell: Cell<CellViewModel> = {
        renderer: HeaderCell,
        viewModel: {
          value: `R${r}C${c}`
        }
      };

      if (r === 1) {
        cell.rowspan = 2;
      }
      
      if (r !== 2) {
        gridViewModel.headers.rowHeaders.cells[r][c] = cell;
      }
      
    }
  }
  
  // generate row footers
  for (let c = 0; c < NUM_ROW_FOOTER_ROWS; c++) {
    gridViewModel.footers.rowFooters.widths[c] = ROW_FOOTER_WIDTH;
  }
  for (let r = 0; r < NUM_ROWS; r++) {
    gridViewModel.footers.rowFooters.cells[r] = [];
    for (let c = 0; c < NUM_ROW_FOOTER_ROWS; c++) {
      const cell: Cell<CellViewModel> = {
        renderer: FooterCell,
        viewModel: {
          value: `R${r}C${c}`
        }
      };

      if (r === 1) {
        cell.rowspan = 2;
      }
      
      if (r !== 2) {
        gridViewModel.footers.rowFooters.cells[r][c] = cell;
      }
      
    }
  }

  // generate column headers
  for (let r = 0; r < NUM_COL_HEADER_ROWS; r++) {
    gridViewModel.headers.colHeaders.heights[r] = COL_HEADER_HEIGHT;
  }
  for (let r = 0; r < NUM_COL_HEADER_ROWS; r++) {
    gridViewModel.headers.colHeaders.cells[r] = [];
    for (let c = 0; c < NUM_COLS; c++) {
      const cell: Cell<CellViewModel> = {
        renderer: HeaderCell,
        viewModel: {
          value: `C${c}R${r}`
        }
      };

      if (c === 1) {
        cell.colspan = 2;
      }

      if (c !== 2) {
        gridViewModel.headers.colHeaders.cells[r][c] = cell;
      }
      
    }
  }
  
  // generate column footers
  for (let r = 0; r < NUM_COL_FOOTER_ROWS; r++) {
    gridViewModel.footers.colFooters.heights[r] = COL_FOOTER_HEIGHT;
  }
  for (let r = 0; r < NUM_COL_FOOTER_ROWS; r++) {
    gridViewModel.footers.colFooters.cells[r] = [];
    for (let c = 0; c < NUM_COLS; c++) {
      const cell: Cell<CellViewModel> = {
        renderer: FooterCell,
        viewModel: {
          value: `C${c}R${r}`
        }
      };

      if (c === 1) {
        cell.colspan = 2;
      }

      if (c !== 2) {
        gridViewModel.footers.colFooters.cells[r][c] = cell;
      }
      
    }
  }
  
  if (GENERATE_INTERSECTIONS) {
    // generate header left intersections
    for (let r = 0; r < NUM_COL_HEADER_ROWS; r++) {
      gridViewModel.intersections.topLeftIntersections[r] = [];
      for (let c = 0; c < NUM_ROW_HEADER_ROWS; c++) {
        const cell: Cell<CellViewModel> = {
          renderer: IntersectionCell,
          viewModel: {
            value: `C${c}R${r}`,
          }
        };
        gridViewModel.intersections.topLeftIntersections[r][c] = cell;
      }
    }
    
    // generate header right intersections
    for (let r = 0; r < NUM_COL_HEADER_ROWS; r++) {
      gridViewModel.intersections.topRightIntersections[r] = [];
      for (let c = 0; c < NUM_ROW_FOOTER_ROWS; c++) {
        const cell: Cell<CellViewModel> = {
          renderer: IntersectionCell,
          viewModel: {
            value: `C${c}R${r}`,
          }
        };
        gridViewModel.intersections.topRightIntersections[r][c] = cell;
      }
    }
    
    // generate footer left intersections
    for (let r = 0; r < NUM_COL_FOOTER_ROWS; r++) {
      gridViewModel.intersections.bottomLeftIntersections[r] = [];
      for (let c = 0; c < NUM_ROW_HEADER_ROWS; c++) {
        const cell: Cell<CellViewModel> = {
          renderer: IntersectionCell,
          viewModel: {
            value: `C${c}R${r}`,
          }
        };
        gridViewModel.intersections.bottomLeftIntersections[r][c] = cell;
      }
    }
  
    // generate footer right intersections
    for (let r = 0; r < NUM_COL_FOOTER_ROWS; r++) {
      gridViewModel.intersections.bottomRightIntersections[r] = [];
      for (let c = 0; c < NUM_ROW_FOOTER_ROWS; c++) {
        const cell: Cell<CellViewModel> = {
          renderer: IntersectionCell,
          viewModel: {
            value: `C${c}R${r}`,
          }
        };
        gridViewModel.intersections.bottomRightIntersections[r][c] = cell;
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