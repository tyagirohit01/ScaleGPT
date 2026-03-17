import { useState, useRef } from 'react'
import React from 'react'
import { useAppContext } from '../context/Appcontext'
import FilePreview from './FilePreview'
import axios from 'axios'

const TOOLS  = ['🌐 Web', '📎 Attach', '🎙 Voice', '🧠 Memory']
const MODELS = ['Scale Fast', 'Scale Pro', 'Scale Research', 'Scale Vision']

export default function ChatInput({ value, onChange, onSend, loading, selectedModel, onModelChange }) {
  const { token } = useAppContext()
  const [active, setActive]       = useState({ '🌐 Web': true })
  const [files, setFiles]         = useState([])
  const [uploading, setUploading] = useState(false)
  const taRef                     = useRef(null)
  const fileInputRef              = useRef(null)

  function fire() {
    const v = (value || '').trim()
    if (!v && files.length === 0) return
    if (loading || uploading) return
    onSend(v, files)
    setFiles([])
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  function onInput(e) {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 110) + 'px'
    onChange(el.value)
  }

  async function handleFileChange(e) {
    const selected = Array.from(e.target.files)
    if (!selected.length) return

    setUploading(true)
    const uploaded = []

    for (const file of selected) {
      // create local preview for images
      const preview = file.type.startsWith("image/")
        ? await new Promise(res => {
            const reader = new FileReader()
            reader.onload = ev => res(ev.target.result)
            reader.readAsDataURL(file)
          })
        : null

      try {
        const formData = new FormData()
        formData.append("file", file)
        const { data } = await axios.post("/api/upload/file", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        if (data.success) {
          uploaded.push({
            name:     file.name,
            type:     file.type,
            size:     file.size,
            url:      data.url,
            preview,
          })
        }
      } catch (err) {
        console.error("Upload failed:", err.message)
      }
    }

    setFiles(prev => [...prev, ...uploaded])
    setUploading(false)
    // reset input so same file can be re-selected
    e.target.value = ""
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  function handleToolClick(t) {
    if (t === '📎 Attach') {
      fileInputRef.current?.click()
      return
    }
    setActive(prev => ({ ...prev, [t]: !prev[t] }))
  }

  return (
    <div style={{
      padding: '10px 20px 14px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      flexShrink: 0, background: '#06060e',
    }}>

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.csv"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* file previews */}
      {files.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {files.map((f, i) => (
            <FilePreview key={i} file={f} onRemove={() => removeFile(i)} />
          ))}
        </div>
      )}

      {/* Tool toggles + model selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {TOOLS.map(t => (
          <button
            key={t}
            onClick={() => handleToolClick(t)}
            style={{
              fontSize: 11, fontWeight: 500,
              padding: '4px 10px', borderRadius: 6,
              display: 'flex', alignItems: 'center', gap: 4,
              cursor: 'pointer', transition: 'all .2s',
              background: active[t] ? 'rgba(165,112,247,.1)' : '#13131f',
              border: active[t]
                ? '1px solid rgba(165,112,247,.35)'
                : '1px solid rgba(255,255,255,0.06)',
              color: active[t] ? '#a370f7' : '#5a5a7a',
              position: 'relative',
            }}
            onMouseEnter={e => { if (!active[t]) e.currentTarget.style.color = '#f0f0ff' }}
            onMouseLeave={e => { if (!active[t]) e.currentTarget.style.color = '#5a5a7a' }}
          >
            {t}
            {/* uploading spinner on attach button */}
            {t === '📎 Attach' && uploading && (
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                border: '1.5px solid rgba(163,112,247,0.3)',
                borderTopColor: '#a370f7',
                animation: 'spin .7s linear infinite',
                marginLeft: 2,
              }}/>
            )}
            {/* file count badge */}
            {t === '📎 Attach' && files.length > 0 && !uploading && (
              <span style={{
                width: 14, height: 14, borderRadius: '50%',
                background: '#a370f7', color: '#fff',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginLeft: 2,
              }}>{files.length}</span>
            )}
          </button>
        ))}

        {/* Model selector */}
        <div style={{ marginLeft: 'auto' }}>
          <select
            value={selectedModel}
            onChange={e => onModelChange(e.target.value)}
            style={{
              background: 'rgba(123,94,167,0.1)',
              border: '1px solid rgba(163,112,247,0.3)',
              borderRadius: 6, color: '#a370f7',
              fontFamily: "'Outfit', sans-serif",
              fontSize: 16, fontWeight: 600,
              padding: '4px 24px 4px 10px',
              outline: 'none', cursor: 'pointer', appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%23a370f7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            {MODELS.map(m => (
              <option key={m} value={m} style={{ background: '#13131f', color: '#f0f0ff' }}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Input box */}
      <div
        style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          background: '#13131f',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: '9px 10px',
          transition: 'border-color .2s',
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'rgba(165,112,247,0.45)'}
        onBlur={e  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
      >
        <textarea
          ref={taRef}
          value={value}
          onChange={onInput}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              fire()
            }
          }}
          placeholder={files.length > 0 ? "Add a message about your files…" : "Ask a follow-up…"}
          rows={1}
          disabled={loading || uploading}
          style={{
            flex: 1, background: 'none', border: 'none',
            color: '#f0f0ff', fontSize: 16, outline: 'none',
            minHeight: 20, maxHeight: 110,
            lineHeight: 1.6, resize: 'none',
            fontFamily: "'Outfit', sans-serif",
            opacity: loading || uploading ? 0.5 : 1,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: '#5a5a7a', fontFamily: 'Space Mono, monospace' }}>
            {Math.round((value || '').length / 4)}/4k
          </span>
          <button
            onClick={fire}
            disabled={loading || uploading}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: loading || uploading
                ? 'rgba(123,94,167,0.4)'
                : 'linear-gradient(135deg,#7b5ea7,#f067a6)',
              border: 'none',
              cursor: loading || uploading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'opacity .2s',
            }}
            onMouseEnter={e => { if (!loading && !uploading) e.currentTarget.style.opacity = '.8' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            {loading || uploading ? (
              <div style={{
                width: 13, height: 13, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                animation: 'spin .7s linear infinite',
              }}/>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: '#5a5a7a' }}>↵ Send · Shift+↵ new line</span>
        <span style={{ fontSize: 10, color: '#5a5a7a' }}>ScaleGPT may make mistakes</span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}