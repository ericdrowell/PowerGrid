export type Position = {
  x: number;
  y: number;
};

export type CellViewModel = {
  value: string;
};

export type Cell<T extends CellViewModel> = {
  renderer: React.ComponentClass<CellProps<T>> | React.FC<CellProps<T>>;
  viewModel?: T;
  colspan?: number;
  rowspan?: number;
};

export type FixedGridColumn<T extends CellViewModel> = {
  cells: Cell<T>[][];
  heights: number[];
}

export type FixedGridRow<T extends CellViewModel> = {
  cells: Cell<T>[][];
  widths: number[];
}

export type GridViewModel<T extends CellViewModel, H extends CellViewModel = T> = {
  width: number;
  height: number;
  colWidths: number[];
  rowHeights: number[];
  cells: Cell<T>[][];
  hideScrollbars?: boolean;
  maxCellsWhileScrolling?: number;
  // TODO: we can do better for header/footer structure
  headers?: {
    colHeader?: FixedGridColumn<H>;
    rowHeader?: FixedGridRow<H>;
    leftIntersections?: Cell<H>[][];
    rightIntersections?: Cell<H>[][];
  };
  footers?: {
    colFooter?: FixedGridColumn<H>;
    rowFooter?: FixedGridRow<H>;
    leftIntersections?: Cell<H>[][];
    rightIntersections?: Cell<H>[][];
  };
};

export type CellProps<T extends CellViewModel> = Position & Omit<Cell<T>, 'renderer'> & {
  col: number;
  row: number;
  width: number;
  height: number;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};
