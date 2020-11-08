import React from 'react';
import styled from '@emotion/styled';
import { GridViewModel, Cell, CellViewModel, Position, FixedGridColumns, FixedGridRows } from './types';

// TODO: this probably needs to change per browser.  Probably should auto calculate.
const SCROLLBAR_SIZE = 15;

type CellMeta = Position & {
  width: number,
  height: number,
  visible: boolean;
  /**
   * direction of cell relative to center of grid
   */
  direction: Position;
};

type GridMeta = Position & {
  innerWidth: number;
  innerHeight: number;
  colWidths: number[];
  rowHeights: number[];
  colStarts: number[];
  rowStarts: number[];
  colHeaderHeights: number[];
  colHeaderStarts: number[];
  rowHeaderWidths: number[];
  rowHeaderStarts: number[];
  colFooterHeights: number[];
  colFooterStarts: number[];
  rowFooterWidths: number[];
  rowFooterStarts: number[];
  totalColHeaderHeight: number;
  totalRowHeaderWidth: number;
  totalColFooterHeight: number;
  totalRowFooterWidth: number;
};

type InternalCell = Cell<any> & {
  col: number;
  row: number;
};

enum CellType {
  Body = 'Body',
  ColumnHeader = 'ColumnHeader',
  ColumnFooter = 'ColumnFooter',
  RowHeader = 'RowHeader',
  RowFooter = 'RowFooter',
  TopLeftIntersection = 'TopLeftIntersection',
  TopRightIntersection = 'TopRightIntersection',
  BottomLeftIntersection = 'BottomLeftIntersection',
  BottomRightIntersection = 'BottomRightIntersection',
};

const Container = styled.div({
  position: 'relative',
  overflow: 'hidden',
});

const ShadowGrid = styled.div<{
  hideScrollbars?: boolean;
  colHeaderHeight?: number;
  rowHeaderWidth?: number;
}>(({ colHeaderHeight = 0, rowHeaderWidth = 0 }) => ({
  top: `${colHeaderHeight}px`,
  left: `${rowHeaderWidth}px`,
  bottom: 0,
  right: 0,
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
  position: 'relative',
  display: 'block',
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

export type PowerGridProps<T extends CellViewModel, H extends CellViewModel = T> = {
  width: number;
  height: number;
  viewModel: GridViewModel<T, H>;
  onCellClick?: (cell: Cell<T>, col: number, row: number) => void;
  onScroll?: (scrollPosition: Position) => void;
  role?: 'grid' | 'treegrid',
};

class PowerGrid<T extends CellViewModel = CellViewModel, H extends CellViewModel = T> extends React.PureComponent<PowerGridProps<T, H>> {
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
    const { height, role, viewModel, width } = this.props;
    const gridMeta: GridMeta = this.getGridMeta(viewModel, this.currentScrollPosition);
    this.cachedGridMeta = gridMeta;
    const maxCells = viewModel.maxCellsWhileScrolling && viewModel.maxCellsWhileScrolling >= 0 && this.isScrolling ?
      viewModel.maxCellsWhileScrolling :
      Number.POSITIVE_INFINITY;

    const viewportCells = this.getViewportCells(viewModel, gridMeta, maxCells);
    const reactViewportRows: React.ReactNode[] = [];
    let rowCells: React.ReactNode[] = [];

    viewportCells.forEach((cell: InternalCell, i) => {
      if (rowCells.length === 0) {
        // render row headers
        rowCells.push(
          ...this.renderFixedGridColumns(viewModel.headers?.rowHeaders, gridMeta, CellType.RowHeader, cell.row)
        );
      }
      rowCells.push(this.renderCell(cell, gridMeta));
      const nextCell = viewportCells[i + 1];
      // create new row if the next cell is in a different row or on last cell
      if (!nextCell || nextCell.row !== cell.row) {
        // render row footers
        rowCells.push(
          ...this.renderFixedGridColumns(viewModel.footers?.rowFooters, gridMeta, CellType.RowFooter, cell.row)
        );
        reactViewportRows.push(<GridRow role="row" aria-rowindex={cell.row + 1} key={cell.row}>{rowCells}</GridRow>);
        rowCells = [];
      }
    });    

    let viewportWidth = width;
    if (!viewModel.hideScrollbars) {
      viewportWidth -= SCROLLBAR_SIZE;
    }

    let viewportHeight = height;
    if (!viewModel.hideScrollbars) {
      viewportHeight -= SCROLLBAR_SIZE;
    }
    
    const startCell = viewportCells[0];
    const endCell = viewportCells[viewportCells.length - 1];
    // console.log(`Visible Range: [${startCell.col}, ${startCell.row}] - [${endCell.col}, ${endCell.row}]`);

    return(
      <Container
        ref={this.mainGridRef}
        onScroll={this.handleScroll}
        onWheel={this.handleWheel}
        style={{
          width: `${width}px`,
          height: `${height}px`,
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
          {this.renderFixedGridRows(viewModel.headers?.colHeaders, gridMeta, CellType.ColumnHeader, startCell.col, endCell.col)}
          <tbody role="rowgroup">
            {reactViewportRows}
          </tbody>
          {this.renderFixedGridRows(viewModel.footers?.colFooters, gridMeta, CellType.ColumnFooter, startCell.col, endCell.col)}
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
  
  private readonly renderCell = (cell: InternalCell, gridMeta: GridMeta, cellType: CellType = CellType.Body): React.ReactNode => {
    const cellMeta = this.getCellMeta(gridMeta, cell as Cell<T>, cell.row, cell.col, cellType);
    const x = cellMeta.x - gridMeta.x;
    const y = cellMeta.y - gridMeta.y;
    const { height, width } = cellMeta;
    
    let zIndex: number | undefined;
    if (cellType === CellType.TopLeftIntersection ||
      cellType === CellType.TopRightIntersection ||
      cellType === CellType.BottomLeftIntersection ||
      cellType === CellType.BottomRightIntersection) {
      zIndex = 2;
    }
    
    // ARIA attributes
    let ariaColIndex: number | undefined;
    let ariaRowIndex: number | undefined;
    if (cellType === CellType.Body) {
      ariaColIndex = cell.col + 1;
      ariaRowIndex = cell.row + 1;
    } else if (cellType === CellType.ColumnHeader || cellType === CellType.ColumnFooter) {
      ariaColIndex = cell.col + 1;
    } else if (cellType === CellType.RowHeader || cellType === CellType.RowFooter) {
      ariaRowIndex = cell.row + 1;
    }
    
    const Cell = cellType === CellType.Body ? GridCell : GridHeaderCell;
    const InnerCell = cell.renderer;
    
    return (
      <Cell
        aria-colindex={ariaColIndex}
        aria-rowindex={ariaRowIndex}
        colSpan={cell.colspan}
        rowSpan={cell.rowspan}
        key={`${cellType}-${cell.row}-${cell.col}`}
        width={width}
        height={height}
        style={{
          zIndex,
          transform: `translate(${x}px, ${y}px)`,
        }}
        onClick={this.onCellClick.bind(this, cell, cell.col, cell.row)}
      >
        <InnerCell
          {...cell}
          width={width}
          height={height}
          x={x}
          y={y}
        />
      </Cell>
    );
  };
  
  private readonly renderFixedGridRows = (
    fixedGridRows: FixedGridRows<H> | undefined,
    gridMeta: GridMeta,
    cellType: CellType.ColumnHeader | CellType.ColumnFooter,
    start: number,
    end: number
  ): React.ReactNode => {
    if (fixedGridRows) {
      const isHeader = cellType === CellType.ColumnHeader;
      const TableSection = isHeader ? 'thead' : 'tfoot';
      return (
        <TableSection role="rowgroup">
          {fixedGridRows.cells.map((rowCells, row) => (
            <GridRow key={`${row}`} role="row">
              {this.renderIntersectionCells(row, gridMeta, isHeader ? CellType.TopLeftIntersection : CellType.BottomLeftIntersection)}
              {rowCells.slice(start, end + 1).map((cell, col) =>
                this.renderCell({ ...cell, row, col: col + start }, gridMeta, cellType)
              )}
              {this.renderIntersectionCells(row, gridMeta, isHeader ? CellType.TopRightIntersection : CellType.BottomRightIntersection)}
            </GridRow>
          ))}
        </TableSection>
      );
    }
    return null;
  };
  
  private readonly renderIntersectionCells = (
    row: number,
    gridMeta: GridMeta,
    cellType: CellType.TopLeftIntersection | CellType.TopRightIntersection | CellType.BottomLeftIntersection | CellType.BottomRightIntersection,
  ): React.ReactNode => {
    const { viewModel: { headers, footers, intersections } } = this.props;
    let intersectionXAxis: FixedGridRows<H> | undefined;
    let intersectionYAxis: FixedGridColumns<H> | undefined;
    let intersectionCells: Cell<H>[][] | undefined;

    switch (cellType) {
      case CellType.TopLeftIntersection:
        intersectionXAxis = headers?.colHeaders;
        intersectionYAxis = headers?.rowHeaders;
        intersectionCells = intersections?.topLeftIntersections;
        break;
      case CellType.BottomLeftIntersection:
        intersectionXAxis = footers?.colFooters;
        intersectionYAxis = headers?.rowHeaders;
        intersectionCells = intersections?.bottomLeftIntersections;
        break;
      case CellType.TopRightIntersection:
        intersectionXAxis = headers?.colHeaders;
        intersectionYAxis = footers?.rowFooters;
        intersectionCells = intersections?.topRightIntersections;
        break;
      case CellType.BottomRightIntersection:
        intersectionXAxis = footers?.colFooters;
        intersectionYAxis = footers?.rowFooters;
        intersectionCells = intersections?.bottomRightIntersections;
        break;
    }

    if (intersectionXAxis && intersectionYAxis) {
      return intersectionYAxis.widths.map((width, col) => {
        let cell: Partial<InternalCell> = {
          renderer: () => <div style={{ backgroundColor: '#fff', height: '100%', }} />,
        };
        if (intersectionCells) {
          if (intersectionCells[row] && intersectionCells[row][col]) {
            cell = intersectionCells[row][col];
          } else {
            // don't render a cell if intersections are defined, but no cell for this coord is defined
            // console.log(`not rendering a cell for ${cellType} at [${col}, ${row}]`);
            return null;
          }
        }
        return this.renderCell({ ...cell, row, col } as InternalCell, gridMeta, cellType);
      });
    }
    return null;
  };
  
  private readonly renderFixedGridColumns = (
    fixedGridColumns: FixedGridColumns<H> | undefined,
    gridMeta: GridMeta,
    cellType: CellType.RowHeader | CellType.RowFooter,
    row: number,
  ): React.ReactNode[] => {
    if (fixedGridColumns) {
      return fixedGridColumns.cells[row].map((cell, col) =>
        this.renderCell({ ...cell, row, col }, gridMeta, cellType)
      );
    }
    return [];
  };
  
  private readonly onCellClick = (cell: Cell<T>, col: number, row: number): void => {
    const { onCellClick } = this.props;
    onCellClick && onCellClick(cell, col, row);
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
    const { height, width } = this.props;
    const gridMeta = this.cachedGridMeta;
    const minX = 0;
    const minY = 0;
    const maxX = gridMeta.innerWidth - width + SCROLLBAR_SIZE;
    const maxY = gridMeta.innerHeight - height + SCROLLBAR_SIZE;
    
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
  
  
  // *************************

  private readonly getStarts = (sizes: number[], offset: number = 0): number[] => {
    const starts: number[] = [];
    let start = offset;
    sizes.forEach((size, n) => {
      starts[n] = start;
      start += size;
    });
  
    return starts;
  }
  
  private readonly getCellMeta = (
    gridMeta: GridMeta,
    cell: Cell<T>,
    row: number,
    col: number,
    cellType: CellType = CellType.Body
  ): CellMeta => {
    const { x: gridX, y: gridY } = gridMeta;
    const { width: gridWidth, height: gridHeight } = this.props;

    let x = gridMeta.colStarts[col];
    let y = gridMeta.rowStarts[row];

    if (cellType !== CellType.Body) {
      // set header X position
      switch (cellType) {
        case CellType.RowHeader:
        case CellType.TopLeftIntersection:
        case CellType.BottomLeftIntersection:
          x = gridMeta.rowHeaderStarts[col] + gridX;
          break;
        case CellType.RowFooter:
        case CellType.TopRightIntersection:
        case CellType.BottomRightIntersection:
          x = gridMeta.rowFooterStarts[col] + gridX - SCROLLBAR_SIZE;
          break;
      }

      // set header Y position
      switch (cellType) {
        case CellType.ColumnHeader:
        case CellType.TopLeftIntersection:
        case CellType.TopRightIntersection:
          y = gridMeta.colHeaderStarts[row] + gridY;
          break;
        case CellType.ColumnFooter:
        case CellType.BottomLeftIntersection:
        case CellType.BottomRightIntersection:
          y = gridMeta.colFooterStarts[row] + gridY - SCROLLBAR_SIZE;
          break;
      }
    }
  
    let colspanRemaining = cell.colspan ?? 1;
    let colspanCol = col;
    let width = 0;
    while (colspanRemaining > 0) {
      switch (cellType) {
        case CellType.Body:
        case CellType.ColumnHeader:
        case CellType.ColumnFooter:
          width += gridMeta.colWidths[colspanCol];
          break;
        case CellType.RowHeader:
        case CellType.TopLeftIntersection:
        case CellType.BottomLeftIntersection:
          width += gridMeta.rowHeaderWidths[colspanCol];
          break;
        case CellType.RowFooter:
        case CellType.TopRightIntersection:
        case CellType.BottomRightIntersection:
          width += gridMeta.rowFooterWidths[colspanCol];
          break;
      }
      colspanCol++;
      colspanRemaining--;
    }
  
    let rowspanRemaining = cell.rowspan ?? 1;
    let rowspanRow = row;
    let height = 0;
    while (rowspanRemaining > 0) {
      switch (cellType) {
        case CellType.Body:
        case CellType.RowHeader:
        case CellType.RowFooter:
          height += gridMeta.rowHeights[rowspanRow];
          break;
        case CellType.ColumnHeader:
        case CellType.TopLeftIntersection:
        case CellType.TopRightIntersection:
          height += gridMeta.colHeaderHeights[rowspanRow];
          break;
        case CellType.ColumnFooter:
        case CellType.BottomLeftIntersection:
        case CellType.BottomRightIntersection:
          height += gridMeta.colFooterHeights[rowspanRow];
          break;
      }
      rowspanRow++;
      rowspanRemaining--;
    }
    
    let visible = true;
    let direction = {
      x: 0,
      y: 0,
    };
      
    if (cellType === CellType.Body) {
      const visibleGridWidth = gridWidth - gridMeta.totalRowHeaderWidth - gridMeta.totalRowFooterWidth - SCROLLBAR_SIZE;
      const visibleGridHeight = gridHeight - gridMeta.totalColHeaderHeight - gridMeta.totalColFooterHeight - SCROLLBAR_SIZE;

      const viewportX = gridMeta.totalRowHeaderWidth + gridX;
      const viewportXMax = viewportX + visibleGridWidth;
      const viewportY = gridMeta.totalColHeaderHeight + gridY;
      const viewportYMax = viewportY + visibleGridHeight;
    
      const cellX = x;
      const cellXMax = x + width;
      const cellY = y;
      const cellYMax = y + height;
    
      visible = cellXMax >= viewportX && cellX <= viewportXMax && cellYMax >= viewportY && cellY <= viewportYMax;
      direction = {
        x: x > viewportX + visibleGridWidth / 2 ? -1 : 1,
        y: y > viewportY + visibleGridHeight / 2 ? -1 : 1,
      };
    }
    
    return {
      x,
      y,
      width,
      height,
      visible,
      direction,
    }
  };  

  // quickly find a cell that is visible in the viewport
  private readonly getStartCell = (viewModel: GridViewModel<T, H>, gridMeta: GridMeta): InternalCell => {
    // find cell near center;
    const numCols = gridMeta.colWidths.length;
    const numRows = gridMeta.rowHeights.length;
    let col = Math.floor(numCols/2);
    let row = Math.floor(numRows/2);
    let divider = 0.25;
    let startCell;
    
    while (true) {
      startCell = viewModel.cells[row][col] as InternalCell;

      if (startCell) {
        const startCellMeta = this.getCellMeta(gridMeta, startCell as Cell<T>, row, col);

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

  private readonly getViewportCells = (viewModel: GridViewModel<T, H>, gridMeta: GridMeta, maxCells: number): InternalCell[] => {
    const viewportCells = [];
    const numCols = gridMeta.colWidths.length;
    const numRows = gridMeta.rowHeights.length;
    const startCell = this.getStartCell(viewModel, gridMeta);
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
        const cellMeta = this.getCellMeta(gridMeta, cell, startRow, minCol);
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
        const cellMeta = this.getCellMeta(gridMeta, cell, startRow, maxCol);
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
        const cellMeta = this.getCellMeta(gridMeta, cell, minRow, startCol);
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
        const cellMeta = this.getCellMeta(gridMeta, cell, maxRow, startCol);
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
          const cell = viewModel.cells[r][c] as InternalCell;    
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

  private readonly getGridMeta = (viewModel: GridViewModel<T, H>, scrollPosition: Position): GridMeta => {
    const colHeaderHeights = viewModel.headers?.colHeaders?.heights ?? [];
    const totalColHeaderHeight = viewModel.headers?.colHeaders ? viewModel.headers.colHeaders.heights.reduce((ttl, h) => ttl += h, 0) : 0;
    const rowHeaderWidths = viewModel.headers?.rowHeaders?.widths ?? [];
    const totalRowHeaderWidth = viewModel.headers?.rowHeaders ? viewModel.headers.rowHeaders.widths.reduce((ttl, w) => ttl += w, 0) : 0;
    
    const colFooterHeights = viewModel.footers?.colFooters?.heights ?? [];
    const totalColFooterHeight = viewModel.footers?.colFooters ? viewModel.footers.colFooters.heights.reduce((ttl, h) => ttl += h, 0) : 0;
    const rowFooterWidths = viewModel.footers?.rowFooters?.widths ?? [];
    const totalRowFooterWidth = viewModel.footers?.rowFooters ? viewModel.footers.rowFooters.widths.reduce((ttl, w) => ttl += w, 0) : 0;
    
    const colWidths = viewModel.colWidths;
    const rowHeights = viewModel.rowHeights;
    const colStarts = this.getStarts(colWidths, totalRowHeaderWidth);
    const rowStarts = this.getStarts(rowHeights, totalColHeaderHeight);
    const innerWidth = colStarts[colStarts.length-1] + colWidths[colWidths.length-1] + totalRowFooterWidth;
    const innerHeight = rowStarts[rowStarts.length - 1] + rowHeights[rowHeights.length - 1] + totalColFooterHeight;
    
    const colHeaderStarts = this.getStarts(colHeaderHeights);
    const colFooterStarts = this.getStarts(colFooterHeights, this.props.height - totalColFooterHeight);
    const rowHeaderStarts = this.getStarts(rowHeaderWidths);
    const rowFooterStarts = this.getStarts(rowFooterWidths, this.props.width - totalRowFooterWidth);
  
    return {
      colWidths,
      rowHeights,
      colStarts,
      rowStarts,
      innerWidth,
      innerHeight,
      colHeaderHeights,
      colHeaderStarts,
      totalColHeaderHeight,
      rowHeaderWidths,
      rowHeaderStarts,
      totalRowHeaderWidth,
      colFooterHeights,
      colFooterStarts,
      totalColFooterHeight,
      rowFooterWidths,
      rowFooterStarts,
      totalRowFooterWidth,
      x: scrollPosition.x,
      y: scrollPosition.y,
    };
  };
}

export default PowerGrid;
