export type Cell<T> = {
  renderer: React.ComponentClass<CellProps<T>> | React.FC<CellProps<T>>;
  viewModel: T;
  colspan?: number;
  rowspan?: number;
  // TODO: these are added internally and are not optional in that context
  col?: number;
  row?: number;
};

export type ViewModel<T> = {
  width: number;
  height: number;
  x: number;
  y: number;
  colWidths: number[];
  rowHeights: number[];
  cells: Cell<T>[][];
  hideScrollbars?: boolean;
  maxCellsWhileScrolling?: number;
};

export type CellProps<T> = {
  viewModel: T;
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  style: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};