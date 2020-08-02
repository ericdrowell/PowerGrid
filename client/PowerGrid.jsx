const React = require('react');

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
  let colWidths = viewModel.colWidths;
  let rowHeights = viewModel.rowHeights;
  let colStarts = getStarts(colWidths);
  let rowStarts = getStarts(rowHeights);

  // for now render all.  will need to filter down
  let viewportCells = viewModel.cells;

  let reactCells = [];

  viewportCells.forEach((cell) => {
    let cellViewModel = cell.viewModel;
    let x = colStarts[cellViewModel.col];
    let y = rowStarts[cellViewModel.row];
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

  let grid = React.createElement('div', {
    className: 'power-grid',
    style: {
      width: viewModel.width + 'px',
      height: viewModel.height + 'px'
    }
  }, reactCells);

  return grid;
}