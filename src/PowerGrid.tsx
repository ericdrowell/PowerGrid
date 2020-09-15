import React from 'react';
import styled from '@emotion/styled';
import { GridViewModel, Cell, CellViewModel, Position } from './types';

type CellMeta = Position & {
  width: number,
  height: number,
  visible: boolean;
  // direction of cell relative to center of grid
  direction: Position;
};

type GridMeta = Position & {
  colWidths: number[];
  rowHeights: number[];
  colStarts: number[];
  rowStarts: number[];
  innerWidth: number;
  innerHeight: number;
  colHeaderHeights: number[];
  totalColHeaderHeight: number;
  rowHeaderWidths: number[];
  totalRowHeaderWidth: number;
};

type InternalCell<T extends CellViewModel> = Cell<T> & {
  col: number;
  row: number;
};

enum CellType {
  ColumnHeader = 'columnheader',
  GridCell = 'gridcell',
  HeaderIntersection = '',
  RowHeader = 'rowheader',
};

// TODO: this probably needs to change per browser.  Probably should auto calculate.
const SCROLLBAR_SIZE = 15;

const Container = styled.div({
  position: 'relative',
  overflow: 'hidden',
});

const ShadowGrid = styled.div<{
  hideScrollbars?: boolean;
  colHeaderHeight?: number;
  rowHeaderWidth?: number;
}>(({ colHeaderHeight = 0, rowHeaderWidth = 0 }) => ({
  width: `calc(100% - ${rowHeaderWidth}px)`,
  height: `calc(100% - ${colHeaderHeight}px)`,
  top: `${colHeaderHeight}px`,
  left: `${rowHeaderWidth}px`,
  overflow: 'auto',
  position: 'absolute',
}), ({ hideScrollbars }) => hideScrollbars && ({
  msOverflowStyle: 'none', /* Internet Explorer 10+ */
  scrollbarWidth: 'none',    /* Firefox */
  '&::-webkit-scrollbar': { 
    display: 'none',  /* Safari and Chrome */
  },
}));

const ShadowGridContent = styled.div({
  position: 'absolute',
});

const GridViewport = styled.table({
  position: 'absolute',
  overflow: 'hidden',
});

const GridRow = styled.tr({
  position: 'absolute',
});

const GridCell = styled.td<{ width: number; height: number; }>(({ width, height }) => ({
  width: `${width}px`,
  height: `${height}px`,
  position: 'absolute',
  overflow: 'hidden',
}));

const GridHeaderCell = styled(GridCell.withComponent('th'))({
  zIndex: 1,
});

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
  let x = gridMeta.colStarts[col];
  let y = gridMeta.rowStarts[row];
  
  if (cellType === CellType.ColumnHeader) {
    y = row * gridMeta.colHeaderHeights[row] + gridY;
  } else if (cellType === CellType.RowHeader) {
    x = col * gridMeta.rowHeaderWidths[col] + gridX;
  } else if (cellType === CellType.HeaderIntersection) {
    x = viewModel.headers!.rowHeader!.widths.slice(0, col).reduce((ttl, x) => ttl += x, 0) + gridX;
    y = viewModel.headers!.colHeader!.heights.slice(0, row).reduce((ttl, y) => ttl += y, 0) + gridY;
  }

  let colspanRemaining = cell.colspan === undefined ? 1 : cell.colspan;
  let colspanCol = col;
  let width = 0;
  while (colspanRemaining > 0) {
    switch (cellType) {
      case CellType.GridCell:
      case CellType.ColumnHeader:
        width += gridMeta.colWidths[colspanCol];
        break;
      case CellType.RowHeader:
        width += gridMeta.rowHeaderWidths[colspanCol];
        break;
      case CellType.HeaderIntersection:
        width = viewModel.headers!.rowHeader!.widths[col];
        break;
    }
    colspanCol++;
    colspanRemaining--;
  }

  let rowspanRemaining = cell.rowspan === undefined ? 1 : cell.rowspan;
  let rowspanRow = row;
  let height = 0;
  while (rowspanRemaining > 0) {
    switch (cellType) {
      case CellType.GridCell:
      case CellType.RowHeader:
        height += gridMeta.rowHeights[rowspanRow];
        break;
      case CellType.ColumnHeader:
        height += gridMeta.colHeaderHeights[rowspanRow];
        break;
      case CellType.HeaderIntersection:
        height = viewModel.headers!.colHeader!.heights[row];
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

const getGridMeta = <T extends CellViewModel>(viewModel: GridViewModel<T>, scrollPosition: Position): GridMeta => {
  const colHeaderHeights = viewModel.headers?.colHeader?.heights ?? [];
  const totalColHeaderHeight = viewModel.headers?.colHeader ? viewModel.headers.colHeader.heights.reduce((ttl, h) => ttl += h, 0) : 0;
  const rowHeaderWidths = viewModel.headers?.rowHeader?.widths ?? [];
  const totalRowHeaderWidth = viewModel.headers?.rowHeader ? viewModel.headers.rowHeader.widths.reduce((ttl, w) => ttl += w, 0) : 0;
  
  const colWidths = viewModel.colWidths;
  const rowHeights = viewModel.rowHeights;
  const colStarts = getStarts(colWidths, totalRowHeaderWidth);
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
    rowHeaderWidths,
    totalRowHeaderWidth,
    x: scrollPosition.x,
    y: scrollPosition.y,
  };
};

export type PowerGridProps<T extends CellViewModel> = {
  viewModel: GridViewModel<T>;
  onCellClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onScroll?: (scrollPosition: Position) => void;
  role?: 'grid' | 'treegrid',
};

class PowerGrid<T extends CellViewModel = CellViewModel> extends React.PureComponent<PowerGridProps<T>> {
  static defaultProps: Partial<PowerGridProps<CellViewModel>> = {
    role: 'grid',
  };

  private cachedGridMeta: GridMeta;
  private currentScrollPosition: Position = { x: 0, y: 0 };
  private scrollTimeout: number;

  protected mainGridRef = React.createRef<HTMLDivElement>();
  protected shadowGridRef = React.createRef<HTMLDivElement>();
  protected isUpdating: boolean = false;
  protected isScrolling: boolean = false;
  protected isDirty: boolean = false;
  
  componentDidMount(): void {
    this.startUpdateLoop();
  }

  render(): React.ReactNode {
    const { role, viewModel } = this.props;
    const gridMeta: GridMeta = getGridMeta(viewModel, this.currentScrollPosition);
    this.cachedGridMeta = gridMeta;
    const maxCells = viewModel.maxCellsWhileScrolling && viewModel.maxCellsWhileScrolling >= 0 && this.isScrolling ?
      viewModel.maxCellsWhileScrolling :
      Number.POSITIVE_INFINITY;

    const viewportCells = getViewportCells(viewModel, gridMeta, maxCells);
    const reactViewportRows: React.ReactNode[] = [];
    let rowCells: React.ReactNode[] = [];

    viewportCells.forEach((cell: InternalCell<T>, i) => {
      // row headers
      if (viewModel.headers?.rowHeader && rowCells.length === 0) {
        const rowIndex = cell.row;
        viewModel.headers.rowHeader.cells[rowIndex].forEach((rowHeaderCell, i) => {
          rowCells.push(this.renderCell({ ...rowHeaderCell, row: cell.row, col: i } as InternalCell<T>, gridMeta, CellType.RowHeader));
        });
      }
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
    if (viewModel.headers?.colHeader) {
      const startCell = viewportCells[0] as InternalCell<T>;
      const endCell = viewportCells[viewportCells.length - 1] as InternalCell<T>;
      // console.log(`Visible Range: [${startCell.col}, ${startCell.row}] - [${endCell.col}, ${endCell.row}]`);
      
      columnHeader = (
        <thead role="rowgroup">
          {viewModel.headers.colHeader.cells.map((row, i) => (
            <GridRow key={`header_${i}`} role="row">
              {this.renderHeaderIntersectionCells(i, gridMeta)}
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
        onScroll={this.handleScroll}
        onWheel={this.handleWheel}
        style={{
          width: `${viewModel.width}px`,
          height: `${viewModel.height}px`,
        }}
      >
        <ShadowGrid
          colHeaderHeight={gridMeta.totalColHeaderHeight}
          rowHeaderWidth={gridMeta.totalRowHeaderWidth}
          hideScrollbars={viewModel.hideScrollbars}
          ref={this.shadowGridRef}
        >
          <ShadowGridContent style={{ width: `${gridMeta.innerWidth}px`, height: `${gridMeta.innerHeight}px` }} />
        </ShadowGrid>
        <GridViewport
          aria-colcount={gridMeta.colWidths.length}
          aria-rowcount={gridMeta.rowHeights.length}
          role={role}
          style={{
            width: `${viewportWidth}px`,
            height: `${viewportHeight}px`,
          }}
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
    const shadowGridEl = this.shadowGridRef.current!;
    shadowGridEl.scrollLeft = this.currentScrollPosition.x;
    shadowGridEl.scrollTop = this.currentScrollPosition.y;
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
    
    const Cell = cellType === CellType.GridCell ? GridCell : GridHeaderCell;
    const InnerCell = cell.renderer;
    
    return (
      <Cell
        role={cellType}
        aria-colindex={cellType !== CellType.RowHeader ? cell.col + 1 : undefined}
        aria-rowindex={cellType !== CellType.ColumnHeader ? cell.row + 1 : undefined}
        colSpan={cell.colspan}
        rowSpan={cell.rowspan}
        key={`${cellType}-${cell.row}-${cell.col}`}
        width={width}
        height={height}
        style={{
          zIndex: cellType === CellType.HeaderIntersection ? 2 : undefined,
          transform: `translate(${x}px, ${y}px)`,
        }}
      >
        <InnerCell
          {...cell}
          width={width}
          height={height}
          x={x}
          y={y}
          onClick={onCellClick}
        />
      </Cell>
    );
  };
  
  private readonly renderHeaderIntersectionCells = (row: number, gridMeta: GridMeta): React.ReactNode => {
    const { viewModel: { headers } } = this.props;
    
    if (headers?.rowHeader && headers.colHeader) {
      return headers.rowHeader.widths.map((width, col) => {
        let cell: Cell<CellViewModel> = {
          renderer: () => <div style={{ backgroundColor: '#fff', height: '100%', }} />,
          viewModel: {},
        };
        if (headers?.intersections &&
          headers.intersections[row] &&
          headers.intersections[row][col]) {
          cell = headers?.intersections[row][col];
        }
        return this.renderCell({ ...cell, row, col } as InternalCell<T>, gridMeta, CellType.HeaderIntersection);
      });
    }
    return null;
  };
  
  private readonly handleScroll = (evt: React.UIEvent<HTMLDivElement>) => {
    const shadowGridEl = this.shadowGridRef.current!;
    this.onScroll({
      x: shadowGridEl.scrollLeft,
      y: shadowGridEl.scrollTop,
    });
  };
  
  private readonly handleWheel = (evt: React.WheelEvent<HTMLDivElement>) => {
    this.onScroll({
      x: this.currentScrollPosition.x + evt.deltaX,
      y: this.currentScrollPosition.y + evt.deltaY,
    });
  };
  
  private readonly onScroll = (targetScrollPosition: Position): void => { 
    const viewModel = this.props.viewModel;
    const gridMeta = this.cachedGridMeta;
    const minX = 0;
    const minY = 0;
    const maxX = gridMeta.innerWidth - viewModel.width + SCROLLBAR_SIZE;
    const maxY = gridMeta.innerHeight - viewModel.height + SCROLLBAR_SIZE;
    
    const normalizedScrollPosition: Position = {
      x: Math.min(Math.max(minX, targetScrollPosition.x), maxX),
      y: Math.min(Math.max(minY, targetScrollPosition.y), maxY),
    };
    
    if (this.currentScrollPosition.x !== normalizedScrollPosition.x || this.currentScrollPosition.y !== normalizedScrollPosition.y) {
      this.currentScrollPosition = normalizedScrollPosition;

      if (this.props.onScroll) {
        this.props.onScroll(this.currentScrollPosition);
      }

      this.setScrolling();
      this.isDirty = true;
    }
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
    if (this.isDirty) {
      this.forceUpdate();
      this.isDirty = false;
    }
    if (this.isUpdating) {
      requestAnimationFrame(() => {
        this.update();
      });
    }
  };
  
  private readonly setScrolling = (): void => {
    this.isScrolling = true;
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = window.setTimeout(() => {
      this.isScrolling = false;
      this.isDirty = true;
    }, 100);
  };
}

export default PowerGrid;
