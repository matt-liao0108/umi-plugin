import React,{Suspense} from 'react';
import { get } from 'lodash';
import { message, Button,Spin } from 'antd';

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

{{=<% %>=}}
const defaultFallback = (
  <Spin
    style={{
      padding: '6px',
    }}
    spinning={true}
    size="small"
  />
);
<%={{ }}=%>

const ThemeProvider = (props)=>{
  return <Suspense fallback={props.fallback || defaultFallback}>
  {props.children}
  </Suspense>
}

export function rootContainer(container) {
  return React.createElement(ThemeProvider, null, container);
}