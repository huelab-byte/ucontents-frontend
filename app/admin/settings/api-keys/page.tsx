"use client"

import * as React from "react"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LockKeyIcon,
  CheckmarkCircle01Icon,
  PlusSignIcon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { usePermission } from "@/lib/hooks/use-permission"

function PasswordInput({
  value,
  onChange,
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [showPassword, setShowPassword] = React.useState(false)
  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        ) : (
          <HugeiconsIcon icon={LockKeyIcon} className="size-4" />
        )}
      </button>
    </div>
  )
}

interface APIProviderProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}

function APIProvider({ title, description, icon: Icon, children }: APIProviderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="size-5" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

interface OpenAIConfig {
  id: string
  apiKey: string
  orgId: string
  textModel: string
  embeddingModel: string
  imageModel: string
  isTesting: boolean
}

interface GoogleAIConfig {
  id: string
  apiKey: string
  projectId: string
  model: string
  isTesting: boolean
}

interface AzureOpenAIConfig {
  id: string
  apiKey: string
  endpoint: string
  deployment: string
  apiVersion: string
  model: string
  isTesting: boolean
}

export default function APIKeysPage() {
  const { hasPermission } = usePermission()

  // Permission check
  if (!hasPermission("view_ai_config") && !hasPermission("manage_ai_config")) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  // OpenAI - Multiple configurations
  const [openAIConfigs, setOpenAIConfigs] = React.useState<OpenAIConfig[]>([
    {
      id: "1",
      apiKey: "",
      orgId: "",
      textModel: "gpt-4o",
      embeddingModel: "text-embedding-3-large",
      imageModel: "dall-e-3",
      isTesting: false,
    },
  ])

  // Google AI - Multiple configurations
  const [googleAIConfigs, setGoogleAIConfigs] = React.useState<GoogleAIConfig[]>([
    { id: "1", apiKey: "", projectId: "", model: "gemini-pro", isTesting: false },
  ])

  // Azure OpenAI - Multiple configurations
  const [azureConfigs, setAzureConfigs] = React.useState<AzureOpenAIConfig[]>([
    {
      id: "1",
      apiKey: "",
      endpoint: "",
      deployment: "",
      apiVersion: "2024-02-15-preview",
      model: "gpt-4",
      isTesting: false,
    },
  ])

  // Runware
  const [runwareKey, setRunwareKey] = React.useState("")
  const [runwareEndpoint, setRunwareEndpoint] = React.useState("")
  const [isTestingRunware, setIsTestingRunware] = React.useState(false)

  // Fal.ai
  const [falKey, setFalKey] = React.useState("")
  const [falModel, setFalModel] = React.useState("")
  const [isTestingFal, setIsTestingFal] = React.useState(false)

  // Recraft
  const [recraftKey, setRecraftKey] = React.useState("")
  const [recraftStyle, setRecraftStyle] = React.useState("")
  const [isTestingRecraft, setIsTestingRecraft] = React.useState(false)

  // Test functions for Runware, Fal.ai, and Recraft
  const testRunwareConnection = async () => {
    setIsTestingRunware(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // TODO: Replace with actual API call when endpoint is available
    } catch (error) {
      console.error("Runware connection test failed:", error)
    } finally {
      setIsTestingRunware(false)
    }
  }

  const testFalConnection = async () => {
    setIsTestingFal(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // TODO: Replace with actual API call when endpoint is available
    } catch (error) {
      console.error("Fal.ai connection test failed:", error)
    } finally {
      setIsTestingFal(false)
    }
  }

  const testRecraftConnection = async () => {
    setIsTestingRecraft(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // TODO: Replace with actual API call when endpoint is available
    } catch (error) {
      console.error("Recraft connection test failed:", error)
    } finally {
      setIsTestingRecraft(false)
    }
  }

  // Helper functions for OpenAI
  const addOpenAIConfig = () => {
    setOpenAIConfigs([
      ...openAIConfigs,
      {
        id: Date.now().toString(),
        apiKey: "",
        orgId: "",
        textModel: "gpt-4o",
        embeddingModel: "text-embedding-3-large",
        imageModel: "dall-e-3",
        isTesting: false,
      },
    ])
  }

  const removeOpenAIConfig = (id: string) => {
    setOpenAIConfigs(openAIConfigs.filter((config) => config.id !== id))
  }

  const updateOpenAIConfig = (id: string, field: keyof OpenAIConfig, value: string) => {
    setOpenAIConfigs(
      openAIConfigs.map((config) => (config.id === id ? { ...config, [field]: value } : config))
    )
  }

  const testOpenAIConnection = async (id: string) => {
    setOpenAIConfigs(
      openAIConfigs.map((config) =>
        config.id === id ? { ...config, isTesting: true } : config
      )
    )
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // TODO: Replace with actual API call when endpoint is available
    } catch (error) {
      console.error("OpenAI connection test failed:", error)
    } finally {
      setOpenAIConfigs(
        openAIConfigs.map((config) =>
          config.id === id ? { ...config, isTesting: false } : config
        )
      )
    }
  }

  // Helper functions for Google AI
  const addGoogleAIConfig = () => {
    setGoogleAIConfigs([
      ...googleAIConfigs,
      {
        id: Date.now().toString(),
        apiKey: "",
        projectId: "",
        model: "gemini-pro",
        isTesting: false,
      },
    ])
  }

  const removeGoogleAIConfig = (id: string) => {
    setGoogleAIConfigs(googleAIConfigs.filter((config) => config.id !== id))
  }

  const updateGoogleAIConfig = (
    id: string,
    field: keyof GoogleAIConfig,
    value: string
  ) => {
    setGoogleAIConfigs(
      googleAIConfigs.map((config) =>
        config.id === id ? { ...config, [field]: value } : config
      )
    )
  }

  const testGoogleAIConnection = async (id: string) => {
    setGoogleAIConfigs(
      googleAIConfigs.map((config) =>
        config.id === id ? { ...config, isTesting: true } : config
      )
    )
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // TODO: Replace with actual API call when endpoint is available
    } catch (error) {
      console.error("Google AI connection test failed:", error)
    } finally {
      setGoogleAIConfigs(
        googleAIConfigs.map((config) =>
          config.id === id ? { ...config, isTesting: false } : config
        )
      )
    }
  }

  // Helper functions for Azure OpenAI
  const addAzureConfig = () => {
    setAzureConfigs([
      ...azureConfigs,
      {
        id: Date.now().toString(),
        apiKey: "",
        endpoint: "",
        deployment: "",
        apiVersion: "2024-02-15-preview",
        model: "gpt-4",
        isTesting: false,
      },
    ])
  }

  const removeAzureConfig = (id: string) => {
    setAzureConfigs(azureConfigs.filter((config) => config.id !== id))
  }

  const updateAzureConfig = (id: string, field: keyof AzureOpenAIConfig, value: string) => {
    setAzureConfigs(
      azureConfigs.map((config) =>
        config.id === id ? { ...config, [field]: value } : config
      )
    )
  }

  const testAzureConnection = async (id: string) => {
    setAzureConfigs(
      azureConfigs.map((config) =>
        config.id === id ? { ...config, isTesting: true } : config
      )
    )
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // TODO: Replace with actual API call when endpoint is available
    } catch (error) {
      console.error("Azure OpenAI connection test failed:", error)
    } finally {
      setAzureConfigs(
        azureConfigs.map((config) =>
          config.id === id ? { ...config, isTesting: false } : config
        )
      )
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={LockKeyIcon} className="size-8" />
            API Keys
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage API keys, access tokens, and third-party service credentials for integrations
          </p>
        </div>

        <div className="space-y-6">
          {/* OpenAI */}
          <APIProvider title="OpenAI" description="Text generation and completion API">
            <div className="space-y-6">
              {openAIConfigs.map((config, index) => (
                <div
                  key={config.id}
                  className="p-4 border border-border rounded-lg space-y-4 bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      API Configuration {index + 1}
                    </span>
                    {openAIConfigs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => removeOpenAIConfig(config.id)}
                      >
                        <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
                      </Button>
                    )}
                  </div>
                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel>
                        <Label>API Key</Label>
                      </FieldLabel>
                      <FieldContent>
                        <PasswordInput
                          placeholder="sk-..."
                          value={config.apiKey}
                          onChange={(e) =>
                            updateOpenAIConfig(config.id, "apiKey", e.target.value)
                          }
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>
                        <Label className="text-muted-foreground font-normal">
                          Organization ID (Optional)
                        </Label>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          placeholder="org-..."
                          value={config.orgId}
                          onChange={(e) =>
                            updateOpenAIConfig(config.id, "orgId", e.target.value)
                          }
                        />
                      </FieldContent>
                    </Field>

                    <div className="pt-2 border-t border-border">
                      <div className="text-sm font-medium mb-4">Model Configuration</div>
                      <div className="space-y-4">
                        <Field>
                          <FieldLabel>
                            <Label>Content / Text Model</Label>
                          </FieldLabel>
                          <FieldContent>
                            <Select
                              value={config.textModel}
                              onValueChange={(value) =>
                                updateOpenAIConfig(config.id, "textModel", value || "")
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select text model" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                <SelectItem value="o1-preview">O1 Preview</SelectItem>
                                <SelectItem value="o1-mini">O1 Mini</SelectItem>
                              </SelectContent>
                            </Select>
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel>
                            <Label>Embedding Model</Label>
                          </FieldLabel>
                          <FieldContent>
                            <Select
                              value={config.embeddingModel}
                              onValueChange={(value) =>
                                updateOpenAIConfig(config.id, "embeddingModel", value || "")
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select embedding model" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text-embedding-3-large">
                                  text-embedding-3-large
                                </SelectItem>
                                <SelectItem value="text-embedding-3-small">
                                  text-embedding-3-small
                                </SelectItem>
                                <SelectItem value="text-embedding-ada-002">
                                  text-embedding-ada-002
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel>
                            <Label>Image Generation Model</Label>
                          </FieldLabel>
                          <FieldContent>
                            <Select
                              value={config.imageModel}
                              onValueChange={(value) =>
                                updateOpenAIConfig(config.id, "imageModel", value || "")
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select image model" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                                <SelectItem value="dall-e-2">DALL-E 2</SelectItem>
                              </SelectContent>
                            </Select>
                          </FieldContent>
                        </Field>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="button"
                        disabled={config.isTesting}
                        variant="outline"
                        onClick={() => testOpenAIConnection(config.id)}
                      >
                        {config.isTesting ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <HugeiconsIcon
                              icon={CheckmarkCircle01Icon}
                              className="size-4 mr-2"
                              data-icon="inline-start"
                            />
                            Test Connection
                          </>
                        )}
                      </Button>
                    </div>
                  </FieldGroup>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addOpenAIConfig}
                className="w-full"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" data-icon="inline-start" />
                Add OpenAI API
              </Button>
            </div>
          </APIProvider>

          {/* Google AI */}
          <APIProvider title="Google AI" description="Google Gemini API for AI tasks">
            <div className="space-y-6">
              {googleAIConfigs.map((config, index) => (
                <div
                  key={config.id}
                  className="p-4 border border-border rounded-lg space-y-4 bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      API Configuration {index + 1}
                    </span>
                    {googleAIConfigs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => removeGoogleAIConfig(config.id)}
                      >
                        <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
                      </Button>
                    )}
                  </div>
                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel>
                        <Label>API Key</Label>
                      </FieldLabel>
                      <FieldContent>
                        <PasswordInput
                          placeholder="Enter your API key"
                          value={config.apiKey}
                          onChange={(e) =>
                            updateGoogleAIConfig(config.id, "apiKey", e.target.value)
                          }
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>
                        <Label>Project ID</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          placeholder="my-project-id"
                          value={config.projectId}
                          onChange={(e) =>
                            updateGoogleAIConfig(config.id, "projectId", e.target.value)
                          }
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>
                        <Label>Default Model</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Select
                          value={config.model}
                          onValueChange={(value) =>
                            updateGoogleAIConfig(config.id, "model", value || "")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                            <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                            <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>

                    <div className="pt-2">
                      <Button
                        type="button"
                        disabled={config.isTesting}
                        variant="outline"
                        onClick={() => testGoogleAIConnection(config.id)}
                      >
                        {config.isTesting ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <HugeiconsIcon
                              icon={CheckmarkCircle01Icon}
                              className="size-4 mr-2"
                              data-icon="inline-start"
                            />
                            Test Connection
                          </>
                        )}
                      </Button>
                    </div>
                  </FieldGroup>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addGoogleAIConfig}
                className="w-full"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" data-icon="inline-start" />
                Add Google AI API
              </Button>
            </div>
          </APIProvider>

          {/* Azure OpenAI */}
          <APIProvider title="Azure OpenAI" description="Azure-hosted OpenAI API">
            <div className="space-y-6">
              {azureConfigs.map((config, index) => (
                <div
                  key={config.id}
                  className="p-4 border border-border rounded-lg space-y-4 bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      API Configuration {index + 1}
                    </span>
                    {azureConfigs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => removeAzureConfig(config.id)}
                      >
                        <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
                      </Button>
                    )}
                  </div>
                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel>
                        <Label>API Key</Label>
                      </FieldLabel>
                      <FieldContent>
                        <PasswordInput
                          placeholder="Enter your API key"
                          value={config.apiKey}
                          onChange={(e) =>
                            updateAzureConfig(config.id, "apiKey", e.target.value)
                          }
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>
                        <Label>Endpoint URL</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          type="url"
                          placeholder="https://your-resource.openai.azure.com"
                          value={config.endpoint}
                          onChange={(e) =>
                            updateAzureConfig(config.id, "endpoint", e.target.value)
                          }
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>
                        <Label>Deployment Name</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          placeholder="your-deployment-name"
                          value={config.deployment}
                          onChange={(e) =>
                            updateAzureConfig(config.id, "deployment", e.target.value)
                          }
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>
                        <Label>API Version</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Select
                          value={config.apiVersion}
                          onValueChange={(value) =>
                            updateAzureConfig(config.id, "apiVersion", value || "")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select API version" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2024-02-15-preview">2024-02-15-preview</SelectItem>
                            <SelectItem value="2024-06-01-preview">2024-06-01-preview</SelectItem>
                            <SelectItem value="2023-12-01-preview">2023-12-01-preview</SelectItem>
                            <SelectItem value="2023-05-15">2023-05-15</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>
                        <Label>Default Model / Deployment</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Select
                          value={config.model}
                          onValueChange={(value) =>
                            updateAzureConfig(config.id, "model", value || "")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Azure model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4">GPT-4 (Azure)</SelectItem>
                            <SelectItem value="gpt-4-32k">GPT-4 32k (Azure)</SelectItem>
                            <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Azure)</SelectItem>
                            <SelectItem value="gpt-35-turbo">GPT-35 Turbo (Azure)</SelectItem>
                            <SelectItem value="gpt-35-turbo-16k">GPT-35 Turbo 16k (Azure)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>

                    <div className="pt-2">
                      <Button
                        type="button"
                        disabled={config.isTesting}
                        variant="outline"
                        onClick={() => testAzureConnection(config.id)}
                      >
                        {config.isTesting ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <HugeiconsIcon
                              icon={CheckmarkCircle01Icon}
                              className="size-4 mr-2"
                              data-icon="inline-start"
                            />
                            Test Connection
                          </>
                        )}
                      </Button>
                    </div>
                  </FieldGroup>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addAzureConfig}
                className="w-full"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" data-icon="inline-start" />
                Add Azure OpenAI API
              </Button>
            </div>
          </APIProvider>

          {/* Runware */}
          <APIProvider title="Runware" description="Image generation and processing API">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>
                  <Label>API Key</Label>
                </FieldLabel>
                <FieldContent>
                  <PasswordInput
                    placeholder="Enter your API key"
                    value={runwareKey}
                    onChange={(e) => setRunwareKey(e.target.value)}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label className="text-muted-foreground font-normal">
                    Endpoint (Optional)
                  </Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="url"
                    placeholder="https://api.runware.com"
                    value={runwareEndpoint}
                    onChange={(e) => setRunwareEndpoint(e.target.value)}
                  />
                </FieldContent>
              </Field>

              <div className="pt-2">
                <Button
                  type="button"
                  disabled={isTestingRunware}
                  variant="outline"
                  onClick={testRunwareConnection}
                >
                  {isTestingRunware ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        className="size-4 mr-2"
                        data-icon="inline-start"
                      />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </FieldGroup>
          </APIProvider>

          {/* Fal.ai */}
          <APIProvider title="Fal.ai" description="Fast AI inference API for images">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>
                  <Label>API Key</Label>
                </FieldLabel>
                <FieldContent>
                  <PasswordInput
                    placeholder="Enter your API key"
                    value={falKey}
                    onChange={(e) => setFalKey(e.target.value)}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label className="text-muted-foreground font-normal">
                    Default Model (Optional)
                  </Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    placeholder="fal-ai/flux"
                    value={falModel}
                    onChange={(e) => setFalModel(e.target.value)}
                  />
                </FieldContent>
              </Field>

              <div className="pt-2">
                <Button
                  type="button"
                  disabled={isTestingFal}
                  variant="outline"
                  onClick={testFalConnection}
                >
                  {isTestingFal ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        className="size-4 mr-2"
                        data-icon="inline-start"
                      />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </FieldGroup>
          </APIProvider>

          {/* Recraft */}
          <APIProvider title="Recraft" description="AI image generation and editing API">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>
                  <Label>API Key</Label>
                </FieldLabel>
                <FieldContent>
                  <PasswordInput
                    placeholder="Enter your API key"
                    value={recraftKey}
                    onChange={(e) => setRecraftKey(e.target.value)}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label className="text-muted-foreground font-normal">
                    Default Style / Model (Optional)
                  </Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    placeholder="Default style or model"
                    value={recraftStyle}
                    onChange={(e) => setRecraftStyle(e.target.value)}
                  />
                </FieldContent>
              </Field>

              <div className="pt-2">
                <Button
                  type="button"
                  disabled={isTestingRecraft}
                  variant="outline"
                  onClick={testRecraftConnection}
                >
                  {isTestingRecraft ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        className="size-4 mr-2"
                        data-icon="inline-start"
                      />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </FieldGroup>
          </APIProvider>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
