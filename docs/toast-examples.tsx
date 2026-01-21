/**
 * Toast System Examples
 *
 * This file contains practical examples of using the unified Toast system
 * with Sonner in various scenarios throughout the Flavatix app.
 */

import { toast } from '@/lib/toast'
import { authToasts } from '@/lib/toast'

/**
 * Example 1: Basic Notifications
 */
export function basicNotifications() {
  // Success notification
  toast.success('Tasting saved successfully!')

  // Error notification
  toast.error('Failed to save tasting')

  // Info notification
  toast.info('New features are available')

  // Warning notification
  toast.warning('Your session will expire in 5 minutes')
}

/**
 * Example 2: Notifications with Descriptions
 */
export function notificationsWithDescriptions() {
  toast.success('Profile updated', {
    description: 'Your profile changes have been saved successfully',
  })

  toast.error('Upload failed', {
    description: 'The image file is too large. Maximum size is 5MB.',
  })

  toast.info('New message', {
    description: 'You have 3 unread messages in your inbox',
  })
}

/**
 * Example 3: Custom Duration
 */
export function customDuration() {
  // Quick message (2 seconds)
  toast.success('Copied!', { duration: 2000 })

  // Important error (10 seconds)
  toast.error('Critical error occurred', { duration: 10000 })

  // Default duration (4 seconds for most, 5 for errors)
  toast.info('Processing your request...')
}

/**
 * Example 4: Promise-Based Loading States
 */
export async function saveTastingWithPromise(tastingData: any) {
  const saveTasting = async (data: any) => {
    const response = await fetch('/api/tastings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!response.ok) {throw new Error('Failed to save')}
    return response.json()
  }

  toast.promise(saveTasting(tastingData), {
    loading: 'Saving your tasting...',
    success: 'Tasting saved successfully!',
    error: 'Failed to save tasting. Please try again.',
  })
}

/**
 * Example 5: Promise with Dynamic Messages
 */
export async function loadTastingWithDynamicMessage(tastingId: string) {
  const fetchTasting = async (id: string) => {
    const response = await fetch(`/api/tastings/${id}`)
    if (!response.ok) {throw new Error('Failed to load')}
    return response.json()
  }

  toast.promise(fetchTasting(tastingId), {
    loading: 'Loading tasting...',
    success: (data) => `Loaded "${data.name}" successfully!`,
    error: (err) => `Error: ${err.message}`,
  })
}

/**
 * Example 6: Undo Functionality
 */
export function deleteTastingWithUndo(tastingId: string) {
  // Delete the tasting
  const deleteTasting = async (id: string) => {
    await fetch(`/api/tastings/${id}`, { method: 'DELETE' })
  }

  // Restore the tasting
  const restoreTasting = async (id: string) => {
    await fetch(`/api/tastings/${id}/restore`, { method: 'POST' })
  }

  // Execute delete
  deleteTasting(tastingId)

  // Show toast with undo option
  toast.withUndo(
    'Tasting deleted',
    () => restoreTasting(tastingId),
    { duration: 5000 }
  )
}

/**
 * Example 7: Action Buttons
 */
export function notificationWithAction() {
  // View action
  toast.info('New comment on your tasting', {
    action: {
      label: 'View',
      onClick: () => {
        window.location.href = '/tastings/123'
      },
    },
  })

  // Retry action
  toast.error('Failed to upload image', {
    action: {
      label: 'Retry',
      onClick: () => {
        // Retry upload logic
        console.log('Retrying upload...')
      },
    },
  })
}

/**
 * Example 8: Authentication Toasts
 */
export function authenticationExamples() {
  // Login success
  authToasts.loginSuccess()

  // Login error
  authToasts.loginError('Invalid email or password')

  // Registration success
  authToasts.registerSuccess()

  // Registration error
  authToasts.registerError('Email already exists')

  // Logout success
  authToasts.logoutSuccess()

  // Session expired
  authToasts.sessionExpired()

  // Email confirmation required
  authToasts.emailConfirmation()
}

/**
 * Example 9: Form Validation with Toast
 */
export function formValidationExample(formData: any) {
  // Validate required fields
  if (!formData.name) {
    toast.error('Name is required', {
      description: 'Please provide a name for your tasting',
    })
    return false
  }

  if (!formData.product) {
    toast.error('Product is required', {
      description: 'Please select or enter a product name',
    })
    return false
  }

  // Show success after validation passes
  toast.success('Validation passed', {
    description: 'Submitting your tasting...',
  })

  return true
}

/**
 * Example 10: Network Error Handling
 */
export async function networkErrorExample() {
  try {
    const response = await fetch('/api/data')

    if (!response.ok) {
      throw new Error('Network error')
    }

    const data = await response.json()
    toast.success('Data loaded successfully')
    return data
  } catch (error) {
    toast.error('Failed to load data', {
      description: 'Please check your internet connection',
      action: {
        label: 'Retry',
        onClick: () => networkErrorExample(),
      },
      duration: 6000,
    })
  }
}

/**
 * Example 11: File Upload with Progress
 */
export async function fileUploadExample(file: File) {
  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {throw new Error('Upload failed')}
    return response.json()
  }

  toast.promise(uploadFile(file), {
    loading: `Uploading ${file.name}...`,
    success: (data) => `${file.name} uploaded successfully!`,
    error: (err) => `Failed to upload ${file.name}: ${err.message}`,
  })
}

/**
 * Example 12: Copy to Clipboard
 */
export function copyToClipboardExample(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Copied to clipboard!', { duration: 2000 })
  })
}

/**
 * Example 13: Batch Operations
 */
export async function batchDeleteExample(ids: string[]) {
  const deleteItems = async (ids: string[]) => {
    const response = await fetch('/api/tastings/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
    if (!response.ok) {throw new Error('Batch delete failed')}
    return response.json()
  }

  toast.promise(deleteItems(ids), {
    loading: `Deleting ${ids.length} tastings...`,
    success: (data) => `Successfully deleted ${data.count} tastings`,
    error: 'Failed to delete tastings',
  })
}

/**
 * Example 14: Real-time Updates
 */
export function realtimeUpdateExample(update: any) {
  toast.info('New tasting shared with you', {
    description: `${update.user} shared "${update.tastingName}"`,
    action: {
      label: 'View',
      onClick: () => {
        window.location.href = `/tastings/${update.tastingId}`
      },
    },
    duration: 6000,
  })
}

/**
 * Example 15: Dismissing Toasts
 */
export function dismissToastExamples() {
  // Show a toast and save its ID
  const toastId = toast.success('Processing...')

  // Dismiss specific toast after 2 seconds
  setTimeout(() => {
    toast.dismiss(toastId)
  }, 2000)

  // Dismiss all toasts
  toast.dismiss()
}

/**
 * Example 16: Complex Workflow
 */
export async function complexWorkflowExample(tastingData: any) {
  // Step 1: Validate
  if (!formValidationExample(tastingData)) {
    return
  }

  // Step 2: Save with promise toast
  try {
    const result = await new Promise((resolve, reject) => {
      toast.promise(
        fetch('/api/tastings', {
          method: 'POST',
          body: JSON.stringify(tastingData),
        }).then((r) => {
          if (!r.ok) {throw new Error('Save failed')}
          return r.json()
        }),
        {
          loading: 'Saving your tasting...',
          success: 'Tasting saved successfully!',
          error: 'Failed to save tasting',
        }
      )
    })

    // Step 3: Show next action
    toast.success('Tasting saved', {
      description: 'What would you like to do next?',
      action: {
        label: 'Share',
        onClick: () => {
          // Open share dialog
          console.log('Opening share dialog...')
        },
      },
    })
  } catch (error) {
    console.error('Workflow failed:', error)
  }
}

/**
 * Example 17: Social Interactions
 */
export function socialInteractionExamples() {
  // Like notification
  toast.info('Someone liked your tasting', {
    description: 'Your "Espresso Blend #42" tasting has 12 likes',
    duration: 4000,
  })

  // Follow notification
  toast.info('New follower', {
    description: 'Jane Doe started following you',
    action: {
      label: 'View Profile',
      onClick: () => {
        window.location.href = '/profile/jane-doe'
      },
    },
  })

  // Comment notification
  toast.info('New comment', {
    description: 'John commented on your tasting',
    action: {
      label: 'Reply',
      onClick: () => {
        // Open comment reply
        console.log('Opening reply...')
      },
    },
  })
}

/**
 * Example 18: Settings Changes
 */
export function settingsChangeExample() {
  toast.success('Settings saved', {
    description: 'Your preferences have been updated',
  })

  toast.info('Dark mode enabled', {
    description: 'The app will now use dark theme',
  })
}

/**
 * Example 19: Offline/Online Status
 */
export function connectionStatusExamples() {
  // Offline
  toast.warning('You are offline', {
    description: 'Changes will be synced when you reconnect',
    duration: Infinity, // Stay until dismissed
  })

  // Back online
  toast.success('Back online', {
    description: 'All changes have been synced',
  })
}

/**
 * Example 20: Feature Announcements
 */
export function featureAnnouncementExample() {
  toast.info('New feature available', {
    description: 'Try our new AI-powered flavor descriptor extraction!',
    action: {
      label: 'Learn More',
      onClick: () => {
        window.location.href = '/features/ai-extraction'
      },
    },
    duration: 8000,
  })
}
