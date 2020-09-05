import React from 'react';
import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { ViewModel } from './types';

// TODO: this probably needs to change per browser.  Probably should auto calculate.
const SCROLLBAR_SIZE = 15;

const Container = styled.div<{ width: number; height: number; }>(({ width, height }) => ({
  width: `${width}px`,
  height: `${height}px`,
  position: 'relative',
  overflow: 'hidden',
}));

const ShadowGrid = styled.div<{ hideScrollbars?: boolean; }>({
  width: '100%',
  height: '100%',
  overflow: 'scroll',
  position: 'absolute',
}, ({ hideScrollbars }) => hideScrollbars && ({
  '-ms-overflow-style': 'none', /* Internet Explorer 10+ */
  'scrollbar-width': 'none',    /* Firefox */
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

let getStarts = (sizes: number[]): number[] => {
  let starts: number[] = [];
  let start = 0;
  sizes.forEach((size, n) => {
    starts[n] = start;
    start += size;
  });

  return starts;
}

let getCellMeta = (viewModel, gridMeta, cell, row, col) => {
  let gridX = gridMeta.x;
  let gridY = gridMeta.y;
  let gridWidth = viewModel.width;
  let gridHeight = viewModel.height;
  let x = gridMeta.colStarts[col];
  let y = gridMeta.rowStarts[row];

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
    height += gridMeta.rowHeights[rowspanRow];
    rowspanRow++;
    rowspanRemaining--;
  }

  let visible = x + width >= gridX && x <= gridX + gridWidth && y + height >= gridY && y - height <= gridY + gridHeight;

  return {
    x: x,
    y: y,
    width: width,
    height: height,
    visible: visible,
    // direction of cell relative to center of grid
    direction: {
      x: x > gridX + gridWidth/2 ? -1 : 1,
      y: y > gridY + gridHeight/2 ? -1 : 1
    }
  }
};

// quickly find a cell that is visible in the viewport
let getStartCell = (viewModel, gridMeta) => {
  // find cell near center;
  let numCols = gridMeta.colWidths.length;
  let numRows = gridMeta.rowHeights.length;
  let col = Math.floor(numCols/2);
  let row = Math.floor(numRows/2);
  let divider = 0.25;
  let bisectorCount = 0;
  let startCell;
  
  while (true) {
    startCell = viewModel.cells[row][col];

    if (startCell) {
      let startCellMeta = getCellMeta(viewModel, gridMeta, startCell, row, col);

      // if we find a visible cell, we have found the start cell!
      if (startCellMeta.visible) {
        // warning: decorating view model in place
        startCell.row = row;
        startCell.col = col;
        break;
      }

      let direction = startCellMeta.direction;

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
    bisectorCount++;
  }

  //console.log('found visible cell in ' + bisectorCount + ' iterations');

  return startCell;
}

let getViewportCells = (viewModel, gridMeta, maxCells) => {
  let viewportCells = [];
  let numCols = gridMeta.colWidths.length;
  let numRows = gridMeta.rowHeights.length;
  let startCell = getStartCell(viewModel, gridMeta);
  let startCol = startCell.col;
  let startRow = startCell.row;
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
    let cell = viewModel.cells[startRow][minCol];
    if (cell) {
      let cellMeta = getCellMeta(viewModel, gridMeta, cell, startRow, minCol);
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
    let cell = viewModel.cells[startRow][maxCol];
    if (cell) {
      let cellMeta = getCellMeta(viewModel, gridMeta, cell, startRow, maxCol);
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
    let cell = viewModel.cells[minRow][startCol];
    if (cell) {
      let cellMeta = getCellMeta(viewModel, gridMeta, cell, minRow, startCol);
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
    let cell = viewModel.cells[maxRow][startCol];
    if (cell) {
      let cellMeta = getCellMeta(viewModel, gridMeta, cell, maxRow, startCol);
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
        let cell = viewModel.cells[r][c];    
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

let getGridMeta = (viewModel) => {
  let colWidths = viewModel.colWidths;
  let rowHeights = viewModel.rowHeights;
  let colStarts = getStarts(colWidths);
  let rowStarts = getStarts(rowHeights);
  let innerWidth = colStarts[colStarts.length-1] + colWidths[colWidths.length-1];
  let innerHeight = rowStarts[rowStarts.length-1] + rowHeights[rowHeights.length-1];
  let x = viewModel.x;
  let y = viewModel.y;

  return {
    x: x,
    y: y,
    colWidths: colWidths,
    rowHeights: rowHeights,
    colStarts: colStarts,
    rowStarts: rowStarts,
    innerWidth: innerWidth,
    innerHeight: innerHeight
  };
};

export type PowerGridProps = {
  viewModel: ViewModel<T>;
  onCellClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onViewModelUpdate?: () => void;
};

class PowerGrid<T> extends React.PureComponent<PowerGridProps> {
  protected mainGridRef = React.createRef<HTMLDivElement>();
  protected shadowGridRef = React.createRef<HTMLDivElement>();
  protected scrolling = false;

  constructor(props: PowerGridProps) {
    super(props);

    let that = this;
    let dirty = false;
    
    let update = () => {
      if (dirty) {
        that.forceUpdate();
        dirty = false;
      }
      requestAnimationFrame(() => {
        update();
      });
    };

    let scrollTimeout: number;
    let setScrolling = () => {
      that.scrolling = true;
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(() => {
        that.scrolling = false;
        dirty = true;
      }, 100);
    };

    document.addEventListener('scroll', (evt) => {
      let powerGridEl = evt.target.closest('.power-grid');

      
      
      if (powerGridEl === that.mainGridRef.current) {
        let viewModel = that.props.viewModel;
        let shadowGridEl = evt.target.closest('.power-grid-shadow');
        viewModel.x = shadowGridEl.scrollLeft;
        viewModel.y = shadowGridEl.scrollTop;

        if (that.props.onViewModelUpdate) {
          that.props.onViewModelUpdate();
        }

        setScrolling();
        dirty = true;
      }
    }, true); // scroll does not bubble, must listen on capture


    document.addEventListener('wheel', (evt) => {
      let powerGridEl = evt.target.closest('.power-grid');
      let that = this;

      
      
      if (powerGridEl === that.mainGridRef.current) {
        let viewModel = that.props.viewModel;
        let gridMeta = that.cachedGridMeta;
        let minX = 0;
        let minY = 0;
        let maxX = gridMeta.innerWidth - viewModel.width + SCROLLBAR_SIZE;
        let maxY = gridMeta.innerHeight - viewModel.height + SCROLLBAR_SIZE;
        viewModel.x += evt.deltaX;
        viewModel.y += evt.deltaY;

        if (viewModel.x < minX) {
          viewModel.x = minX;
        }
        else if (viewModel.x > maxX) {
          viewModel.x = maxX;
        }

        if (viewModel.y < minY) {
          viewModel.y = minY;
        }
        else if (viewModel.y > maxY) {
          viewModel.y = maxY;
        }

        if (that.props.onViewModelUpdate) {
          that.props.onViewModelUpdate();
        }

        setScrolling();
        dirty = true;
      }
    }, true); // scroll does not bubble, must listen on capture

    update();
  }

  componentDidUpdate() {
    let viewModel = this.props.viewModel;
    let shadowGridEl = this.shadowGridRef.current;
    shadowGridEl.scrollLeft = viewModel.x;
    shadowGridEl.scrollTop = viewModel.y;
  }

  render() {
    let props = this.props;
    let viewModel = props.viewModel;
    let gridMeta = getGridMeta(viewModel);
    this.cachedGridMeta = gridMeta;
    let maxCells = viewModel.maxCellsWhileScrolling >= 0 && this.scrolling ? viewModel.maxCellsWhileScrolling : Number.POSITIVE_INFINITY;

    let viewportCells = getViewportCells(viewModel, gridMeta, maxCells);
    let reactViewportCells = [];

    let rowCells = [];
    let currentRow = viewportCells[0].row;

    viewportCells.forEach((cell, i) => {
      let cellViewModel = cell.viewModel;
      let cellMeta = getCellMeta(viewModel, gridMeta, cell, cell.row, cell.col);
      let x = cellMeta.x - gridMeta.x;
      let y = cellMeta.y - gridMeta.y;
      let width = cellMeta.width;
      let height = cellMeta.height;

      let reactCell = React.createElement(cell.renderer, {
        key: cell.row + '-' + cell.col,
        row: cell.row,
        col: cell.col,
        x: x,
        y: y,
        width: width,
        height: height,
        viewModel: cellViewModel,
        onClick: props.onCellClick,
        style: {
          transform: 'translate(' + x + 'px,' + y + 'px)',
          width: (width - 2) + 'px',
          height: height + 'px',
          position: 'absolute',
          overflow: 'hidden',
        }
      }, []);

      rowCells.push(reactCell);

      let nextCell = viewportCells[i+1];

      // create new row if the next cell is in a different row or on last cell
      if (!nextCell || nextCell.row !== cell.row) {

        let reactRow = React.createElement('tr', {
          key: cell.row,
          rowSpan: cell.rowspan || 1
        }, rowCells);

        reactViewportCells.push(reactRow);
        currentRow = cell.row;
        rowCells = [];
      }

      //reactViewportCells.push(reactCell);

    });

    let viewportWidth = viewModel.width;
    if (!viewModel.hideScrollbars) {
      viewportWidth -= SCROLLBAR_SIZE;
    }

    let viewportHeight = viewModel.height;
    if (!viewModel.hideScrollbars) {
      viewportHeight -= SCROLLBAR_SIZE;
    }

    let styles = css`
      table, caption, tbody, tfoot, thead, tr, th {
        margin: 0;
        padding: 0;
        border: 0;
        outline: 0;
        font-size: 100%;
        vertical-align: baseline;
        background: transparent;
        border-spacing: 0;
      }

      tr {
        position: absolute;
      }
    `;

    return(
      <Container css={styles} className="power-grid" ref={this.mainGridRef} width={viewModel.width} height={viewModel.height}>
        <ShadowGrid className="power-grid-shadow" hideScrollbars={viewModel.hideScrollbars} ref={this.shadowGridRef}>
          <ShadowGridContent width={gridMeta.innerWidth} height={gridMeta.innerHeight} />
        </ShadowGrid>
        <GridViewport className="power-grid-viewport" width={viewportWidth} height={viewportHeight}>
          <tbody>
            {reactViewportCells}
          </tbody>
        </GridViewport>
      </Container>
    )
  }
}

export default PowerGrid;