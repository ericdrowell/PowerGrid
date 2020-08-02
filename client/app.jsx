const React = require('react');
const ReactDom = require('react-dom');
const PowerGrid = require('./PowerGrid.jsx');
const TextCell = require('./cells/TextCell/TextCell.jsx');

let appContainer = document.querySelector('#app');

let viewModel = {
  width: 200,
  height: 200,
  x: 0,
  y: 0,
  colWidths: [150, 150],
  rowHeights: [150, 150],
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

