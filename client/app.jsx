const React = require('react');
const ReactDom = require('react-dom');
const PowerGrid = require('./PowerGrid.jsx');
const TextCell = require('./cells/TextCell/TextCell.jsx');

let appContainer = document.querySelector('#app');

let viewModel = {
  width: 200,
  height: 200,
  x: 100,
  y: 100,
  colWidths: [50, 50, 50, 50],
  rowHeights: [20, 20, 20, 20],
  cells: [
    {
      renderer: TextCell,
      viewModel: {
        value: 'A',
        col: 0,
        row: 0
      }
    },
    {
      renderer: TextCell,
      viewModel: {
        value: 'B',
        col: 1,
        row: 0
      }
    },
    {
      renderer: TextCell,
      viewModel: {
        value: 'C',
        col: 0,
        row: 1
      }
    },
    {
      renderer: TextCell,
      viewModel: {
        value: 'D',
        col: 1,
        row: 1
      }
    }
  ]
};

let render = () => {
  ReactDom.render(<PowerGrid viewModel={viewModel} />, appContainer);
};

render();

