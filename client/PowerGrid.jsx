const React = require('react');

module.exports = (props) => {
  let state = props.state;

  // for now render all.  will need to filter down
  let viewportCells = state.cells;

  let reactCells = [];

  viewportCells.forEach((cell) => {
    let x = 0;
    let y = 100;

    let innerCell = React.createElement(cell.renderer, cell.viewModel, []);

    let outerCell = React.createElement('div', {
      className: 'power-grid-cell',
      style: {
        transform: 'translate(' + x + 'px ,' +  y + 'px)'
      }
    }, [innerCell])

    reactCells.push(outerCell);
  });

  let grid = React.createElement('div', {
    className: 'power-grid'
  }, reactCells);

  return grid;
}