import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Page() {
  const codeString = `
  // 1) any 사용
  function removeSpaces<T>(text: T): T extends string ? : string : undefined {
    if (typeof text === 'string') {
      return text.replaceAll(" ", "") as any;
    } else {
      return undefined as any;
    }
  }
   
  // 2) 함수 오버로딩 사용
  function removeSpaces<T>(text: T): T extends string ? : string : undefined
  function removeSpaces (text: any) {
    if (typeof text === 'string') {
      return text.replaceAll(" ", "");
    } else {
      return undefined;
    }
  }
  `;
  return (
    <SyntaxHighlighter
      language="typescript"
      style={dracula}
      showLineNumbers={true}
      wrapLongLines={true}
    >
      {codeString}
    </SyntaxHighlighter>
  );
}
