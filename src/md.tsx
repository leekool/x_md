import MDEditor from '@uiw/react-md-editor';
import { useState } from 'react';

export const Md = () => {
  const [value, setValue] = useState<string | undefined>("**Hello world!!!**");

  return (
    <div className="container">
      <MDEditor
        value={value}
        onChange={setValue}
      />
      {/* <MDEditor.Markdown source={value} style={{ whiteSpace: "pre-wrap" }} /> */}
    </div>
  );
}
