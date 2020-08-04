const React = require('react');

const SCROLLBAR_SIZE = 15;

let getStarts = (sizes) => {
  let starts = [];
  let start = 0;
  sizes.forEach((size, n) => {
    starts[n] = start;
    start += size;
  });

  return starts;
}

let getCellIndex = (col, row, numCols) => {
  // e.g. 3*5
  // 0  1  2
  // 3  4  5 
  // 6  7  8
  // 9  10 11
  // 12 13 14

  return (row * numCols) + col;
};

let getCellRect = (gridMeta, col, row) => {
  return {
    x: -1 * gridMeta.x + gridMeta.colStarts[col],
    y: -1 * gridMeta.y + gridMeta.rowStarts[row],
    width: gridMeta.colWidths[col],
    height: gridMeta.rowHeights[row]
  };
};

let getCellMeta = (viewModel, gridMeta, cell) => {
  let gridX = viewModel.x;
  let gridY = viewModel.y;
  let gridWidth = viewModel.width;
  let gridHeight = viewModel.height;

  let cellViewModel = cell.viewModel;
  let x = gridMeta.colStarts[cellViewModel.col];
  let y = gridMeta.rowStarts[cellViewModel.row];
  let width = gridMeta.colWidths[cellViewModel.col];
  let height = gridMeta.rowHeights[cellViewModel.row];

  let visible = x + width >= gridX && x <= gridX + gridWidth && y + height >= gridY && y - height <= gridY + gridHeight;

  return {
    visible: visible,
    // direction of cell relative to center of grid
    direction: {
      x: x > gridX + gridWidth/2 ? -1 : 1,
      y: y > gridY + gridHeight/2 ? -1 : 1
    }
  }
};

let getStartCell = (viewModel, gridMeta) => {
  // find cell near center;
  let numCols = gridMeta.colWidths.length;
  let numRows = gridMeta.rowHeights.length;
  let col = Math.floor(numCols/2);
  let row = Math.floor(numRows/2);
  let cellIndex = getCellIndex(col, row, numCols);
  let startCell = viewModel.cells[cellIndex];
  let startCellMeta = getCellMeta(viewModel, gridMeta, startCell);
  let divider = 0.25;
  let bisectorCount = 0;
  
  while (!startCellMeta.visible) {
    //console.log(col, row, divider, startCellMeta.direction.x, startCellMeta.direction.y)
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

    cellIndex = getCellIndex(col, row, numCols);
    
    startCell = viewModel.cells[cellIndex];
    //console.log(col, row);
    startCellMeta = getCellMeta(viewModel, gridMeta, startCell);
    divider /= 2;
    bisectorCount++;
  }

  console.log('found visible cell in ' + bisectorCount + ' iterations');

  return startCell;
}

let getViewportCells = (viewModel, gridMeta) => {
  let viewportCells = [];
  let numCols = gridMeta.colWidths.length;
  let numRows = gridMeta.rowHeights.length;

  let startCell = getStartCell(viewModel, gridMeta);
  let startCol = startCell.viewModel.col;
  let startRow = startCell.viewModel.row;

  let minCol = startCol;
  let maxCol = startCol;
  let minRow = startRow;
  let maxRow = startRow;

  viewportCells.push(startCell); 

  while (true) {
    minCol--;
    if (minCol < 0) {
      minCol = 0;
      break;
    }
    let cellIndex = getCellIndex(minCol, startRow, numCols);
    let cell = viewModel.cells[cellIndex];
    cellMeta = getCellMeta(viewModel, gridMeta, cell);
    if (!cellMeta.visible) {
      break;
    }
  }

  while (true) {
    maxCol++;
    if (maxCol >= numCols-1) {
      maxCol = numCols-1;
      break;
    }
    let cellIndex = getCellIndex(maxCol, startRow, numCols);
    let cell = viewModel.cells[cellIndex];
    cellMeta = getCellMeta(viewModel, gridMeta, cell);
    if (!cellMeta.visible) {
      break;
    }
  }

  while (true) {
    minRow--;
    if (minRow < 0) {
      minRow = 0;
      break;
    }
    let cellIndex = getCellIndex(startCol, minRow, numCols);
    let cell = viewModel.cells[cellIndex];
    cellMeta = getCellMeta(viewModel, gridMeta, cell);
    if (!cellMeta.visible) {
      break;
    }
  }

  while (true) {
    maxRow++;
    if (maxRow >= numRows-1) {
      maxRow = numRows-1;
      break;
    }
    let cellIndex = getCellIndex(startCol, maxRow, numCols);
    let cell = viewModel.cells[cellIndex];
    cellMeta = getCellMeta(viewModel, gridMeta, cell);
    if (!cellMeta.visible) {
      break;
    }
  }

  //console.log(minCol, maxCol, minRow, maxRow);

  for (let r=minRow; r<=maxRow; r++) {
    for (let c=minCol; c<=maxCol; c++) {
      let cellIndex = getCellIndex(c, r, numCols);
      let cell = viewModel.cells[cellIndex];
      
      viewportCells.push(cell);
    }
  }

  console.log('rendering ' + viewportCells.length + '/' + viewModel.cells.length + ' cells');

  return viewportCells;
};


let getGridMeta = (viewModel) => {
  let colWidths = viewModel.colWidths;
  let rowHeights = viewModel.rowHeights;
  let colStarts = getStarts(colWidths);
  let rowStarts = getStarts(rowHeights);

  return {
    x: viewModel.x,
    y: viewModel.y,
    colWidths: colWidths,
    rowHeights: rowHeights,
    colStarts: colStarts,
    rowStarts: rowStarts,
    shadowGridWidth: colStarts[colStarts.length-1] + colWidths[colWidths.length-1],
    shadowGridHeight: rowStarts[rowStarts.length-1] + rowHeights[rowHeights.length-1]
  };
};

module.exports = (props) => {
  let viewModel = props.viewModel;
  let gridMeta = getGridMeta(viewModel);

  let viewportCells = getViewportCells(viewModel, gridMeta);

  let reactCells = [];

  viewportCells.forEach((cell) => {
    let cellViewModel = cell.viewModel;
    let cellRect = getCellRect(gridMeta, cellViewModel.col, cellViewModel.row);
    let x = cellRect.x;
    let y = cellRect.y;
    let width = cellRect.width;
    let height = cellRect.height;

    let innerCell = React.createElement(cell.renderer, cellViewModel, []);

    let outerCell = React.createElement('div', {
      className: 'power-grid-cell',
      style: {
        transform: 'translate(' + x + 'px ,' +  y + 'px)',
        width: width + 'px',
        height: height + 'px'
      }
    }, [innerCell])

    reactCells.push(outerCell);
  });

  let shadowContent = React.createElement('div', {
    className: 'power-grid-shadow-content',
    style: {
      width: gridMeta.shadowGridWidth + 'px',
      height: gridMeta.shadowGridHeight + 'px',
      position: 'absolute'
    }
  }, []);

  let shadowGrid = React.createElement('div', {
    className: 'power-grid-shadow-grid',
    style: {
      width: viewModel.width + 'px',
      height: viewModel.height + 'px',
      position: 'absolute'
    }
  }, shadowContent);

  let sceneGrid = React.createElement('div', {
    className: 'power-grid-scene-grid',
    style: {
      width: (viewModel.width-SCROLLBAR_SIZE) + 'px',
      height: (viewModel.height-SCROLLBAR_SIZE) + 'px',
      position: 'absolute'
    }
  }, reactCells);

  let children = [sceneGrid, shadowGrid];

  let grid = React.createElement('div', {
    className: 'power-grid',
    style: {
      width: viewModel.width + 'px',
      height: viewModel.height + 'px'
    }
  }, children);

  return grid;
}