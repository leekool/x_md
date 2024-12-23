import * as Mdast from 'mdast'
import { $createFrontmatterNode } from './FrontmatterNode'
import { MdastImportVisitor } from '@mdxeditor/editor'

export const MdastFrontmatterVisitor: MdastImportVisitor<Mdast.YAML> = {
  testNode: 'yaml',
  visitNode({ mdastNode, actions }) {
    actions.addAndStepInto($createFrontmatterNode(mdastNode.value))
  }
}
