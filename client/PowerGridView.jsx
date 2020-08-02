const React = require('react');

const SCROLLBAR_SIZE = 15;
const VIEWPORT_BUFFER = 100; // in pixels

let getStarts = (sizes) => {
  let starts = [];
  let start = 0;
  sizes.forEach((size, n) => {
    starts[n] = start;
    start += size;
  });

  return starts;
}

let getViewportCells = (viewModel, gridMeta) => {
  let gridX = viewModel.x;
  let gridY = viewModel.y;
  let gridWidth = viewModel.width;
  let gridHeight = viewModel.height;

  let viewportCells = viewModel.cells.filter((cell) => {
    let cellViewModel = cell.viewModel;
    let x = gridMeta.colStarts[cellViewModel.col];
    let y = gridMeta.rowStarts[cellViewModel.row];
    return x >= gridX - VIEWPORT_BUFFER && x <= gridX + gridWidth + VIEWPORT_BUFFER && y >= gridY - VIEWPORT_BUFFER && y <= gridY + gridHeight + VIEWPORT_BUFFER;
  });

  console.log('rendering ' + viewportCells.length + '/' + viewModel.cells.length + ' cells');

  return viewportCells;
};

let getCellRect = (gridMeta, col, row) => {
  return {
    x: -1 * gridMeta.x + gridMeta.colStarts[col],
    y: -1 * gridMeta.y + gridMeta.rowStarts[row],
    width: gridMeta.colWidths[col],
    height: gridMeta.rowHeights[row]
  };
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