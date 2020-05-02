import {createGlobalStyle} from 'styled-components';

export default createGlobalStyle`
  html {
    --background: #2E3440;
    --foreground: #ECEFF4;
    --invalid: #B48EAD;
    --active: #A3BE8C;
    --disabled: #4C566A;
    --tint-1: #3B4252;
    --tint-2: #434C5E;
  }

  html, body {
    background: var(--background);
    color: var(--foreground);
    margin: 0;
    padding: 0;
    font-family: 'Sen', sans-serif;
  }

  h1 {
    font-weight: normal;
    font-size: 3rem;
    margin: 0 0 3rem;
  }
`;
