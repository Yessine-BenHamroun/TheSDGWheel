import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AlertService from '@/services/alertService';

const SweetAlertDemo = () => {
  const handleSuccess = () => {
    AlertService.success("Success!", "Your action was completed successfully!");
  };

  const handleError = () => {
    AlertService.error("Error Occurred", "Something went wrong. Please try again.");
  };

  const handleWarning = () => {
    AlertService.warning("Warning", "Please review your input before proceeding.");
  };

  const handleInfo = () => {
    AlertService.info("Information", "Here's some useful information for you.");
  };

  const handleConfirm = async () => {
    const result = await AlertService.confirm(
      "Confirm Action", 
      "Are you sure you want to proceed with this action?"
    );
    if (result.isConfirmed) {
      AlertService.toast.success("Action confirmed!");
    }
  };

  const handleDelete = async () => {
    const result = await AlertService.confirmDelete("this important item");
    if (result.isConfirmed) {
      AlertService.toast.success("Item deleted successfully!");
    }
  };

  const handleLoading = async () => {
    AlertService.loading("Processing", "Please wait while we process your request...");
    
    // Simulate async operation
    setTimeout(() => {
      AlertService.close();
      AlertService.success("Complete!", "Your request has been processed successfully!");
    }, 3000);
  };

  const handleInput = async () => {
    const result = await AlertService.input("Enter your name", "What should we call you?");
    if (result.isConfirmed && result.value) {
      AlertService.success("Hello!", `Nice to meet you, ${result.value}!`);
    }
  };

  const handleTextarea = async () => {
    const result = await AlertService.textarea("Share your thoughts", "Tell us what you think...");
    if (result.isConfirmed && result.value) {
      AlertService.success("Thank you!", "We've received your feedback!");
    }
  };

  const handleToastSuccess = () => {
    AlertService.toast.success("Quick success message!");
  };

  const handleToastError = () => {
    AlertService.toast.error("Quick error message!");
  };

  const handleToastWarning = () => {
    AlertService.toast.warning("Quick warning message!");
  };

  const handleToastInfo = () => {
    AlertService.toast.info("Quick info message!");
  };

  const handleNetworkError = () => {
    AlertService.networkError();
  };

  const handleAuthError = () => {
    AlertService.authError();
  };

  const handlePermissionDenied = () => {
    AlertService.permissionDenied();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              SweetAlert2 
            </span>
            <span className="text-white"> Demo</span>
          </h1>
          <p className="text-zinc-400">
            Test all the custom-styled SweetAlert2 components matching The SDG Wheel theme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Alerts */}
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Alerts</CardTitle>
              <CardDescription>Standard alert dialogs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleSuccess} className="w-full bg-green-600 hover:bg-green-700">
                Success Alert
              </Button>
              <Button onClick={handleError} className="w-full bg-red-600 hover:bg-red-700">
                Error Alert
              </Button>
              <Button onClick={handleWarning} className="w-full bg-yellow-600 hover:bg-yellow-700">
                Warning Alert
              </Button>
              <Button onClick={handleInfo} className="w-full bg-blue-600 hover:bg-blue-700">
                Info Alert
              </Button>
            </CardContent>
          </Card>

          {/* Confirmation Dialogs */}
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Confirmations</CardTitle>
              <CardDescription>Interactive confirmation dialogs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleConfirm} className="w-full bg-purple-600 hover:bg-purple-700">
                Confirm Action
              </Button>
              <Button onClick={handleDelete} className="w-full bg-red-600 hover:bg-red-700">
                Delete Confirmation
              </Button>
              <Button onClick={handleLoading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Loading Dialog
              </Button>
            </CardContent>
          </Card>

          {/* Input Dialogs */}
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Input Dialogs</CardTitle>
              <CardDescription>Collect user input</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleInput} className="w-full bg-teal-600 hover:bg-teal-700">
                Text Input
              </Button>
              <Button onClick={handleTextarea} className="w-full bg-cyan-600 hover:bg-cyan-700">
                Textarea Input
              </Button>
            </CardContent>
          </Card>

          {/* Toast Notifications */}
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Toast Notifications</CardTitle>
              <CardDescription>Quick popup messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleToastSuccess} className="w-full bg-green-600 hover:bg-green-700">
                Success Toast
              </Button>
              <Button onClick={handleToastError} className="w-full bg-red-600 hover:bg-red-700">
                Error Toast
              </Button>
              <Button onClick={handleToastWarning} className="w-full bg-yellow-600 hover:bg-yellow-700">
                Warning Toast
              </Button>
              <Button onClick={handleToastInfo} className="w-full bg-blue-600 hover:bg-blue-700">
                Info Toast
              </Button>
            </CardContent>
          </Card>

          {/* Special Alerts */}
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Special Alerts</CardTitle>
              <CardDescription>Pre-configured common scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleNetworkError} className="w-full bg-orange-600 hover:bg-orange-700">
                Network Error
              </Button>
              <Button onClick={handleAuthError} className="w-full bg-red-600 hover:bg-red-700">
                Auth Error
              </Button>
              <Button onClick={handlePermissionDenied} className="w-full bg-gray-600 hover:bg-gray-700">
                Permission Denied
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-400 mb-4">
            All alerts are styled to match The SDG Wheel's dark theme with purple accents
          </p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-zinc-300">Primary Color</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-zinc-800 rounded-full"></div>
              <span className="text-zinc-300">Background</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"></div>
              <span className="text-zinc-300">Accent Gradient</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SweetAlertDemo;
