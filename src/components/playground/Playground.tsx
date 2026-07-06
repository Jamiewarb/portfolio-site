import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
  type SandpackFiles,
  type SandpackPredefinedTemplate,
  type SandpackProviderProps,
} from '@codesandbox/sandpack-react';
import { githubLight, nightOwl } from '@codesandbox/sandpack-themes';
import { useEffect, useState } from 'react';

export interface PlaygroundProps {
  files: SandpackFiles;
  template?: SandpackPredefinedTemplate;
  showConsole?: boolean;
  showTabs?: boolean;
  showLineNumbers?: boolean;
  showOpenInCodeSandbox?: boolean;
  editorHeight?: number | string;
  options?: SandpackProviderProps['options'];
  customSetup?: SandpackProviderProps['customSetup'];
}

// The site toggles a `.dark` class on <html> (see BaseHead.astro), so we mirror
// that into Sandpack's theme and keep it in sync when the user flips the toggle.
function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains('dark'));
    update();

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

interface PlaygroundInnerProps {
  showConsole: boolean;
  showTabs: boolean;
  showLineNumbers: boolean;
  showOpenInCodeSandbox: boolean;
  editorHeight: number | string;
}

function PlaygroundInner({
  showConsole,
  showTabs,
  showLineNumbers,
  showOpenInCodeSandbox,
  editorHeight,
}: PlaygroundInnerProps) {
  const { sandpack } = useSandpack();
  const [consoleOpen, setConsoleOpen] = useState(showConsole);

  return (
    <div className="playground not-prose">
      <div className="playground-toolbar">
        <button
          type="button"
          className="playground-button"
          aria-pressed={consoleOpen}
          onClick={() => setConsoleOpen((open) => !open)}
        >
          {consoleOpen ? 'Hide console' : 'Console'}
        </button>
        <button
          type="button"
          className="playground-button"
          onClick={() => sandpack.resetAllFiles()}
        >
          Reset
        </button>
      </div>

      <SandpackLayout>
        <SandpackCodeEditor
          showTabs={showTabs}
          showLineNumbers={showLineNumbers}
          style={{ height: editorHeight }}
        />
        <SandpackPreview
          showOpenInCodeSandbox={showOpenInCodeSandbox}
          style={{ height: editorHeight }}
        />
      </SandpackLayout>

      {consoleOpen ? <SandpackConsole /> : null}
    </div>
  );
}

export function Playground({
  files,
  template = 'react-ts',
  showConsole = false,
  showTabs = true,
  showLineNumbers = true,
  showOpenInCodeSandbox = true,
  editorHeight = 340,
  options,
  customSetup,
}: PlaygroundProps) {
  const isDark = useIsDark();

  return (
    <SandpackProvider
      template={template}
      files={files}
      theme={isDark ? nightOwl : githubLight}
      options={options}
      customSetup={customSetup}
    >
      <PlaygroundInner
        showConsole={showConsole}
        showTabs={showTabs}
        showLineNumbers={showLineNumbers}
        showOpenInCodeSandbox={showOpenInCodeSandbox}
        editorHeight={editorHeight}
      />
    </SandpackProvider>
  );
}

export default Playground;
