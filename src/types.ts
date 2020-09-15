export type CellViewModel = {
  value: string;
};

export type Cell<T extends CellViewModel> = {
  renderer: React.ComponentClass<CellProps<T>> | React.FC<CellProps<T>>;
  viewModel: T;
  colspan?: number;
  rowspan?: number;
};

export type GridColumnHeader<T extends CellViewModel> = {
  cells: Cell<T>[][];
  heights: number[];
}

export type GridRowHeader<T extends CellViewModel> = {
  cells: Cell<T>[][];
  widths: number[];
}

export type GridViewModel<T extends CellViewModel, H extends CellViewModel = CellViewModel> = {
  x: number;
  y: number;
  width: number;
  height: number;
  colWidths: number[];
  rowHeights: number[];
  cells: Cell<T>[][];
  hideScrollbars?: boolean;
  maxCellsWhileScrolling?: number;
  colHeader?: GridColumnHeader<H>;
  rowHeader?: GridRowHeader<H>;
};

export type CellProps<T extends CellViewModel> = Omit<Cell<T>, 'renderer'> & {
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};
