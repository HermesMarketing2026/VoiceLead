'use client'
import { useState, useRef, useEffect } from 'react'

interface Messaggio {
  role: 'user' | 'assistant'
  content: string
}

export default function HermesAI() {
  const [aperto, setAperto] = useState(false)
  const [messaggi, setMessaggi] = useState<Messaggio[]>([])
  const [input, setInput] = useState('')
  const [caricamento, setCaricamento] = useState(false)
  const [registrazione, setRegistrazione] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messaggi, caricamento])

  useEffect(() => {
    if (aperto && messaggi.length === 0) {
      setMessaggi([{
        role: 'assistant',
        content: 'Ciao! 👋 Sono Hermes AI, il tuo assistente su VoiceLeads. Come posso aiutarti?',
      }])
    }
  }, [aperto])

  const invia = async (testo: string) => {
    if (!testo.trim() || caricamento) return
    const nuoviMsg: Messaggio[] = [...messaggi, { role: 'user', content: testo.trim() }]
    setMessaggi(nuoviMsg)
    setInput('')
    setCaricamento(true)

    // Placeholder risposta
    setMessaggi(m => [...m, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/hermes-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nuoviMsg }),
      })

      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let risposta = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        risposta += decoder.decode(value, { stream: true })
        const testo = risposta
        setMessaggi(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: testo } : msg))
      }
    } catch {
      setMessaggi(m => m.map((msg, i) => i === m.length - 1
        ? { ...msg, content: 'Si è verificato un errore. Riprova o scrivi a info@hermesmarketing.it' }
        : msg))
    } finally {
      setCaricamento(false)
    }
  }

  const avviaRegistrazione = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' })
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mr.mimeType })
        const form = new FormData()
        form.append('file', blob, 'audio.webm')
        form.append('model', 'whisper-1')
        form.append('language', 'it')
        try {
          const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY ?? ''}` },
            body: form,
          })
          // Fallback: usa Web Speech API se non c'è OpenAI
          if (!res.ok) throw new Error('no openai')
          const data = await res.json()
          if (data.text) invia(data.text)
        } catch {
          // Niente OpenAI — usa il testo già nell'input se c'è
        }
      }
      mr.start()
      mediaRef.current = mr
      setRegistrazione(true)
    } catch {
      alert('Permesso microfono negato.')
    }
  }

  const fermaRegistrazione = () => {
    mediaRef.current?.stop()
    mediaRef.current = null
    setRegistrazione(false)
  }

  const usaWebSpeech = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return false
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'it-IT'
    rec.interimResults = false
    rec.onresult = (e: any) => {
      const testo = e.results[0][0].transcript
      invia(testo)
    }
    rec.onerror = () => setRegistrazione(false)
    rec.onend = () => setRegistrazione(false)
    rec.start()
    setRegistrazione(true)
    return true
  }

  const toggleMicrofono = () => {
    if (registrazione) {
      fermaRegistrazione()
      return
    }
    // Prova Web Speech API prima (nessuna chiave necessaria)
    if (!usaWebSpeech()) {
      avviaRegistrazione()
    }
  }

  return (
    <>
      {/* Pulsante fluttuante */}
      <button
        onClick={() => setAperto(o => !o)}
        className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)', boxShadow: '0 4px 24px rgba(255,121,48,0.5)' }}
        aria-label="Hermes AI"
      >
        {aperto
          ? <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          : <span className="text-2xl">✨</span>
        }
      </button>

      {/* Pannello chat */}
      {aperto && (
        <div className="fixed bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10"
          style={{ background: '#111', maxHeight: '70vh' }}>

          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10"
            style={{ background: 'linear-gradient(135deg, #1a0a00, #2d1200)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
              style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>✨</div>
            <div>
              <p className="text-sm font-extrabold text-white">Hermes AI</p>
              <p className="text-xs text-white/40">Assistente VoiceLeads</p>
            </div>
            <button onClick={() => { setMessaggi([]); setAperto(false) }}
              className="ml-auto text-white/30 hover:text-white/60 transition-colors text-xs">
              Chiudi
            </button>
          </div>

          {/* Messaggi */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messaggi.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'text-white rounded-br-sm'
                    : 'text-white/90 rounded-bl-sm border border-white/10'
                }`}
                  style={m.role === 'user'
                    ? { background: 'linear-gradient(135deg, #ff7930, #ff4500)' }
                    : { background: '#1e1e1e' }}>
                  {m.content || (caricamento && i === messaggi.length - 1
                    ? <span className="flex gap-1 py-1">{[0,1,2].map(j => <span key={j} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />)}</span>
                    : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/10 flex items-end gap-2" style={{ background: '#111' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); invia(input) } }}
              placeholder="Scrivi o usa il microfono…"
              rows={1}
              disabled={caricamento}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-hermes-400 resize-none leading-5 disabled:opacity-50"
              style={{ maxHeight: 100 }}
            />
            <button
              onClick={toggleMicrofono}
              disabled={caricamento}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40 ${
                registrazione
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6.5 9a.5.5 0 0 1 1 0A7.5 7.5 0 0 1 12.5 17.5V20h2a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1h2v-2.5A7.5 7.5 0 0 1 5.5 10a.5.5 0 0 1 1 0 6.5 6.5 0 0 0 13 0z"/>
              </svg>
            </button>
            <button
              onClick={() => invia(input)}
              disabled={!input.trim() || caricamento}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40 hover:opacity-80"
              style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
