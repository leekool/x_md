import * as Mdast from 'mdast'
import { FrontmatterNode, $isFrontmatterNode } from './FrontmatterNode'
import { LexicalExportVisitor } from '@mdxeditor/editor'

export const LexicalFrontmatterVisitor: LexicalExportVisitor<FrontmatterNode, Mdast.YAML> = {
  testLexicalNode: $isFrontmatterNode,
  visitLexicalNode: ({ actions, lexicalNode }) => {
    actions.addAndStepInto('yaml', { value: lexicalNode.getYaml() })
  }
}
