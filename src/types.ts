/**
 * Identifies a position via `x` and `y` coordinates.
 */
export type Position = {
  x: number;
  y: number;
};

/**
 * The base viewModel for cells. Custom cell viewModels should extend this type.
 */
export type CellViewModel = {
  /**
   * The cell value, typically rendered as the cell's text.
   */
  value: string;
};

/**
 * The grid cell.
 * @template T The cell `viewModel` type. Must extend {@link CellViewModel}.
 */
export type Cell<T extends CellViewModel> = {
  /**
   * The React component which will render the cell.
   * This component will receive all {@link CellProps}.
   */
  renderer: React.ComponentClass<CellProps<T>> | React.FC<CellProps<T>>;
  /**
   * The cell viewModel.
   */
  viewModel: T;
  /**
   * The number of columns the cell should span.
   */
  colspan?: number;
  /**
   * The number of rows the cell should span.
   */
  rowspan?: number;
};

/**
 * Defines a fixed row (e.g. column header or footer).
 * @template T The cell `viewModel` type. Must extend {@link CellViewModel}.
 */
export type FixedGridRows<T extends CellViewModel> = {
  /**
   * A two dimensional Array of cells, where the first dimension defines rows, and the second dimension
   * represents the individual cells in that row.
   */
  cells: Cell<T>[][];
  /**
   * The row heights.
   */
  heights: number[];
}

/**
 * Defines a fixed column (e.g. a row header or footer).
 * @template T The cell `viewModel` type. Must extend {@link CellViewModel}.
 */
export type FixedGridColumns<T extends CellViewModel> = {
  /**
   * A two dimensional Array of cells, where the first dimension defines columns, and the second dimension
   * represents the individual cells in that column.
   */
  cells: Cell<T>[][];
  /**
   * The column widths.
   */
  widths: number[];
}

/**
 * The grid viewModel.
 * @template T The grid body cell `viewModel` type. Must extend {@link CellViewModel}.
 * @template H The grid header/footer cell `viewModel` type. Must extend {@link CellViewModel}. Defaults to `T`.
 */
export type GridViewModel<T extends CellViewModel, H extends CellViewModel = T> = {
  /**
   * The column widths.
   */
  colWidths: number[];
  /**
   * The row heights.
   */
  rowHeights: number[];
  /**
   * A two dimensional Array of cells, where the first dimension defines rows, and the second dimension
   * represents the individual cells in that row.
   */
  cells: Cell<T>[][];
  /**
   * Whether or not to hide the grid scrollbars. By default, scrollbars are visible.
   */
  hideScrollbars?: boolean;
  /**
   * Specifies the maximum number of cells to render while scrolling is in progress. This can be used to optimize
   * scrolling performance, but may result in empty cells while scrolling. By default, Power Grid will render as many
   * cells as needed to fill the viewport.
   */
  maxCellsWhileScrolling?: number;
  /**
   * Column and row headers. Optional.
   */
  headers?: {
    colHeaders?: FixedGridRows<H>;
    rowHeaders?: FixedGridColumns<H>;
  };
  /**
   * Column and row footers. Optional.
   */
  footers?: {
    colFooters?: FixedGridRows<H>;
    rowFooters?: FixedGridColumns<H>;
  };
  /**
   * Defines the cells at the corners of the grid, where headers and footers intersect. Note that these cells
   * will only rendered if corresponding headers and footers are also defined. Additionally, if headers and/or
   * footers are defined, but intersections are not, empty cells will automatically be generated.
   */
  intersections?: {
    /**
     * A two dimensional Array of cells, where the first dimension defines rows, and the second dimension
     * represents the individual cells in that row.
     */
    topLeftIntersections?: Cell<H>[][];
    /**
     * A two dimensional Array of cells, where the first dimension defines rows, and the second dimension
     * represents the individual cells in that row.
     */
    topRightIntersections?: Cell<H>[][];
    /**
     * A two dimensional Array of cells, where the first dimension defines rows, and the second dimension
     * represents the individual cells in that row.
     */
    bottomLeftIntersections?: Cell<H>[][];
    /**
     * A two dimensional Array of cells, where the first dimension defines rows, and the second dimension
     * represents the individual cells in that row.
     */
    bottomRightIntersections?: Cell<H>[][];
  }
};

/**
 * The cell renderer props.
 * @template T The cell `viewModel` type. Must extend {@link CellViewModel}.
 */
export type CellProps<T extends CellViewModel> = Position & Omit<Cell<T>, 'renderer'> & {
  /**
   * The zero-based column index of the cell.
   */
  col: number;
  /**
   * The zero-based row index of the cell.
   */
  row: number;
  /**
   * The cell width.
   */
  width: number;
  /**
   * The cell height.
   */
  height: number;
};
