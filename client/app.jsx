const React = require('react');
const ReactDom = require('react-dom');
const PowerGrid = require('./PowerGrid.jsx');
const TextCell = require('./cells/TextCell/TextCell.jsx');

let appContainer = document.querySelector('#app');

let viewModel = {
  x: 100,
  y: 100,
  colWidths: [50, 50, 50, 50],
  rowHeights: [20, 20, 20, 20],
  cells: [
    {
      renderer: TextCell,
      viewModel: {
        value: 'A'
      },
      col: 0,
      row: 0
    },
    {
      renderer: TextCell,
      viewModel: {
        value: 'B'
      },
      col: 0,
      row: 1
    },
    {
      renderer: TextCell,
      viewModel: {
        value: 'C'
      },
      col: 0,
      row: 2
    },
    {
      renderer: TextCell,
      viewModel: {
        value: 'D'
      },
      col: 0,
      row: 3
    }
  ]
};

let render = () => {
  ReactDom.render(<PowerGrid state={viewModel} />, appContainer);
};

render();

