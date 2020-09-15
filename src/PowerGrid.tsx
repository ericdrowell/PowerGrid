import React from 'react';
import styled from '@emotion/styled';
import { GridViewModel, Cell, CellViewModel } from './types';

type CellMeta = {
  x: number;
  y: number;
  width: number,
  height: number,
  visible: boolean;
  // direction of cell relative to center of grid
  direction: {
    x: number;
    y: number;
  }
};

type GridMeta = {
  x: number;
  y: number;
  colWidths: number[];
  rowHeights: number[];
  colStarts: number[];
  rowStarts: number[];
  innerWidth: number;
  innerHeight: number;
  colHeaderHeights: number[];
  totalColHeaderHeight: number;
};

type InternalCell<T extends CellViewModel> = Cell<T> & {
  col: number;
  row: number;
};

enum CellType {
  ColumnHeader = 'columnheader',
  GridCell = 'gridcell',
};

// TODO: this probably needs to change per browser.  Probably should auto calculate.
const SCROLLBAR_SIZE = 15;

const Container = styled.div<{ width: number; height: number; }>(({ width, height }) => ({
  width: `${width}px`,
  height: `${height}px`,
  position: 'relative',
  overflow: 'hidden',
}));

const ShadowGrid = styled.div<{ hideScrollbars?: boolean; headerHeight?: number }>(({ headerHeight = 0 }) => ({
  width: '100%',
  height: `calc(100% - ${headerHeight}px)`,
  top: `${headerHeight}px`,
  overflow: 'auto',
  position: 'absolute',
}), ({ hideScrollbars }) => hideScrollbars && ({
  msOverflowStyle: 'none', /* Internet Explorer 10+ */
  scrollbarWidth: 'none',    /* Firefox */
  '&::-webkit-scrollbar': { 
    display: 'none',  /* Safari and Chrome */
  },
}));

const ShadowGridContent = styled.div<{ width: number; height: number; }>(({ width, height }) => ({
  width: `${width}px`,
  height: `${height}px`,
  position: 'absolute',
}));

const GridViewport = styled.table<{ width: number; height: number; }>(({ width, height }) => ({
  width: `${width}px`,
  height: `${height}px`,
  position: 'absolute',
  overflow: 'hidden',
}));

const GridRow = styled.tr<{ zIndex?: number; }>(({ zIndex }) => ({
  zIndex,
  position: 'absolute',
}));

const GridCell = styled.td<{ x: number; y: number; width: number; height: number; }>(({ x, y, width, height }) => ({
  transform: `translate(${x}px, ${y}px)`,
  width: `${width}px`,
  height: `${height}px`,
  position: 'absolute',
  overflow: 'hidden',
}));

const GridHeaderCell = GridCell.withComponent('th');

const getStarts = (sizes: number[], offset: number = 0): number[] => {
  const starts: number[] = [];
  let start = offset;
  sizes.forEach((size, n) => {
    starts[n] = start;
    start += size;
  });

  return starts;
}

const getCellMeta = <T extends CellViewModel>(
  viewModel: GridViewModel<T>,
  gridMeta: GridMeta,
  cell: Cell<T>,
  row: number,
  col: number,
  cellType: CellType = CellType.GridCell
): CellMeta => {
  const gridX = gridMeta.x;
  const gridY = gridMeta.y;
  const gridWidth = viewModel.width;
  const gridHeight = viewModel.height - gridMeta.totalColHeaderHeight;
  const x = gridMeta.colStarts[col];
  let y = gridMeta.rowStarts[row];
  
  if (cellType === CellType.ColumnHeader) {
    y = row * gridMeta.colHeaderHeights[row] + gridY;
  }

  let colspanRemaining = cell.colspan === undefined ? 1 : cell.colspan;
  let colspanCol = col;
  let width = 0;
  while (colspanRemaining > 0) {
    width += gridMeta.colWidths[colspanCol];
    colspanCol++;
    colspanRemaining--;
  }

  let rowspanRemaining = cell.rowspan === undefined ? 1 : cell.rowspan;
  let rowspanRow = row;
  let height = 0;
  while (rowspanRemaining > 0) {
    switch (cellType) {
      case CellType.GridCell:
        height += gridMeta.rowHeights[rowspanRow];
        break;
      case CellType.ColumnHeader:
        height += gridMeta.colHeaderHeights[rowspanRow];
        break;
    }
    rowspanRow++;
    rowspanRemaining--;
  }

  const visible = x + width >= gridX && x <= gridX + gridWidth && y + height >= gridY && y - height <= gridY + gridHeight;

  return {
    x,
    y,
    width,
    height,
    visible,
    // direction of cell relative to center of grid
    direction: {
      x: x > gridX + gridWidth/2 ? -1 : 1,
      y: y > gridY + gridHeight/2 ? -1 : 1
    }
  }
};

// quickly find a cell that is visible in the viewport
const getStartCell = <T extends CellViewModel>(viewModel: GridViewModel<T>, gridMeta: GridMeta): InternalCell<T> => {
  // find cell near center;
  const numCols = gridMeta.colWidths.length;
  const numRows = gridMeta.rowHeights.length;
  let col = Math.floor(numCols/2);
  let row = Math.floor(numRows/2);
  let divider = 0.25;
  let startCell;
  
  while (true) {
    startCell = viewModel.cells[row][col] as InternalCell<T>;

    if (startCell) {
      const startCellMeta = getCellMeta(viewModel, gridMeta, startCell, row, col);

      // if we find a visible cell, we have found the start cell!
      if (startCellMeta.visible) {
        // warning: decorating view model in place
        startCell.row = row;
        startCell.col = col;
        break;
      }

      const direction = startCellMeta.direction;

      if (direction.x > 0) {
        col += Math.floor(numCols*divider);
      }
      else if (direction.x < 0) {
        col -= Math.floor(numCols*divider);
      }

      if (direction.y > 0) {
        row += Math.floor(numRows*divider);
      }
      else if (direction.y < 0) {
        row -= Math.floor(numRows*divider);
      }
    }
    // if we landed at a row/col position where there is no cell, look for another adjacent cell
    else {
      row += 1;
      col += 1;
    }

    divider /= 2;
  }

  //console.log('found visible cell in ' + bisectorCount + ' iterations');

  return startCell;
}

const getViewportCells = <T extends CellViewModel>(viewModel: GridViewModel<T>, gridMeta: GridMeta, maxCells: number): Cell<T>[] => {
  const viewportCells = [];
  const numCols = gridMeta.colWidths.length;
  const numRows = gridMeta.rowHeights.length;
  const startCell = getStartCell(viewModel, gridMeta);
  const startCol = startCell.col;
  const startRow = startCell.row;
  let minCol = startCol;
  let maxCol = startCol;
  let minRow = startRow;
  let maxRow = startRow;

  while (true) {
    minCol--;
    if (minCol < 0) {
      minCol = 0;
      break;
    }
    const cell = viewModel.cells[startRow][minCol];
    if (cell) {
      const cellMeta = getCellMeta(viewModel, gridMeta, cell, startRow, minCol);
      if (!cellMeta.visible) {
        break;
      }
    }
  }

  while (true) {
    maxCol++;
    if (maxCol >= numCols-1) {
      maxCol = numCols-1;
      break;
    }
    const cell = viewModel.cells[startRow][maxCol];
    if (cell) {
      const cellMeta = getCellMeta(viewModel, gridMeta, cell, startRow, maxCol);
      if (!cellMeta.visible) {
        break;
      }
    }
  }

  while (true) {
    minRow--;
    if (minRow < 0) {
      minRow = 0;
      break;
    }
    const cell = viewModel.cells[minRow][startCol];
    if (cell) {
      const cellMeta = getCellMeta(viewModel, gridMeta, cell, minRow, startCol);
      if (!cellMeta.visible) {
        break;
      }
    }
  }

  while (true) {
    maxRow++;
    if (maxRow >= numRows-1) {
      maxRow = numRows-1;
      break;
    }
    const cell = viewModel.cells[maxRow][startCol];
    if (cell) {
      const cellMeta = getCellMeta(viewModel, gridMeta, cell, maxRow, startCol);
      if (!cellMeta.visible) {
        break;
      }
    }
  }

  let cellCount = 0;
  for (let r=minRow; r<=maxRow; r++) {
    for (let c=minCol; c<=maxCol; c++) {      
      cellCount++;
      if (cellCount <= maxCells) {
        const cell = viewModel.cells[r][c] as InternalCell<T>;    
        if (cell) {
          // warning, decorating original view model in place
          cell.row = r;
          cell.col = c;
          viewportCells.push(cell);
        }
      }
    }
  }

  //console.log('rendering ' + viewportCells.length + ' cells');
  return viewportCells;
};

const getGridMeta = <T extends CellViewModel>(viewModel: GridViewModel<T>): GridMeta => {
  const colHeaderHeights = viewModel.colHeader ? viewModel.colHeader.heights : [];
  const totalColHeaderHeight = viewModel.colHeader ? viewModel.colHeader.heights.reduce((ttl, h) => ttl += h, 0) : 0;
  const colWidths = viewModel.colWidths;
  const rowHeights = viewModel.rowHeights;
  const colStarts = getStarts(colWidths);
  const rowStarts = getStarts(rowHeights, totalColHeaderHeight);
  const innerWidth = colStarts[colStarts.length-1] + colWidths[colWidths.length-1];
  const innerHeight = rowStarts[rowStarts.length-1] + rowHeights[rowHeights.length-1];

  return {
    colWidths,
    rowHeights,
    colStarts,
    rowStarts,
    innerWidth,
    innerHeight,
    colHeaderHeights,
    totalColHeaderHeight,
    x: viewModel.x,
    y: viewModel.y,
  };
};

export type PowerGridProps<T extends CellViewModel> = {
  viewModel: GridViewModel<T>;
  onCellClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onViewModelUpdate?: () => void;
  role?: 'grid' | 'treegrid',
};

class PowerGrid<T extends CellViewModel = CellViewModel> extends React.PureComponent<PowerGridProps<T>> {
  static defaultProps: Partial<PowerGridProps<CellViewModel>> = {
    role: 'grid',
  };

  private cachedGridMeta: GridMeta;

  protected mainGridRef = React.createRef<HTMLDivElement>();
  protected shadowGridRef = React.createRef<HTMLDivElement>();
  protected isUpdating: boolean = false;
  protected scrolling: boolean = false;
  protected dirty: boolean = false;
  protected scrollTimeout: number | undefined;
  
  componentDidMount(): void {
    this.startUpdateLoop();
  }

  render(): React.ReactNode {
    const { role, viewModel } = this.props;
    const gridMeta: GridMeta = getGridMeta(viewModel);
    this.cachedGridMeta = gridMeta;
    const maxCells = viewModel.maxCellsWhileScrolling && viewModel.maxCellsWhileScrolling >= 0 && this.scrolling ?
      viewModel.maxCellsWhileScrolling :
      Number.POSITIVE_INFINITY;

    const viewportCells = getViewportCells(viewModel, gridMeta, maxCells);
    const reactViewportRows: React.ReactNode[] = [];
    let rowCells: React.ReactNode[] = [];

    viewportCells.forEach((cell: InternalCell<T>, i) => {
      rowCells.push(this.renderCell(cell, gridMeta));
      const nextCell = viewportCells[i + 1] as InternalCell<T>;
      // create new row if the next cell is in a different row or on last cell
      if (!nextCell || nextCell.row !== cell.row) {
        const reactRow = <GridRow role="row" aria-rowindex={cell.row + 1} key={cell.row}>{rowCells}</GridRow>;
        reactViewportRows.push(reactRow);
        rowCells = [];
      }
    });
    
    // column headers
    let columnHeader: React.ReactNode= null;
    if (viewModel.colHeader) {
      const startCell = viewportCells[0] as InternalCell<T>;
      const endCell = viewportCells[viewportCells.length - 1] as InternalCell<T>;
      console.log(`Visible Range: [${startCell.col}, ${startCell.row}] - [${endCell.col}, ${endCell.row}]`);
      
      columnHeader = (
        <thead role="rowgroup">
          {viewModel.colHeader.cells.map((row, i) => (
            <GridRow zIndex={1} key={`header_${i}`} role="row">
              {/* {viewModel.rowHeader?.widths.map((w) => <td />)} */}
              {row.slice(startCell.col, endCell.col + 1).map((cell, j) =>
                this.renderCell({ ...cell, row: i, col: j + startCell.col } as InternalCell<T>, gridMeta, CellType.ColumnHeader)
              )}
            </GridRow>
          ))}
        </thead>
      );
    }

    let viewportWidth = viewModel.width;
    if (!viewModel.hideScrollbars) {
      viewportWidth -= SCROLLBAR_SIZE;
    }

    let viewportHeight = viewModel.height;
    if (!viewModel.hideScrollbars) {
      viewportHeight -= SCROLLBAR_SIZE;
    }

    return(
      <Container
        ref={this.mainGridRef}
        width={viewModel.width}
        height={viewModel.height}
        onScroll={this.handleScroll}
        onWheel={this.handleWheel}
      >
        <ShadowGrid headerHeight={gridMeta.totalColHeaderHeight} hideScrollbars={viewModel.hideScrollbars} ref={this.shadowGridRef}>
          <ShadowGridContent width={gridMeta.innerWidth} height={gridMeta.innerHeight} />
        </ShadowGrid>
        <GridViewport
          aria-colcount={gridMeta.colWidths.length}
          aria-rowcount={gridMeta.rowHeights.length}
          role={role}
          width={viewportWidth}
          height={viewportHeight}
        >
          {columnHeader}
          <tbody role="rowgroup">
            {reactViewportRows}
          </tbody>
        </GridViewport>
      </Container>
    )
  }
  
  componentDidUpdate(): void {
    const viewModel = this.props.viewModel;
    const shadowGridEl = this.shadowGridRef.current!;
    shadowGridEl.scrollLeft = viewModel.x;
    shadowGridEl.scrollTop = viewModel.y;
  }
  
  componentWillUnmount(): void {
    this.stopUpdateLoop();
    clearTimeout(this.scrollTimeout);
  }
  
  private readonly renderCell = (cell: InternalCell<T>, gridMeta: GridMeta, cellType: CellType = CellType.GridCell): React.ReactNode => {
    const { onCellClick, viewModel } = this.props;
    const cellMeta = getCellMeta(viewModel, gridMeta, cell, cell.row, cell.col, cellType);
    const x = cellMeta.x - gridMeta.x;
    const y = cellMeta.y - gridMeta.y;
    const { height, width } = cellMeta;
    const sizeAndPosition = { x, y, width, height };
    
    const Cell = cellType === CellType.GridCell ? GridCell : GridHeaderCell;
    const InnerCell = cell.renderer;
    
    return (
      <Cell
        role={cellType}
        aria-colindex={cell.col + 1}
        aria-rowindex={cell.row + 1}
        colSpan={cell.colspan}
        rowSpan={cell.rowspan}
        key={`${cell.row}-${cell.col}`}
        {...sizeAndPosition}
      >
        <InnerCell
          {...cell}
          {...sizeAndPosition}
          onClick={onCellClick}
        />
      </Cell>
    );
  };
  
  private readonly handleScroll = (evt: React.UIEvent<HTMLDivElement>) => {
    const viewModel = this.props.viewModel;
    const shadowGridEl = this.shadowGridRef.current!;
    viewModel.x = shadowGridEl.scrollLeft;
    viewModel.y = shadowGridEl.scrollTop;
    this.onScroll();
  };
  
  private readonly handleWheel = (evt: React.WheelEvent<HTMLDivElement>) => {
    const viewModel = this.props.viewModel;
    viewModel.x += evt.deltaX;
    viewModel.y += evt.deltaY;
    this.onScroll();
  };
  
  private readonly onScroll = (): void => { 
    const viewModel = this.props.viewModel;
    const gridMeta = this.cachedGridMeta;
    const minX = 0;
    const minY = 0;
    const maxX = gridMeta.innerWidth - viewModel.width + SCROLLBAR_SIZE;
    const maxY = gridMeta.innerHeight - viewModel.height + SCROLLBAR_SIZE;
  
    if (viewModel.x < minX) {
      viewModel.x = minX;
    } else if (viewModel.x > maxX) {
      viewModel.x = maxX;
    }

    if (viewModel.y < minY) {
      viewModel.y = minY;
    } else if (viewModel.y > maxY) {
      viewModel.y = maxY;
    }

    if (this.props.onViewModelUpdate) {
      this.props.onViewModelUpdate();
    }

    this.setScrolling();
    this.dirty = true;
  };
  
  private readonly startUpdateLoop = (): void => {
    if (!this.isUpdating) {
      this.isUpdating = true;
      this.update();
    }
  };
  
  private readonly stopUpdateLoop = (): void => {
    this.isUpdating = false;
  };
  
  private readonly update = (): void => {
    if (this.dirty) {
      this.forceUpdate();
      this.dirty = false;
    }
    if (this.isUpdating) {
      requestAnimationFrame(() => {
        this.update();
      });
    }
  };
  
  private readonly setScrolling = (): void => {
    this.scrolling = true;
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = window.setTimeout(() => {
      this.scrolling = false;
      this.dirty = true;
    }, 100);
  };
}

export default PowerGrid;
