const React = require('react');
const ReactDom = require('react-dom');
const PowerGridView = require('./PowerGridView.jsx');
const TextCell = require('./cells/TextCell/TextCell.jsx');
const NUM_COLS = 100;
const NUM_ROWS = 400;
const CELL_WIDTH = 75;
const CELL_HEIGHT = 30;
let appContainer = document.querySelector('#app');

let getRating = () => {
  let val = Math.random();

  if (val < 0.2) {
    return 'bad'
  }
  else if (val < 0.6) {
    return 'neutral'
  }
  else {
    return 'good';
  }
};









let mainViewModel = {
  width: 600,
  height: 400,
  x: 0,
  y: 0,
  colWidths: [],
  rowHeights: [],
  cells: []
};
for (let c=0; c<NUM_COLS; c++) {
  mainViewModel.colWidths[c] = CELL_WIDTH;
}
for (let r=0; r<NUM_ROWS; r++) {
  mainViewModel.rowHeights[r] = CELL_HEIGHT;
}
for (let r=0; r<NUM_ROWS; r++) {
  for (let c=0; c<NUM_COLS; c++) {
    mainViewModel.cells.push({
      renderer: TextCell,
      viewModel: {
        value: c + ',' + r,
        rating: getRating(),
        col: c,
        row: r
      }
    });
  }
}



let ROW_HEADER_WIDTH = 180;
let rowHeadersViewModel = {
  hideScrollbars: false,
  width: ROW_HEADER_WIDTH,
  height: 400,
  x: 0,
  y: 0,
  colWidths: [],
  rowHeights: [],
  cells: []
};
for (let c=0; c<1; c++) {
  rowHeadersViewModel.colWidths[c] = ROW_HEADER_WIDTH;
}
for (let r=0; r<NUM_ROWS; r++) {
  rowHeadersViewModel.rowHeights[r] = CELL_HEIGHT;
}
for (let r=0; r<NUM_ROWS; r++) {
  for (let c=0; c<1; c++) {
    rowHeadersViewModel.cells.push({
      renderer: TextCell,
      viewModel: {
        value:'Row Header ' + r,
        col: c,
        row: r
      }
    });
  }
}


ReactDom.render(<PowerGridView viewModel={mainViewModel}/>, appContainer);




