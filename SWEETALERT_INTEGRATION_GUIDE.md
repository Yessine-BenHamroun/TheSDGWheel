# SweetAlert2 Integration Guide

## Overview
SweetAlert2 has been integrated throughout The SDG Wheel project to provide beautiful, consistent alerts and confirmations. This guide explains how to use the AlertService and provides patterns for all scenarios.

## AlertService Usage

### Import
```javascript
import AlertService from '@/services/alertService'
```

### Available Methods

#### Success Messages
```javascript
AlertService.success("Title", "Description");
AlertService.toast.success("Short message");
```

#### Error Messages
```javascript
AlertService.error("Title", "Description");
AlertService.toast.error("Short message");
```

#### Warning Messages
```javascript
AlertService.warning("Title", "Description");
AlertService.toast.warning("Short message");
```

#### Info Messages
```javascript
AlertService.info("Title", "Description");
AlertService.toast.info("Short message");
```

#### Loading States
```javascript
AlertService.loading("Title", "Description");
// ... perform async operation ...
AlertService.close(); // Close loading
```

#### Confirmations
```javascript
const result = await AlertService.confirm("Title", "Description", "Yes", "No");
if (result.isConfirmed) {
    // User clicked Yes
}
```

#### Delete Confirmations
```javascript
const result = await AlertService.confirmDelete("this item");
if (result.isConfirmed) {
    // Proceed with deletion
}
```

#### Input Dialogs
```javascript
const result = await AlertService.input("Enter value", "Placeholder");
if (result.isConfirmed) {
    const value = result.value;
}
```

#### Network & Auth Errors
```javascript
AlertService.networkError();
AlertService.authError();
AlertService.permissionDenied();
```

## Implementation Patterns

### 1. Form Submission Pattern
```javascript
const handleSubmit = async (formData) => {
    try {
        AlertService.loading("Processing", "Please wait...");
        
        const response = await api.submitData(formData);
        
        AlertService.close();
        AlertService.success("Success!", "Data saved successfully");
        
        // Handle success (redirect, update state, etc.)
        
    } catch (error) {
        AlertService.close();
        
        if (error.message.includes('validation')) {
            AlertService.warning("Validation Error", error.message);
        } else if (error.message.includes('network')) {
            AlertService.networkError();
        } else {
            AlertService.error("Failed", error.message || "An error occurred");
        }
    }
};
```

### 2. Delete Operation Pattern
```javascript
const handleDelete = async (item) => {
    const result = await AlertService.confirmDelete(item.name);
    
    if (!result.isConfirmed) return;
    
    try {
        AlertService.loading("Deleting", "Please wait...");
        
        await api.deleteItem(item.id);
        
        AlertService.close();
        AlertService.success("Deleted!", "Item has been removed");
        
        // Update state to remove item
        
    } catch (error) {
        AlertService.close();
        AlertService.error("Delete Failed", error.message);
    }
};
```

### 3. Data Loading Pattern
```javascript
const loadData = async () => {
    try {
        setLoading(true);
        
        const data = await api.getData();
        setData(data);
        
    } catch (error) {
        console.error('Load error:', error);
        AlertService.error("Failed to Load Data", "Unable to retrieve data. Please try again.");
    } finally {
        setLoading(false);
    }
};
```

### 4. Status Update Pattern
```javascript
const handleStatusChange = async (id, newStatus) => {
    try {
        // Optimistic update
        updateLocalState(id, newStatus);
        
        await api.updateStatus(id, newStatus);
        
        AlertService.toast.success(`Status updated to ${newStatus}`);
        
    } catch (error) {
        // Revert optimistic update
        revertLocalState(id);
        
        AlertService.toast.error("Failed to update status");
    }
};
```

### 5. Authentication Pattern
```javascript
const handleLogin = async (credentials) => {
    try {
        AlertService.loading("Signing In", "Authenticating...");
        
        const response = await auth.login(credentials);
        
        AlertService.close();
        AlertService.success("Welcome!", `Good to see you, ${response.user.name}!`);
        
        navigate('/dashboard');
        
    } catch (error) {
        AlertService.close();
        
        if (error.message.includes('401')) {
            AlertService.error("Login Failed", "Invalid credentials");
        } else if (error.message.includes('network')) {
            AlertService.networkError();
        } else {
            AlertService.error("Error", error.message);
        }
    }
};
```

## Components Already Updated

### ✅ Completed
- MessageManagement.jsx - All CRUD operations with SweetAlert
- login.jsx - Authentication with loading and error handling
- register.jsx - Registration with validation and success flows
- contact-form.jsx - Form submission with validation
- api.js - Network error handling
- alertService.js - Complete service implementation

### 🔄 In Progress
- Settings.jsx - Profile updates (import added, functions need updating)
- ProofModeration.jsx - Import added, functions need updating

### 📋 To Do
Apply the same patterns to:
- userDashboard.jsx
- adminDashboard.jsx  
- QuizzChallenge.jsx
- voting.jsx
- wheelGame.jsx
- CommunityFeed.jsx
- ForgotPassword.jsx
- ResetPassword.jsx
- All admin section components

## Quick Update Checklist

For each component:

1. **Add Import**
   ```javascript
   import AlertService from '@/services/alertService'
   ```

2. **Replace toast/alert calls** with SweetAlert equivalents:
   - `toast({title: "Success"})` → `AlertService.success("Title", "Message")`
   - `toast({variant: "destructive"})` → `AlertService.error("Title", "Message")`
   - `confirm("Are you sure?")` → `await AlertService.confirmDelete("item")`

3. **Add loading states** for async operations:
   ```javascript
   AlertService.loading("Processing", "Please wait...");
   // ... async operation ...
   AlertService.close();
   ```

4. **Handle different error types**:
   ```javascript
   catch (error) {
       AlertService.close();
       if (error.message.includes('network')) {
           AlertService.networkError();
       } else {
           AlertService.error("Error", error.message);
       }
   }
   ```

5. **Use toast for quick feedback**:
   ```javascript
   AlertService.toast.success("Quick success message");
   AlertService.toast.error("Quick error message");
   ```

## Best Practices

1. **Always close loading dialogs** in finally blocks or catch blocks
2. **Use appropriate alert types** for different scenarios
3. **Provide meaningful titles and descriptions**
4. **Use toast for non-critical notifications**
5. **Use confirmations for destructive actions**
6. **Handle network errors gracefully**
7. **Show loading states for long operations**

## Testing
After implementing SweetAlert in each component:

1. Test all success scenarios
2. Test all error scenarios  
3. Test network failures
4. Test validation errors
5. Test confirmation dialogs
6. Verify loading states work properly
