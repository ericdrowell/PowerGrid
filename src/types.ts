export type Position = {
  x: number;
  y: number;
};

export type CellViewModel = {
  value: string;
};

export type Cell<T extends CellViewModel> = {
  renderer: React.ComponentClass<CellProps<T>> | React.FC<CellProps<T>>;
  viewModel: T;
  colspan?: number;
  rowspan?: number;
};

export type FixedGridRows<T extends CellViewModel> = {
  cells: Cell<T>[][];
  heights: number[];
}

export type FixedGridColumns<T extends CellViewModel> = {
  cells: Cell<T>[][];
  widths: number[];
}

export type GridViewModel<T extends CellViewModel, H extends CellViewModel = T> = {
  colWidths: number[];
  rowHeights: number[];
  cells: Cell<T>[][];
  hideScrollbars?: boolean;
  maxCellsWhileScrolling?: number;
  headers?: {
    colHeaders?: FixedGridRows<H>;
    rowHeaders?: FixedGridColumns<H>;
  };
  footers?: {
    colFooters?: FixedGridRows<H>;
    rowFooters?: FixedGridColumns<H>;
  };
  intersections?: {
    topLeftIntersections?: Cell<H>[][];
    topRightIntersections?: Cell<H>[][];
    bottomLeftIntersections?: Cell<H>[][];
    bottomRightIntersections?: Cell<H>[][];
  }
};

export type CellProps<T extends CellViewModel> = Position & Omit<Cell<T>, 'renderer'> & {
  col: number;
  row: number;
  width: number;
  height: number;
};
