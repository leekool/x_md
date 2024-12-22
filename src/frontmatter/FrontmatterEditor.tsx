import * as Dialog from '@radix-ui/react-dialog'
import classNames from 'classnames'
import YamlParser from 'js-yaml'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { frontmatterDialogOpen$, removeFrontmatter$ } from '.'
// import styles from '@mdxeditor/editor/dist/styles/ui.module.css'
import { editorRootElementRef$, iconComponentFor$, readOnly$, useTranslation } from '@mdxeditor/editor'
import { useCellValues, usePublisher } from '@mdxeditor/gurx'

type YamlConfig = { key: string; value: string }[]

export interface FrontmatterEditorProps {
  yaml: string
  onChange: (yaml: string) => void
}

const styles = {
  dialogOverlay: "_dialogOverlay_uazmk_871",
  dialogTitle: "_dialogTitle_uazmk_624",
  dialogCloseButton: "_dialogCloseButton_uazmk_630",
  largeDialogContent: "_largeDialogContent_uazmk_614",
  propertyEditorTable: "_propertyEditorTable_uazmk_438",
  propertyEditorInput: "_propertyEditorInput_uazmk_480",
  iconButton: "_iconButton_uazmk_456",
  primaryButton: "_primaryButton_uazmk_506",
  secondaryButton: "_secondaryButton_uazmk_507",
  smallButton: "_smallButton_uazmk_522",
};

export const FrontmatterEditor = ({ yaml, onChange }: FrontmatterEditorProps) => {
  const [readOnly, editorRootElementRef, iconComponentFor, frontmatterDialogOpen] = useCellValues(
    readOnly$,
    editorRootElementRef$,
    iconComponentFor$,
    frontmatterDialogOpen$
  )
  const t = useTranslation()
  const setFrontmatterDialogOpen = usePublisher(frontmatterDialogOpen$)
  const removeFrontmatter = usePublisher(removeFrontmatter$)
  const yamlConfig = React.useMemo<YamlConfig>(() => {
    if (!yaml) {
      return []
    }
    return Object.entries(YamlParser.load(yaml) as Record<string, string>).map(([key, value]) => ({ key, value }))
  }, [yaml])

  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      yamlConfig
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'yamlConfig'
  })

  const onSubmit = React.useCallback(
    ({ yamlConfig }: { yamlConfig: YamlConfig }) => {
      if (yamlConfig.length === 0) {
        removeFrontmatter()
        setFrontmatterDialogOpen(false)
        return
      }
      const yaml = yamlConfig.reduce<Record<string, string>>((acc, { key, value }) => {
        if (key && value) {
          acc[key] = value
        }
        return acc
      }, {})
      onChange(YamlParser.dump(yaml).trim())
      setFrontmatterDialogOpen(false)
    },
    [onChange, setFrontmatterDialogOpen, removeFrontmatter]
  )

  return (
    <>
      <Dialog.Root
        open={frontmatterDialogOpen}
        onOpenChange={(open) => {
          setFrontmatterDialogOpen(open)
        }}
      >
        <Dialog.Portal container={editorRootElementRef?.current}>
          <Dialog.Overlay className={styles.dialogOverlay} />
          <Dialog.Content className={styles.largeDialogContent} data-editor-type="frontmatter">
            <Dialog.Title className={styles.dialogTitle}>{t('frontmatterEditor.title', 'Edit document frontmatter')}</Dialog.Title>
            <form
              onSubmit={(e) => {
                void handleSubmit(onSubmit)(e)
                e.stopPropagation()
              }}
              onReset={(e) => {
                e.stopPropagation()
                setFrontmatterDialogOpen(false)
              }}
            >
              <table className={styles.propertyEditorTable}>
                <colgroup>
                  <col />
                  <col />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th>{t('frontmatterEditor.key', 'Key')}</th>
                    <th>{t('frontmatterEditor.value', 'Value')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((item, index) => {
                    return (
                      <tr key={item.id}>
                        <td>
                          <TableInput {...register(`yamlConfig.${index}.key`, { required: true })} autofocusIfEmpty readOnly={readOnly} />
                        </td>
                        <td>
                          <TableInput {...register(`yamlConfig.${index}.value`, { required: true })} readOnly={readOnly} />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              remove(index)
                            }}
                            className={styles.iconButton}
                            disabled={readOnly}
                          >
                            {iconComponentFor('delete_big')}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td>
                      <button
                        disabled={readOnly}
                        className={classNames(styles.primaryButton, styles.smallButton)}
                        type="button"
                        onClick={() => {
                          append({ key: '', value: '' })
                        }}
                      >
                        {t('frontmatterEditor.addEntry', 'Add entry')}
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' }}>
                <button type="submit" className={styles.primaryButton}>
                  {t('dialogControls.save', 'Save')}
                </button>
                <button type="reset" className={styles.secondaryButton}>
                  {t('dialogControls.cancel', 'Cancel')}
                </button>
              </div>
            </form>
            <Dialog.Close asChild>
              <button className={styles.dialogCloseButton} aria-label={t('dialogControls.cancel', 'Cancel')}>
                {iconComponentFor('close')}
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

const TableInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { autofocusIfEmpty?: boolean; autoFocus?: boolean; value?: string }
>(({ className, autofocusIfEmpty: _, ...props }, ref) => {
  return <input className={classNames(styles.propertyEditorInput, className)} {...props} ref={ref} />
})
