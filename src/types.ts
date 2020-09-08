export type Cell<T> = {
  renderer: React.ComponentClass<CellProps<T>> | React.FC<CellProps<T>>;
  viewModel: T;
  colspan?: number;
  rowspan?: number;
};

export type GridViewModel<T> = {
  x: number;
  y: number;
  width: number;
  height: number;
  colWidths: number[];
  rowHeights: number[];
  cells: Cell<T>[][];
  hideScrollbars?: boolean;
  maxCellsWhileScrolling?: number;
};

export type CellProps<T> = Omit<Cell<T>, 'renderer'> & {
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  style: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};
