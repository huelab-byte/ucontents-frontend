"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, PlayIcon, PauseIcon, SearchIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface VoiceTtsSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  stepNumber?: number
  isLastStep?: boolean
}

interface Voice {
  id: string
  name: string
  description: string
  provider: string
}

export function VoiceTtsSection({
  isOpen,
  onOpenChange,
  stepNumber = 6,
  isLastStep = false,
}: VoiceTtsSectionProps) {
  const [enableAIVoice, setEnableAIVoice] = React.useState(true)
  const [voiceSpeed, setVoiceSpeed] = React.useState(0)
  const [voicePitch, setVoicePitch] = React.useState(0)
  const [ttsModel, setTtsModel] = React.useState("elevenlabs-audio")
  const [selectedVoice, setSelectedVoice] = React.useState("bill")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [playingVoice, setPlayingVoice] = React.useState<string | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const voices: Voice[] = [
    { id: "bill", name: "Bill", description: "Professional, authoritative", provider: "ElevenLabs" },
    { id: "brian", name: "Brian", description: "Warm, conversational", provider: "ElevenLabs" },
    { id: "callum", name: "Callum", description: "British accent, sophisticated", provider: "ElevenLabs" },
    { id: "charlie", name: "Charlie", description: "Youthful, energetic", provider: "ElevenLabs" },
    { id: "dave", name: "Dave", description: "Deep, resonant", provider: "ElevenLabs" },
    { id: "emily", name: "Emily", description: "Clear, friendly", provider: "ElevenLabs" },
    { id: "frank", name: "Frank", description: "Mature, confident", provider: "ElevenLabs" },
    { id: "george", name: "George", description: "Calm, reassuring", provider: "ElevenLabs" },
  ]

  const filteredVoices = voices.filter((voice) =>
    voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voice.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePlayVoice = (voiceId: string) => {
    // If clicking the same voice, toggle pause/play
    if (playingVoice === voiceId && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
        setPlayingVoice(null)
      }
      return
    }

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // For demo purposes, we'll just set the playing state
    // In production, you would load and play the actual voice sample
    setPlayingVoice(voiceId)
    
    // TODO: Load and play actual voice sample from your API
    // const audio = new Audio(`/api/voices/${voiceId}/preview`)
    // audio.volume = 1
    // audioRef.current = audio
    // audio.play().catch(console.error)
  }

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isLastStep && (
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border -z-10" />
      )}
      
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                {/* Step Number Circle */}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 font-semibold text-sm",
                  isOpen
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted-foreground text-muted-foreground"
                )}>
                  {stepNumber}
                </div>
                <div className="flex items-center justify-between flex-1">
                  <CardTitle className="text-base">
                    Step {stepNumber}: Voice & TTS Options
                  </CardTitle>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className={cn("size-4 transition-transform", isOpen && "rotate-180")}
                  />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Toggle Button */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <Label className="text-sm font-medium">Enable AI Voice Generation</Label>
              <Button
                variant={enableAIVoice ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setEnableAIVoice(!enableAIVoice)
                }}
                className="min-w-[80px]"
              >
                {enableAIVoice ? "Turn Off" : "Turn On"}
              </Button>
            </div>

            {enableAIVoice && (
              <FieldGroup className="gap-4">

              {/* Adjust Voice Speed */}
              <Field>
                <FieldLabel>
                  <Label>Adjust Voice Speed:</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={voiceSpeed}
                        onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${voiceSpeed}%, hsl(var(--muted)) ${voiceSpeed}%, hsl(var(--muted)) 100%)`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground min-w-[50px] text-right">
                      {voiceSpeed}%
                    </span>
                  </div>
                </FieldContent>
              </Field>

              {/* Voice Pitch */}
              <Field>
                <FieldLabel>
                  <Label>Voice Pitch:</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={voicePitch}
                        onChange={(e) => setVoicePitch(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${voicePitch}%, hsl(var(--muted)) ${voicePitch}%, hsl(var(--muted)) 100%)`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground min-w-[50px] text-right">
                      {voicePitch}%
                    </span>
                  </div>
                </FieldContent>
              </Field>

              {/* TTS Model */}
              <Field orientation="horizontal" className="flex-col">
                <FieldLabel>
                  <Label>TTS Model</Label>
                </FieldLabel>
                <FieldContent>
                  <Select value={ttsModel} onValueChange={(value) => setTtsModel(value || "elevenlabs-audio")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select TTS model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elevenlabs-audio">
                        ElevenLabs Audio (FacelessClipAI API)
                      </SelectItem>
                      <SelectItem value="openai-tts">OpenAI TTS</SelectItem>
                      <SelectItem value="google-tts">Google Cloud TTS</SelectItem>
                      <SelectItem value="amazon-polly">Amazon Polly</SelectItem>
                      <SelectItem value="azure-tts">Azure Cognitive Services TTS</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              {/* Select Voice */}
              <Field orientation="vertical">
                <FieldLabel>
                  <Label>Select Voice</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="space-y-3">
                    {/* Search Bar */}
                    <div className="relative">
                      <HugeiconsIcon
                        icon={SearchIcon}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                      />
                      <Input
                        type="text"
                        placeholder="Search voices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>

                    {/* Voice List */}
                    <div className="border border-border rounded-lg max-h-64 overflow-y-auto">
                      <div className="p-2 space-y-1">
                        {filteredVoices.map((voice) => (
                          <label
                            key={voice.id}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded cursor-pointer transition-colors",
                              selectedVoice === voice.id
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-muted/50"
                            )}
                          >
                            <input
                              type="radio"
                              name="voice-selection"
                              value={voice.id}
                              checked={selectedVoice === voice.id}
                              onChange={(e) => setSelectedVoice(e.target.value)}
                              className="cursor-pointer"
                            />
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted shrink-0">
                              <HugeiconsIcon
                                icon={PlayIcon}
                                className="size-4 text-muted-foreground"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{voice.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {voice.provider} • {voice.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlayVoice(voice.id)
                              }}
                              className="h-7 w-7 p-0 shrink-0"
                            >
                              <HugeiconsIcon
                                icon={playingVoice === voice.id ? PauseIcon : PlayIcon}
                                className="size-3.5 text-primary"
                              />
                            </Button>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </FieldContent>
              </Field>
              </FieldGroup>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
    </div>
  )
}
