import { Tweet } from './interfaces';
import { useEffect, useState } from 'react';
import { BoldItalicUnderlineToggles, CodeToggle, CreateLink, diffSourcePlugin, DiffSourceToggleWrapper, headingsPlugin, imagePlugin, InsertTable, InsertThematicBreak, linkDialogPlugin, linkPlugin, listsPlugin, ListsToggle, markdownShortcutPlugin, MDXEditor, quotePlugin, Separator, StrikeThroughSupSubToggles, tablePlugin, thematicBreakPlugin, toolbarPlugin, UndoRedo } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { EditorView } from '@codemirror/view';
import { frontmatterPlugin } from './frontmatter';

interface MdProps {
  tweet: Tweet;
}

const theme = EditorView.theme({
  "&": {
    color: "#fff",
    backgroundColor: "#000"
  },
  ".cm-content": {
    caretColor: "#fff"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#fff"
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "#111"
  },
  ".cm-gutters": {
    backgroundColor: "#111",
    color: "#ddd",
    border: "none"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#0a0a0a",
    color: "#ddd",
    border: "none"
  },
}, { dark: true });

const tweetToMd = (t: Tweet): string => {
  /* todo: re-implement when frontmatter plugin done */
  // let md = `---\n`
  //   + `author: "${t.userName}"\n`
  //   + `handle: "${t.displayName}"\n`
  //   + `date: "${t.createDate}"\n`
  //   + `---\n`
  //   + t.text;

  let md = `author: "${t.userName}"\n`
    + `handle: "${t.displayName}"\n`
    + `date: "${t.createDate}"\n&NewLine;` // fixes quote block line break issue
    + t.text;

  if (t.media?.length) {
    t.media.forEach((m) => {
      md += `\n<img alt="${m.url}" src="data:image/${m.fileType};base64, ${m.base64}" />`;
    })
  }

  if (t.quote) {
    let quoteMd = tweetToMd(t.quote);
    quoteMd = "\n> " + quoteMd.replace(/(\n)+/g, `\n> `);

    md += quoteMd;
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
        className="dark-theme dark-editor md-editor"
        contentEditableClassName="prose"
        markdown={value}
        plugins={[
          frontmatterPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <DiffSourceToggleWrapper>
                  <div className="left">
                    <UndoRedo />
                    <Separator />
                    <BoldItalicUnderlineToggles />
                    <CodeToggle />
                    <Separator />
                    <StrikeThroughSupSubToggles />
                    <Separator />
                    <InsertTable />
                  </div>
                  {/* <ListsToggle /> */}
                  {/* <CreateLink /> */}
                  {/* <InsertCodeBlock /> */}
                  {/* <InsertThematicBreak /> */}
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
          tablePlugin(),
          thematicBreakPlugin(),
          // codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
          // codeMirrorPlugin({ codeBlockLanguages: { txt: "text" } }),
          diffSourcePlugin({
            diffMarkdown: value,
            viewMode: 'rich-text',
            codeMirrorExtensions: [theme],
          }),
          markdownShortcutPlugin(),
        ]}
      />
    </div>
  ) : null;
}
