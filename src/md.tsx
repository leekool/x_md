import { Tweet } from './interfaces';
import { useEffect, useState } from 'react';
import { BoldItalicUnderlineToggles, codeBlockPlugin, codeMirrorPlugin, CodeToggle, CreateLink, diffSourcePlugin, DiffSourceToggleWrapper, headingsPlugin, imagePlugin, InsertCodeBlock, InsertFrontmatter, InsertTable, InsertThematicBreak, linkDialogPlugin, linkPlugin, listsPlugin, ListsToggle, markdownShortcutPlugin, MDXEditor, quotePlugin, Separator, StrikeThroughSupSubToggles, thematicBreakPlugin, toolbarPlugin, UndoRedo } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { EditorView } from '@codemirror/view';
import { frontmatterPlugin } from './frontmatter';

interface MdProps {
  tweet: Tweet;
}

const theme = EditorView.theme({
  "&": {
    color: "white",
    backgroundColor: "#034"
  },
  ".cm-content": {
    caretColor: "#0e9"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#0e9"
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "#074"
  },
  ".cm-gutters": {
    backgroundColor: "#045",
    color: "#ddd",
    border: "none"
  }
}, { dark: true });

const tweetToMd = (t: Tweet) => {
  console.log(t);
  let md = `---\n`
    + `author: "${t.userName}"\n`
    + `handle: "${t.displayName}"\n`
    + `date: "${t.createDate}"\n`
    + `---\n`
    + t.text;

  if (t.media?.length) {
    t.media.forEach((m) => {
      md += `\n<img alt="${m.url}" src="data:image/${m.file_type};base64, ${m.base64}" />`;
    })
  }

  return md;
}

export const Md = (props: MdProps) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!value) setValue(tweetToMd(props.tweet));
  }, []);

  return value ? (
    <div className="md-container">
      <MDXEditor
        className="dark-theme dark-editor"
        markdown={value}
        plugins={[
          frontmatterPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <DiffSourceToggleWrapper>
                  <UndoRedo />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <CodeToggle />
                  <Separator />
                  <StrikeThroughSupSubToggles />
                  <Separator />
                  <ListsToggle />
                  <Separator />
                  <CreateLink />
                  <InsertTable />
                  <InsertCodeBlock />
                  <InsertThematicBreak />
                  <Separator />
                  <InsertFrontmatter />
                </DiffSourceToggleWrapper>
              </>
            )
          }),
          listsPlugin(),
          quotePlugin(),
          headingsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          thematicBreakPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "md" }),
          diffSourcePlugin({
            diffMarkdown: value,
            viewMode: 'rich-text',
            codeMirrorExtensions: [theme],

          }),
          codeMirrorPlugin(),
          markdownShortcutPlugin(),
        ]}
      />
    </div>
  ) : null;
}
