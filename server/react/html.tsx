import React from 'react';
import * as ReactDOM from 'react-dom/server';
import {Entry} from 'client/entries/server';
import {Mode} from 'server/lib/mode';

const ReactScripts: React.FC<Pick<HTMLProps, 'mode'>> = ({mode}) => {
  if (mode === 'development') {
    return (
      <>
        <script
          crossOrigin="anonymous"
          src="https://unpkg.com/react@17/umd/react.development.js"
        ></script>
        <script
          crossOrigin="anonymous"
          src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"
        ></script>
      </>
    );
  }
  return (
    <>
      <script
        crossOrigin="anonymous"
        src="https://unpkg.com/react@17/umd/react.production.min.js"
      ></script>
      <script
        crossOrigin="anonymous"
        src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"
      ></script>
    </>
  );
};

type HTMLProps = {
  scripts: string[];
  location: string;
  mode: Mode;
};

const HTML: React.FC<HTMLProps> = (props) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link href="/favicon.ico" rel="shortcut icon" type="image/x-icon" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Hindi-Russian online dictionary" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
          integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2"
          crossOrigin="anonymous"
        />
        <title>HIN-RU</title>
      </head>
      <body>
        <div id="root">
          <Entry location={props.location} />
        </div>
        <p className="copyright">
          <a href="https://vk.com/hindi_2020_2021">мы ВКонтакте</a>
        </p>
        <noscript>
          You need to enable JavaScript to run this app. इस ऐप को चलाने के लिए
          आपको जावास्क्रिप्ट सक्षम करना होगा।. Вам нужно включить JavaScript,
          чтобы использовать это приложение.
        </noscript>
        <ReactScripts mode={props.mode} />
        <script
          crossOrigin="anonymous"
          src="https://kit.fontawesome.com/a4d42884ca.js"
        ></script>
        {props.scripts.map((script) => (
          <script key={script} src={script}></script>
        ))}
      </body>
    </html>
  );
};

export const renderApp = (props: HTMLProps): string => {
  return ReactDOM.renderToString(<HTML {...props} />);
};
