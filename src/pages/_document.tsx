import {createGetInitialProps} from '@mantine/next';
import Document, {Head, Html, Main, NextScript} from 'next/document';

const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html>
        <Head>
          <link rel="manifest" href="/manifest.json"/>
          <meta name="theme-color" content="#141517"/>
          <meta
            name="description"
            content="Fitness Time is a social media application in which users can form groups and organize events."
          />
        </Head>
        <body>
        <Main/>
        <NextScript/>
        </body>
      </Html>
    );
  }
}
