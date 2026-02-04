"use client"

import * as React from "react"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    MachineRobotIcon,
    SentIcon,
    Image01Icon,
    Delete02Icon,
    Loading01Icon,
    CheckmarkCircle01Icon,
    AlertCircleIcon,
    AttachmentIcon,
    SparklesIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { aiChatService, type AiChatMessage } from "@/lib/api"
import { toast } from "@/lib/toast"
import { usePermission } from "@/lib/hooks/use-permission"

// Generate unique ID for messages
const generateId = () => Math.random().toString(36).substring(2, 15)

export default function AiChatPage() {
    const { hasPermission } = usePermission()
    const [messages, setMessages] = React.useState<AiChatMessage[]>([])
    const [inputValue, setInputValue] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [selectedImage, setSelectedImage] = React.useState<File | null>(null)
    const [imagePreview, setImagePreview] = React.useState<string | null>(null)
    const [connectionStatus, setConnectionStatus] = React.useState<"unknown" | "connected" | "disconnected">("unknown")
    const messagesEndRef = React.useRef<HTMLDivElement>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    const canUseAiChat = hasPermission("use_ai_chat")

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Test connection on mount
    React.useEffect(() => {
        const testConnection = async () => {
            try {
                const response = await aiChatService.testConnection()
                if (response.success && response.data?.connected) {
                    setConnectionStatus("connected")
                } else {
                    setConnectionStatus("disconnected")
                }
            } catch {
                setConnectionStatus("disconnected")
            }
        }
        if (canUseAiChat) {
            testConnection()
        }
    }, [canUseAiChat])

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image size must be less than 10MB")
                return
            }
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    // Send message
    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()

        if ((!inputValue.trim() && !selectedImage) || isLoading) return

        const userMessage: AiChatMessage = {
            id: generateId(),
            role: "user",
            content: inputValue || (selectedImage ? "Analyze this image" : ""),
            timestamp: new Date(),
            imageUrl: imagePreview || undefined,
        }

        setMessages((prev) => [...prev, userMessage])
        setInputValue("")
        const currentImage = selectedImage
        const currentImagePreview = imagePreview
        removeImage()
        setIsLoading(true)

        try {
            let response
            if (currentImage) {
                response = await aiChatService.analyzeImage(currentImage, userMessage.content)
            } else {
                response = await aiChatService.sendMessage(userMessage.content)
            }

            if (response.success && response.data) {
                const assistantMessage: AiChatMessage = {
                    id: generateId(),
                    role: "assistant",
                    content: response.data.message,
                    timestamp: new Date(),
                    responseTimeMs: response.data.response_time_ms,
                }
                setMessages((prev) => [...prev, assistantMessage])
            } else {
                toast.error(response.message || "Failed to get AI response")
                // Add error message
                const errorMessage: AiChatMessage = {
                    id: generateId(),
                    role: "assistant",
                    content: "Sorry, I encountered an error processing your request. Please try again.",
                    timestamp: new Date(),
                }
                setMessages((prev) => [...prev, errorMessage])
            }
        } catch (error) {
            console.error("AI chat error:", error)
            toast.error("Failed to send message")
            const errorMessage: AiChatMessage = {
                id: generateId(),
                role: "assistant",
                content: "Sorry, I encountered an error. Please check if the AI service is available.",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
            textareaRef.current?.focus()
        }
    }

    // Handle Enter key (Shift+Enter for new line)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const clearChat = () => {
        setMessages([])
        toast.success("Chat cleared")
    }

    if (!canUseAiChat) {
        return (
            <CustomerDashboardLayout>
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <HugeiconsIcon icon={AlertCircleIcon} className="size-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">You don&apos;t have permission to use AI Chat.</p>
                        </div>
                    </CardContent>
                </Card>
            </CustomerDashboardLayout>
        )
    }

    return (
        <CustomerDashboardLayout>
            <div className="flex flex-col h-[calc(100vh-120px)] max-h-[900px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="size-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                                <HugeiconsIcon icon={SparklesIcon} className="size-6 text-white" />
                            </div>
                            <div className={cn(
                                "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background",
                                connectionStatus === "connected" ? "bg-green-500" :
                                    connectionStatus === "disconnected" ? "bg-red-500" : "bg-yellow-500"
                            )} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                AI Assistant
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Powered by LLaVA Vision Model
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={cn(
                                "gap-1.5",
                                connectionStatus === "connected"
                                    ? "border-green-500/30 bg-green-500/10 text-green-600"
                                    : connectionStatus === "disconnected"
                                        ? "border-red-500/30 bg-red-500/10 text-red-600"
                                        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-600"
                            )}
                        >
                            <HugeiconsIcon
                                icon={connectionStatus === "connected" ? CheckmarkCircle01Icon : AlertCircleIcon}
                                className="size-3"
                            />
                            {connectionStatus === "connected" ? "Connected" :
                                connectionStatus === "disconnected" ? "Disconnected" : "Checking..."}
                        </Badge>
                        {messages.length > 0 && (
                            <Button variant="outline" size="sm" onClick={clearChat}>
                                <HugeiconsIcon icon={Delete02Icon} className="size-4 mr-1.5" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Chat Messages */}
                <Card className="flex-1 overflow-hidden border-0 bg-gradient-to-b from-muted/30 to-muted/10">
                    <CardContent className="h-full p-0">
                        <div className="h-full overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="size-20 rounded-2xl bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4">
                                        <HugeiconsIcon icon={MachineRobotIcon} className="size-10 text-purple-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
                                    <p className="text-muted-foreground max-w-md mb-6">
                                        Ask me anything or upload an image for analysis. I can help with descriptions,
                                        understanding content, and answering questions about images.
                                    </p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {[
                                            "Describe a sunset scene",
                                            "Help me write a caption",
                                            "Analyze an image",
                                            "Creative writing ideas",
                                        ].map((suggestion) => (
                                            <Button
                                                key={suggestion}
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-600 transition-colors"
                                                onClick={() => setInputValue(suggestion)}
                                            >
                                                {suggestion}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "flex gap-3",
                                                message.role === "user" ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            {message.role === "assistant" && (
                                                <div className="size-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                                                    <HugeiconsIcon icon={SparklesIcon} className="size-4 text-white" />
                                                </div>
                                            )}
                                            <div
                                                className={cn(
                                                    "max-w-[75%] rounded-2xl px-4 py-3",
                                                    message.role === "user"
                                                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                                                        : "bg-card border shadow-sm"
                                                )}
                                            >
                                                {message.imageUrl && (
                                                    <img
                                                        src={message.imageUrl}
                                                        alt="Uploaded"
                                                        className="max-w-full max-h-48 rounded-lg mb-2 object-cover"
                                                    />
                                                )}
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                <div className={cn(
                                                    "flex items-center gap-2 mt-2 text-xs",
                                                    message.role === "user" ? "text-white/70" : "text-muted-foreground"
                                                )}>
                                                    <span>
                                                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                    {message.responseTimeMs && (
                                                        <span className="opacity-70">• {message.responseTimeMs}ms</span>
                                                    )}
                                                </div>
                                            </div>
                                            {message.role === "user" && (
                                                <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-bold text-white">You</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex gap-3 justify-start">
                                            <div className="size-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                                                <HugeiconsIcon icon={SparklesIcon} className="size-4 text-white" />
                                            </div>
                                            <div className="bg-card border shadow-sm rounded-2xl px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <HugeiconsIcon icon={Loading01Icon} className="size-4 animate-spin text-purple-500" />
                                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Image Preview */}
                {imagePreview && (
                    <div className="mt-3 relative inline-block">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-20 rounded-lg object-cover border shadow-sm"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                        >
                            <HugeiconsIcon icon={Delete02Icon} className="size-3" />
                        </button>
                    </div>
                )}

                {/* Input Area */}
                <div className="mt-4">
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="flex items-end gap-2 p-2 rounded-2xl border bg-card shadow-sm">
                            {/* Image Upload Button */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className="shrink-0 rounded-xl hover:bg-purple-500/10 hover:text-purple-600"
                            >
                                <HugeiconsIcon icon={selectedImage ? AttachmentIcon : Image01Icon} className="size-5" />
                            </Button>

                            {/* Text Input */}
                            <Textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message or upload an image..."
                                className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                                disabled={isLoading}
                                rows={1}
                            />

                            {/* Send Button */}
                            <Button
                                type="submit"
                                disabled={(!inputValue.trim() && !selectedImage) || isLoading}
                                className="shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-purple-500/25"
                            >
                                {isLoading ? (
                                    <HugeiconsIcon icon={Loading01Icon} className="size-5 animate-spin" />
                                ) : (
                                    <HugeiconsIcon icon={SentIcon} className="size-5" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            Press Enter to send, Shift+Enter for new line
                        </p>
                    </form>
                </div>
            </div>
        </CustomerDashboardLayout>
    )
}
