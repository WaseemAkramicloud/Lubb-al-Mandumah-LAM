"use client"

import { useState, useEffect } from 'react'
import { MODULE_DEFINITIONS, ROLE_TEMPLATES, ModuleName, PermissionAction, StaffPermissions } from '@/lib/auth/permission-constants'

interface Props {
  initialPermissions?: StaffPermissions
  onPermissionsChange: (permissions: StaffPermissions) => void
}

export default function PermissionBuilder({ initialPermissions = {}, onPermissionsChange }: Props) {
  const [permissions, setPermissions] = useState<StaffPermissions>(initialPermissions)
  const [draggedModule, setDraggedModule] = useState<ModuleName | null>(null)

  const availableModules = (Object.keys(MODULE_DEFINITIONS) as ModuleName[]).filter(m => !permissions[m])
  const assignedModules = (Object.keys(MODULE_DEFINITIONS) as ModuleName[]).filter(m => permissions[m])

  // Sync to parent
  useEffect(() => {
    onPermissionsChange(permissions)
  }, [permissions, onPermissionsChange])

  const handleDragStart = (e: React.DragEvent, module: ModuleName) => {
    setDraggedModule(module)
    e.dataTransfer.setData('text/plain', module)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropToAssigned = (e: React.DragEvent) => {
    e.preventDefault()
    const moduleName = e.dataTransfer.getData('text/plain') as ModuleName
    if (moduleName && !permissions[moduleName]) {
      addModule(moduleName)
    }
    setDraggedModule(null)
  }

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault()
    const moduleName = e.dataTransfer.getData('text/plain') as ModuleName
    if (moduleName && permissions[moduleName]) {
      removeModule(moduleName)
    }
    setDraggedModule(null)
  }

  const addModule = (module: ModuleName) => {
    setPermissions(prev => ({
      ...prev,
      // Default to ['view'] when added
      [module]: ['view']
    }))
  }

  const removeModule = (module: ModuleName) => {
    setPermissions(prev => {
      const next = { ...prev }
      delete next[module]
      return next
    })
  }

  const toggleAction = (module: ModuleName, action: PermissionAction) => {
    setPermissions(prev => {
      const currentActions = prev[module] || []
      const hasAction = currentActions.includes(action)
      
      let nextActions = hasAction 
        ? currentActions.filter(a => a !== action)
        : [...currentActions, action]
        
      // Ensure 'view' is always there if they have any other actions
      if (action !== 'view' && !hasAction && !nextActions.includes('view')) {
        nextActions.push('view')
      }
      // If they uncheck 'view', maybe clear everything or just let them? Usually view is base.
      if (action === 'view' && hasAction) {
        nextActions = [] // Remove all if they can't even view
      }

      if (nextActions.length === 0) {
        const next = { ...prev }
        delete next[module]
        return next
      }

      return {
        ...prev,
        [module]: nextActions
      }
    })
  }

  const applyTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateKey = e.target.value
    if (templateKey && ROLE_TEMPLATES[templateKey]) {
      setPermissions(ROLE_TEMPLATES[templateKey].permissions)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Template Selector */}
      <div style={{ background: 'var(--lam-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--lam-border)' }}>
        <label className="form-label" style={{ marginBottom: '0.5rem' }}>Start from a Role Template</label>
        <select className="form-input" onChange={applyTemplate} defaultValue="">
          <option value="" disabled>Select a template to auto-fill...</option>
          {Object.entries(ROLE_TEMPLATES).map(([key, template]) => (
            <option key={key} value={key}>{template.label}</option>
          ))}
        </select>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', marginTop: '0.5rem' }}>
          Applying a template will overwrite current selections. You can still customize afterwards.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Available Modules Panel */}
        <div 
          style={{ flex: 1, background: 'var(--lam-black)', border: '1px solid var(--lam-border)', borderRadius: 'var(--radius-sm)', minHeight: '300px' }}
          onDragOver={handleDragOver}
          onDrop={handleDropToAvailable}
        >
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--lam-border)', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-silver)', margin: 0 }}>Available Modules</h3>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {availableModules.length === 0 && (
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textAlign: 'center', padding: '2rem 0' }}>
                All modules assigned.
              </div>
            )}
            {availableModules.map(module => (
              <div 
                key={module}
                draggable
                onDragStart={(e) => handleDragStart(e, module)}
                style={{
                  padding: '0.75rem',
                  background: 'var(--lam-surface)',
                  border: '1px dashed var(--lam-border)',
                  borderRadius: '4px',
                  cursor: 'grab',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'var(--text-sm)',
                  opacity: draggedModule === module ? 0.5 : 1
                }}
              >
                <span>{MODULE_DEFINITIONS[module].label}</span>
                <button type="button" onClick={() => addModule(module)} style={{ background: 'none', border: 'none', color: 'var(--lam-gold)', cursor: 'pointer', fontSize: '1.2rem' }}>
                  +
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Modules Panel */}
        <div 
          style={{ flex: 1, background: 'rgba(201, 168, 76, 0.05)', border: '1px solid var(--lam-gold)', borderRadius: 'var(--radius-sm)', minHeight: '300px' }}
          onDragOver={handleDragOver}
          onDrop={handleDropToAssigned}
        >
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--lam-border)', background: 'rgba(201, 168, 76, 0.1)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-white)', margin: 0 }}>User Access</h3>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignedModules.length === 0 && (
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textAlign: 'center', padding: '2rem 0' }}>
                Drag modules here to grant access.
              </div>
            )}
            {assignedModules.map(module => (
              <div 
                key={module}
                draggable
                onDragStart={(e) => handleDragStart(e, module)}
                style={{
                  background: 'var(--lam-gunmetal)',
                  border: '1px solid var(--lam-border)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  opacity: draggedModule === module ? 0.5 : 1
                }}
              >
                <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--lam-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab', background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--lam-white)' }}>
                    {MODULE_DEFINITIONS[module].label}
                  </span>
                  <button type="button" onClick={() => removeModule(module)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1rem' }}>
                    ✕
                  </button>
                </div>
                <div style={{ padding: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {MODULE_DEFINITIONS[module].actions.map(action => {
                    const isChecked = permissions[module]?.includes(action)
                    return (
                      <label key={action} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', color: isChecked ? 'var(--lam-white)' : 'var(--lam-silver-dim)', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked || false}
                          onChange={() => toggleAction(module, action)}
                          style={{ accentColor: 'var(--lam-gold)' }}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{action.replace('_', ' ')}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
