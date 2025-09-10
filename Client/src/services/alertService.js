import Swal from 'sweetalert2';

// Custom theme configuration matching your website
const defaultConfig = {
  customClass: {
    popup: 'swal-custom-popup',
    header: 'swal-custom-header',
    title: 'swal-custom-title',
    content: 'swal-custom-content',
    confirmButton: 'swal-custom-confirm-btn',
    cancelButton: 'swal-custom-cancel-btn',
    denyButton: 'swal-custom-deny-btn',
    actions: 'swal-custom-actions'
  },
  buttonsStyling: false,
  background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0a0a0a 100%)',
  color: '#f3f4f6',
  showCloseButton: true,
  focusConfirm: false,
  backdrop: `
    rgba(0,0,0,0.8)
    url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23a855f7' fill-opacity='0.1' fill-rule='nonzero'%3e%3ccircle cx='30' cy='30' r='2'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")
    center center
  `,
  width: '30rem',
  padding: '1.5rem',
  borderRadius: '1rem',
  didOpen: (popup) => {
    // Apply custom styles directly
    popup.style.border = '1px solid rgba(139, 92, 246, 0.3)';
    popup.style.boxShadow = '0 25px 50px -12px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.1)';
    popup.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
  }
};

export const AlertService = {
  // Success alerts
  success: (title, text = '') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      html: `
        <div class="success-icon-container" style="margin-bottom: 1rem;">
          <div class="success-checkmark" style="
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #059669);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
            animation: successPulse 0.6s ease-out;
          ">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="animation: checkmarkDraw 0.8s ease-out 0.3s both;">
              <polyline points="20,6 9,17 4,12" style="stroke-dasharray: 20; stroke-dashoffset: 20; animation: drawCheck 0.8s ease-out 0.3s forwards;"></polyline>
            </svg>
          </div>
        </div>
        <div style="color: #f3f4f6; font-size: 1rem; line-height: 1.5;">${text}</div>
        <style>
          @keyframes successPulse {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes drawCheck {
            to { stroke-dashoffset: 0; }
          }
        </style>
      `,
      confirmButtonText: 'Perfect!',
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: true,
      customClass: {
        ...defaultConfig.customClass,
        confirmButton: 'swal-custom-confirm-btn swal-success-btn'
      }
    });
  },

  // Error alerts
  error: (title, text = '') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'error',
      confirmButtonText: 'Try Again',
      showConfirmButton: true,
      iconColor: '#ef4444'
    });
  },

  // Warning alerts
  warning: (title, text = '') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'Got it!',
      showConfirmButton: true,
      iconColor: '#f59e0b'
    });
  },

  // Info alerts
  info: (title, text = '') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'info',
      confirmButtonText: 'Got it!',
      showConfirmButton: true,
      iconColor: '#3b82f6'
    });
  },

  // Confirmation dialogs
  confirm: (title, text = '', confirmText = 'Yes', cancelText = 'Cancel') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      iconColor: '#8b5cf6'
    });
  },

  // Delete confirmation
  confirmDelete: (itemName = 'this item') => {
    return Swal.fire({
      ...defaultConfig,
      title: 'Delete Confirmation',
      text: `Are you sure you want to delete ${itemName}? This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Keep it safe',
      customClass: {
        ...defaultConfig.customClass,
        confirmButton: 'swal-custom-deny-btn'
      },
      reverseButtons: true,
      iconColor: '#f59e0b'
    });
  },

  // Advanced delete confirmation with custom parameters
  deleteConfirm: (title, text, confirmText = 'Delete', cancelText = 'Cancel') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      customClass: {
        ...defaultConfig.customClass,
        confirmButton: 'swal-custom-deny-btn'
      },
      reverseButtons: true,
      iconColor: '#f59e0b'
    }).then((result) => {
      return result.isConfirmed;
    });
  },

  // Loading alert
  loading: (title = 'Loading...', text = 'Please wait') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  // Close loading
  close: () => {
    Swal.close();
  },

  // Network error
  networkError: () => {
    return Swal.fire({
      ...defaultConfig,
      title: 'Network Error',
      text: 'Please check your internet connection and try again.',
      icon: 'error',
      confirmButtonText: 'Retry'
    });
  },

  // Authentication error
  authError: () => {
    return Swal.fire({
      ...defaultConfig,
      title: 'Authentication Required',
      text: 'Please log in to continue.',
      icon: 'warning',
      confirmButtonText: 'Login',
      showCancelButton: true,
      cancelButtonText: 'Cancel'
    });
  },

  // Permission denied
  permissionDenied: () => {
    return Swal.fire({
      ...defaultConfig,
      title: 'Access Denied',
      text: 'You don\'t have permission to perform this action.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  },

  // Custom toast notifications
  toast: {
    success: (message) => {
      return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'linear-gradient(135deg, #065f46 0%, #059669 50%, #047857 100%)',
        color: '#ffffff',
        iconColor: '#10b981',
        customClass: {
          popup: 'swal2-toast swal2-show'
        }
      });
    },

    error: (message) => {
      return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: message,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #991b1b 100%)',
        color: '#ffffff',
        iconColor: '#ef4444',
        customClass: {
          popup: 'swal2-toast swal2-show'
        }
      });
    },

    warning: (message) => {
      return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: message,
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        background: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #b45309 100%)',
        color: '#ffffff',
        iconColor: '#f59e0b',
        customClass: {
          popup: 'swal2-toast swal2-show'
        }
      });
    },

    info: (message) => {
      return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #1d4ed8 100%)',
        color: '#ffffff',
        iconColor: '#3b82f6',
        customClass: {
          popup: 'swal2-toast swal2-show'
        }
      });
    }
  },

  // Input dialogs
  input: (title, placeholder = '', inputType = 'text') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      input: inputType,
      inputPlaceholder: placeholder,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!';
        }
      }
    });
  },

  // Textarea input
  textarea: (title, placeholder = '') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      input: 'textarea',
      inputPlaceholder: placeholder,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!';
        }
      }
    });
  },

  // Progress bar
  progress: (title, text = '') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      html: `
        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div id="swal-progress" class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
        <div id="swal-progress-text" class="mt-2 text-sm text-gray-600 dark:text-gray-400">0%</div>
      `
    });
  },

  // Update progress
  updateProgress: (percentage) => {
    const progressBar = document.getElementById('swal-progress');
    const progressText = document.getElementById('swal-progress-text');
    if (progressBar && progressText) {
      progressBar.style.width = `${percentage}%`;
      progressText.textContent = `${percentage}%`;
    }
  }
};

export default AlertService;
