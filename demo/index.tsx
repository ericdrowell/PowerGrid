import React from 'react';
import ReactDom from 'react-dom';
import { css, Global } from '@emotion/core';
import App from './App';

ReactDom.render(
  <>
    <Global
      styles={css`
        html, body {
          overscroll-behavior: none;
        }
      `}
    />
    <App />
  </>
  , document.getElementById('app')
);
