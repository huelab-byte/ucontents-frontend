// Export API client
export { apiClient, type ApiResponse, type ApiError, setShowToasts, getShowToasts } from './client'

// Export URL utilities
export { getApiBaseUrl, getApiUrl, getStorageUrl } from './utils'

// Export services
export { authService } from './services/auth.service'
export type { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, PublicAuthFeatures } from './services/auth.service'

export { userService } from './services/user.service'
export type { User, CreateUserRequest, UpdateUserRequest, UserListParams } from './services/user.service'

export { customerService } from './services/customer.service'
export type { CustomerProfile, CustomerListParams } from './services/customer.service'

export { clientService } from './services/client.service'
export type {
  ApiClient,
  ApiKey,
  CreateApiClientRequest,
  UpdateApiClientRequest,
  CreateApiKeyRequest,
  ApiKeyActivity,
} from './services/client.service'

export { profileService } from './services/profile.service'
export type { UpdateProfileRequest } from './services/profile.service'

export { authSettingsService } from './services/auth-settings.service'
export type {
  AuthSettings,
  AuthFeatures,
  AuthEndpoints,
  PasswordSettings,
  TokenSettings,
  RateLimitSettings,
  UpdateAuthSettingsRequest,
} from './services/auth-settings.service'

export { twoFactorService } from './services/two-factor.service'
export type {
  TwoFactorStatus,
  TwoFactorSetup,
  TwoFactorEnableResponse,
  TwoFactorBackupCodesResponse,
} from './services/two-factor.service'

export { emailService } from './services/email.service'
export type {
  SmtpConfiguration,
  CreateSmtpConfigurationRequest,
  UpdateSmtpConfigurationRequest,
  EmailTemplate,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  SendTestEmailRequest,
  EmailLog,
  EmailListParams,
} from './services/email.service'

export { permissionService } from './services/permission.service'
export type {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PermissionListParams,
} from './services/permission.service'

export { roleService } from './services/role.service'
export type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleListParams,
} from './services/role.service'

export { aiIntegrationService } from './services/ai-integration.service'
export type {
  AiProvider,
  AiApiKey,
  AiUsageLog,
  AiUsageStatistics,
  AiPromptTemplate,
  CreateAiApiKeyRequest,
  UpdateAiApiKeyRequest,
  CreatePromptTemplateRequest,
  UpdatePromptTemplateRequest,
  UsageLogListParams,
  ApiKeyListParams,
  PromptTemplateListParams,
  RenderPromptRequest,
} from './services/ai-integration.service'

export { paymentGatewayService } from './services/payment-gateway.service'
export type {
  PaymentGateway,
  CreatePaymentGatewayRequest,
  UpdatePaymentGatewayRequest,
  PaymentGatewayListParams,
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceListParams,
  Payment,
  CreatePaymentRequest,
  PaymentListParams,
  Subscription,
  CreateSubscriptionRequest,
  SubscriptionListParams,
  Refund,
  CreateRefundRequest,
  RefundListParams,
} from './services/payment-gateway.service'

export { invoiceTemplateService } from './services/invoice-template.service'
export type {
  InvoiceTemplate,
  CreateInvoiceTemplateRequest,
  UpdateInvoiceTemplateRequest,
  InvoiceTemplateListParams,
} from './services/invoice-template.service'

export { socialConnectionService } from './services/social-connection.service'
export type {
  SocialProvider,
  SocialProviderApp,
  SocialChannel,
  SocialChannelType,
  SocialConnectionGroup,
  UpdateSocialProviderAppRequest,
} from './services/social-connection.service'

export { notificationService } from './services/notification.service'
export type {
  Notification as AppNotification,
  NotificationRecipient,
  NotificationSeverity,
  CreateAnnouncementRequest,
  CreateAnnouncementResponse,
  NotificationListParams,
  PusherConfig,
} from './services/notification.service'

export { notificationSettingsService } from './services/notification-settings.service'
export type {
  NotificationSettings,
  UpdateNotificationSettingsRequest,
} from './services/notification-settings.service'

export { planService } from './services/plan.service'
export type {
  Plan,
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanListParams,
  PlanSubscriptionType,
} from './services/plan.service'

export { supportService } from './services/support.service'
export type {
  SupportTicket,
  SupportTicketReply,
  TicketStatus,
  TicketPriority,
  CreateSupportTicketRequest,
  ReplySupportTicketRequest,
  UpdateTicketStatusRequest,
  AssignTicketRequest,
  UpdateTicketPriorityRequest,
  SupportTicketListParams,
} from './services/support.service'

export { storageManagementService } from './services/storage-management.service'
export type {
  StorageDriver,
  StorageConfig,
  StorageUsage,
  MigrationResult,
  CleanupResult,
  UploadedFile,
  BulkUploadResult,
} from './services/storage-management.service'

export { generalSettingsService } from './services/general-settings.service'
export type {
  GeneralSettings,
  PublicGeneralSettings,
  BrandingSettings,
  MetaSettings,
  SocialLinks,
  UpdateGeneralSettingsRequest,
} from './services/general-settings.service'

export { footageLibraryService } from './services/footage-library.service'
export type {
  Footage,
  FootageFolder,
  FootageMetadata,
  FootageStatus,
  FootageStats,
  StorageFile,
  UploadQueueStatus,
  SearchResult,
  FootageListParams,
  CreateFolderRequest,
  UpdateFootageRequest,
  SearchFootageRequest,
  UserWithUploadCount as FootageUserWithUploadCount,
} from './services/footage-library.service'

export { audioLibraryService } from './services/audio-library.service'
export type {
  Audio,
  AudioFolder,
  AudioMetadata,
  AudioStatus,
  AudioStats,
  AudioListParams,
  CreateFolderRequest as AudioCreateFolderRequest,
  UpdateAudioRequest,
  UserWithUploadCount as AudioUserWithUploadCount,
} from './services/audio-library.service'

export { imageLibraryService } from './services/image-library.service'
export type {
  Image,
  ImageFolder,
  ImageMetadata,
  ImageStatus,
  ImageStats,
  ImageListParams,
  CreateFolderRequest as ImageCreateFolderRequest,
  UpdateImageRequest,
  UserWithUploadCount as ImageUserWithUploadCount,
} from './services/image-library.service'

export { videoOverlayService } from './services/video-overlay.service'
export type {
  VideoOverlay,
  VideoOverlayFolder,
  VideoOverlayMetadata,
  VideoOverlayStatus,
  VideoOverlayStats,
  VideoOverlayListParams,
  CreateFolderRequest as VideoOverlayCreateFolderRequest,
  UpdateVideoOverlayRequest,
  UserWithUploadCount as VideoOverlayUserWithUploadCount,
} from './services/video-overlay.service'

export { bgmLibraryService } from './services/bgm-library.service'
export type {
  Bgm,
  BgmFolder,
  BgmMetadata,
  BgmStatus,
  BgmStats,
  BgmListParams,
  CreateFolderRequest as BgmCreateFolderRequest,
  UpdateBgmRequest,
  UserWithUploadCount as BgmUserWithUploadCount,
  UploadQueueStatus as BgmUploadQueueStatus,
} from './services/bgm-library.service'

export { imageOverlayService } from './services/image-overlay.service'
export type {
  ImageOverlay,
  ImageOverlayFolder,
  ImageOverlayMetadata,
  ImageOverlayStatus,
  ImageOverlayStats,
  ImageOverlayListParams,
  CreateFolderRequest as ImageOverlayCreateFolderRequest,
  UpdateImageOverlayRequest,
  UserWithUploadCount as ImageOverlayUserWithUploadCount,
  UploadQueueStatus as ImageOverlayUploadQueueStatus,
} from './services/image-overlay.service'

export { mediaUploadService } from './services/media-upload.service'
export type {
  MediaUploadFolder,
  MediaUploadContentSettings,
  CaptionTemplate,
  MediaUpload,
  MediaUploadStorageFile,
  MediaUploadStatus,
  UploadQueueStatus as MediaUploadQueueStatus,
  CreateFolderRequest as MediaUploadCreateFolderRequest,
  UpdateFolderRequest as MediaUploadUpdateFolderRequest,
  UpdateContentSettingsRequest,
  CreateCaptionTemplateRequest,
  UpdateCaptionTemplateRequest,
  UpdateMediaUploadRequest,
  MediaUploadListParams,
} from './services/media-upload.service'

export { proxySetupService } from './services/proxy-setup.service'
export { bulkPostingService } from './services/bulk-posting.service'
export type {
  Proxy,
  ProxyType,
  ProxyCheckStatus,
  ProxyChannel,
  ProxyWithChannels,
  ProxySettings,
  ProxyFailureAction,
  ProxyTestResult,
  CreateProxyRequest,
  UpdateProxyRequest,
  UpdateProxySettingsRequest,
  AssignChannelsRequest,
} from './services/proxy-setup.service'

export type {
  BulkPostingCampaign,
  ContentSourceType,
  CampaignStatus,
  ScheduleCondition,
  ConnectionSelection,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  BulkPostingListParams,
  ScheduledContent,
} from './services/bulk-posting.service'

// Export toast utilities
export { toast } from '../toast'
