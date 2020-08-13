const React = require('react');

module.exports = (props) => {
  let viewModel = props.viewModel;
  return (
    <td className={'power-grid-cell power-grid-text-cell ' + viewModel.rating} onClick={props.onClick} data-row={props.row} style={{transform: 'translate(' + props.x + 'px,' + props.y + 'px)', width: (props.width-2)+'px', height: props.height+'px'}}>
      {viewModel.value}
    </td>
  )
}