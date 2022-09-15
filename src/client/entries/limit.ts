import { render } from 'preact';
import { html } from 'htm/preact';

import '../styles/pages/limit.pcss';

const parentSelector = '#container';
const parentEl = document.querySelector(parentSelector);

if (!parentEl) {
    throw new Error(`Unable to find element by selector: ${parentSelector}`);
}

const url = new URL(document.location.href);
const limit = url.searchParams.get('limit') || 'unknown';

render(html`
  <div>
      <div>Достигнут лимит максимального количества активных игроков: ${limit}</div>
      <div><a href="/login.html">Попробовать еще раз</a></div>
  </div>
`, parentEl);
