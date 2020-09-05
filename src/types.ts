export type Cell<T> = {
  renderer: React.ComponentClass | React.FC;
  viewModel: T;
  colspan?: number;
  rowspan?: number;
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

export type CellProps = {
  viewModel: any; // TODO
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  style: React.CSSProperties;
  onClick?: () => void;
};