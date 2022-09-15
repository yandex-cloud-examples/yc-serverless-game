import { render } from 'preact';
import { html } from 'htm/preact';
import mainPic from '../assets/images/main-pic.jpg';

import '../styles/pages/login.pcss';

const parentSelector = '#container';
const parentEl = document.querySelector(parentSelector);

if (!parentEl) {
    throw new Error(`Unable to find element by selector: ${parentSelector}`);
}

render(html`
  <div id="header">
      <div id="header-text">
          <div id="row1">Serverless</div>
          <div id="row2">game</div>
      </div>
      <div id="header-img">
          <img src="${mainPic}" />
      </div>
  </div>
  <div id="login-widget">
      <script 
              async 
              src="https://telegram.org/js/telegram-widget.js?19" 
              data-telegram-login="serverless_game_bot" 
              data-size="large" 
              data-auth-url="/api/login" 
              data-request-access="write"
      ></script>
  </div>
  <div id="footer">© 2022 Yandex Cloud</div>
`, parentEl);
