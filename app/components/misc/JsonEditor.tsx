/* eslint-disable no-prototype-builtins */
import { useEffect, useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react'
import Separator from '../ui/separator'
import { formatString } from '@/utils/format-string'

interface Labels {
  [key: string]: string
}

interface IProps {
  onChange: (val: string) => void
  currentData: string
  title: string
}

export default function JSONEditor({ onChange, currentData, title }: IProps) {
  const [labels, setLabels] = useState<Labels>(currentData ? JSON.parse(currentData) : {})

  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editKey, setEditKey] = useState('')
  const [editValue, setEditValue] = useState('')
  const [error, setError] = useState('')

  const addLabel = () => {
    if (!newKey.trim() || !newValue.trim()) {
      setError('Both key and value are required')
      return
    }

    if (labels.hasOwnProperty(newKey)) {
      setError('Key already exists')
      return
    }

    setLabels((prev) => ({ ...prev, [formatString('snake_case', newKey)]: newValue }))
    setNewKey('')
    setNewValue('')
    setError('')
  }

  const removeLabel = (key: string) => {
    setLabels((prev) => {
      const newLabels = { ...prev }
      delete newLabels[key]
      return newLabels
    })
  }

  const startEdit = (key: string) => {
    setEditingKey(key)
    setEditKey(key)
    setEditValue(labels[key])
    setError('')
  }

  const saveEdit = () => {
    if (!editKey.trim() || !editValue.trim()) {
      setError('Both key and value are required')
      return
    }

    if (editKey !== editingKey && labels.hasOwnProperty(editKey)) {
      setError('Key already exists')
      return
    }

    setLabels((prev) => {
      const newLabels = { ...prev }
      if (editKey !== editingKey) {
        delete newLabels[editingKey!]
      }
      newLabels[editKey] = editValue
      return newLabels
    })

    setEditingKey(null)
    setEditKey('')
    setEditValue('')
    setError('')
  }

  const cancelEdit = () => {
    setEditingKey(null)
    setEditKey('')
    setEditValue('')
    setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      action()
    }
  }

  useEffect(() => {
    onChange(JSON.stringify(labels))
  }, [labels])

  return (
    <Card className="shadow-none">
      <CardContent className="py-5">
        {/* Add new label form */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Key (e.g., app, version, my_name)"
                onKeyPress={(e) => handleKeyPress(e, addLabel)}
              />
            </div>
            <span className="text-muted-foreground">:</span>
            <div className="flex-1">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Value (e.g., frontend, 1.0.0, production)"
                onKeyPress={(e) => handleKeyPress(e, addLabel)}
              />
            </div>
            <Button onClick={addLabel} variant="outline" type="button" size="sm">
              <Plus />
              Add
            </Button>
          </div>
          {error && (
            <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">{error}</div>
          )}
        </div>

        <Separator className="mb-4" />

        {/* Display existing labels */}
        <div>
          {Object.keys(labels).length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              No {title} defined . Add your first {title} above.
            </div>
          ) : (
            <div className="grid gap-2">
              {Object.entries(labels).map(([key, value]) => (
                <Card key={key} className="shadow-none">
                  <CardContent className="flex items-center justify-between gap-3 p-2">
                    {editingKey === key ? (
                      // Edit mode
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          value={editKey}
                          onChange={(e) => setEditKey(e.target.value)}
                          placeholder="Key"
                          className="flex-1"
                          onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Value"
                          className="flex-1"
                          onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                        />
                      </div>
                    ) : (
                      // Display mode
                      <div className="flex flex-1 items-center gap-2 font-mono text-sm">
                        <Badge variant="secondary">{key}</Badge>
                        <span className="text-muted-foreground">:</span>
                        <span className="text-foreground">{value}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {editingKey === key ? (
                        <>
                          <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={saveEdit}
                            className="h-8 w-8 p-0">
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="h-8 w-8 p-0">
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={() => startEdit(key)}
                            className="h-8 w-8 p-0">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={() => removeLabel(key)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
