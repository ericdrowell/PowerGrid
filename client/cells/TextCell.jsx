import React from 'react';
import { css } from 'emotion';

const TextCell = (props) => {
  let viewModel = props.viewModel;

  let styles = css`
    background-color: #eee;

    &.bad {
      background-color: #ffc7ce;
      color: #9c0006;
    }

    &.neutral {
      background-color: #ffeb9c;
      color: #9c5700;
    }

    &.good {
      background-color: #c6efce;
      color: #267c27;
    }

    &:hover {
      background-color: #b0d9fe;
    }
  `;

  return (
    <td className={'power-grid-cell ' + viewModel.rating + ' ' + styles} onClick={props.onClick} data-row={props.row} style={{transform: 'translate(' + props.x + 'px,' + props.y + 'px)', width: (props.width-2)+'px', height: props.height+'px'}}>
      {viewModel.value}
    </td>
  )
};

export default TextCell;