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

module.exports = (props) => {
  let viewModel = props.viewModel;
  let gridX = viewModel.x;
  let gridY = viewModel.y;
  let colWidths = viewModel.colWidths;
  let rowHeights = viewModel.rowHeights;
  let colStarts = getStarts(colWidths);
  let rowStarts = getStarts(rowHeights);
  let shadowGridWidth = colStarts[colStarts.length-1] + colWidths[colWidths.length-1];
  let shadowGridHeight = rowStarts[rowStarts.length-1] + rowHeights[rowHeights.length-1];

  // for now render all.  will need to filter down
  let viewportCells = viewModel.cells;

  let reactCells = [];

  viewportCells.forEach((cell) => {
    let cellViewModel = cell.viewModel;
    let x = gridX + colStarts[cellViewModel.col];
    let y = gridY + rowStarts[cellViewModel.row];
    let width = colWidths[cellViewModel.col];
    let height = rowHeights[cellViewModel.row];

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
    className: 'shadow-content',
    style: {
      width: shadowGridWidth + 'px',
      height: shadowGridHeight + 'px',
      position: 'absolute'
    }
  }, []);

  let shadowGrid = React.createElement('div', {
    className: 'shadow-grid',
    style: {
      width: viewModel.width + 'px',
      height: viewModel.height + 'px',
      position: 'absolute'
    }
  }, shadowContent);

  let sceneGrid = React.createElement('div', {
    className: 'scene-grid',
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