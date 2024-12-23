import { Action, Cell, withLatestFrom } from '@mdxeditor/gurx'
import {
  $getRoot,
  // $getSelection,
  // $isRangeSelection,
  // $isTextNode,
  // COMMAND_PRIORITY_CRITICAL,
  // ElementNode,
  // KEY_DOWN_COMMAND,
  // LexicalEditor
} from 'lexical'
import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter'
import { frontmatter } from 'micromark-extension-frontmatter'
import { $createFrontmatterNode, $isFrontmatterNode, FrontmatterNode } from './FrontmatterNode'
import { LexicalFrontmatterVisitor } from './LexicalFrontmatterVisitor'
import { MdastFrontmatterVisitor } from './MdastFrontmatterVisitor'
import { addExportVisitor$, addImportVisitor$, addLexicalNode$, addMdastExtension$, addSyntaxExtension$, addToMarkdownExtension$, createRootEditorSubscription$, realmPlugin, rootEditor$ } from '@mdxeditor/editor'
export * from './FrontmatterNode'

/**
 * Whether the frontmatter dialog is open.
 * @group Frontmatter
 */
export const frontmatterDialogOpen$ = Cell(false)

/**
 * Inserts a frontmatter node at the beginning of the markdown document.
 * @group Frontmatter
 */
export const insertFrontmatter$ = Action((r) => {
  r.sub(r.pipe(insertFrontmatter$, withLatestFrom(rootEditor$)), ([, rootEditor]) => {
    rootEditor?.update(() => {
      const firstItem = $getRoot().getFirstChild()
      if (!$isFrontmatterNode(firstItem)) {
        const fmNode = $createFrontmatterNode('"": ""')
        if (firstItem) {
          firstItem.insertBefore(fmNode)
        } else {
          $getRoot().append(fmNode)
        }
      }
    })
    r.pub(frontmatterDialogOpen$, true)
  })
})

/**
 * Removes the frontmatter node from the markdown document.
 * @group Frontmatter
 */
export const removeFrontmatter$ = Action((r) => {
  r.sub(r.pipe(removeFrontmatter$, withLatestFrom(rootEditor$)), ([, rootEditor]) => {
    rootEditor?.update(() => {
      const firstItem = $getRoot().getFirstChild()
      if ($isFrontmatterNode(firstItem)) {
        firstItem.remove()
      }
    })
    r.pub(frontmatterDialogOpen$, false)
  })
})

/**
 * Whether the markdown document has a frontmatter node.
 * @group Frontmatter
 */
export const hasFrontmatter$ = Cell(false, (r) => {
  r.pub(createRootEditorSubscription$, (rootEditor) => {
    return rootEditor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        r.pub(hasFrontmatter$, $isFrontmatterNode($getRoot().getFirstChild()))
      })
    })
  })
})

/**
 * A plugin that adds support for frontmatter.
 * @group Frontmatter
 */
export const frontmatterPlugin = realmPlugin({
  init: (realm) => {
    realm.pubIn({
      [addMdastExtension$]: frontmatterFromMarkdown('yaml'),
      [addSyntaxExtension$]: frontmatter(),
      [addLexicalNode$]: FrontmatterNode,
      [addImportVisitor$]: MdastFrontmatterVisitor,
      [addExportVisitor$]: LexicalFrontmatterVisitor,
      [addToMarkdownExtension$]: frontmatterToMarkdown('yaml'),
    //   [createRootEditorSubscription$]: (editor: LexicalEditor) => {
    //     return editor.registerCommand<KeyboardEvent>(KEY_DOWN_COMMAND, (event) => {
    //       console.log("KEY_DOWN_COMMAND", event);
    //       let shouldPrevent = false;
    //
    //       editor.read(() => {
    //         const selection = $getSelection();
    //         console.log("selection: ", selection);
    //
    //         if ($isRangeSelection(selection)) {
    //           if (selection.isCollapsed() && selection.anchor.offset === 0 && selection.focus.offset === 0 && event.key === 'Backspace') {
    //             let node = selection.getNodes()[0] as ElementNode | null
    //             if ($isTextNode(node)) {
    //               node = node.getParent()
    //             }
    //             const prevSibling = node?.getPreviousSibling()
    //             if ($isFrontmatterNode(prevSibling)) {
    //               shouldPrevent = true
    //               event.preventDefault()
    //             }
    //           } else {
    //             const firstNode = selection.getNodes()[0]
    //             if ($isFrontmatterNode(firstNode)) {
    //               const yaml = firstNode.getYaml()
    //               setTimeout(() => {
    //                 editor.update(
    //                   () => {
    //                     const firstItem = $getRoot().getFirstChild()
    //                     if (!$isFrontmatterNode(firstItem)) {
    //                       $getRoot().splice(0, 0, [$createFrontmatterNode(yaml)])
    //                     }
    //                   },
    //                   { discrete: true }
    //                 )
    //               })
    //             }
    //           }
    //         }
    //       })
    //
    //       // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    //       if (shouldPrevent) {
    //         return true
    //       }
    //
    //       return false
    //     },
    //       COMMAND_PRIORITY_CRITICAL
    //     )
    //   }
    })
  }
})
