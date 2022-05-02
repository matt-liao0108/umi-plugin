import React from 'react';
import { get } from 'lodash';
import { message, Button } from 'antd';

const version = {{version}};

(() => {
  const HTML_COMMENT_REGEXP = /<--([\d\D]*?)-->/g;
  const getHTMLContent = () => fetch('/').then((resp) => resp.text());
  const checkHTML = async () => {
    const content = await getHTMLContent();
    const comment = get(content.match(HTML_COMMENT_REGEXP), 0, '');
    if (!comment.includes(`${version}`)) {
      message.warning(
        <>
          发现新的版本!
          <Button onClick={() => location.reload()} type="link" size="small">
            立即刷新
          </Button>
        </>,
        0,
      );
    } else {
      setTimeout(checkHTML, 1000);
    }
  };
  if({{checkHTMLVersions}}){
      checkHTML()
  }
})();

const ThemeProvider = (props)=>{
  return <div>
  {props.children}
  </div>
}

export function rootContainer(container) {
  return React.createElement(ThemeProvider, null, container);
}