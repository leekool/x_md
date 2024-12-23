import * as Mdast from 'mdast'
import { $createFrontmatterNode } from './FrontmatterNode'
import { MdastImportVisitor } from '@mdxeditor/editor'

export const MdastFrontmatterVisitor: MdastImportVisitor<Mdast.YAML> = {
  testNode: 'yaml',
  visitNode({ mdastNode, actions }) {
    console.log("visitNode: ", mdastNode);
    actions.addAndStepInto($createFrontmatterNode(mdastNode.value))
  }
}
