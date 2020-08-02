const React = require('react');
const ReactDom = require('react-dom');
const PowerGrid = require('./PowerGrid.jsx');

let appContainer = document.querySelector('#app');

let viewModel = {};

let render = () => {
  ReactDom.render(<PowerGrid state={viewModel} />, appContainer);
};

render();

