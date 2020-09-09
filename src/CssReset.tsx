import React from 'react';
import { Global } from '@emotion/core';

const CssReset: React.FC = () =>
  <Global styles={{
    'table, caption, tbody, tfoot, thead, tr, th, td': {
      margin: 0,
      padding: 0,
      border: 0,
      outline: 0,
      fontSize: '100%',
      verticalAlign: 'baseline',
      background: 'transparent',
      borderSpacing: 0,
    },
  }} />;
  
export default CssReset;
