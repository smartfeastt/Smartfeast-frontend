import { useState } from "react";
import { 
  Bell, 
  Lock, 
  CreditCard, 
  MapPin, 
  Smartphone,
  Mail,
  Globe,
  Shield,
  Trash2,
  Save
} from "react-feather";
import { useAppSelector } from "../../store/hooks.js";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

export default function UserSettings() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState("notifications");
  const [settings, setSettings] = useState({
    notifications: {
      orderUpdates: true,
      promotions: false,
      newsletter: true,
      sms: false,
      push: true
    },
    privacy: {
      profileVisibility: "private",
      dataSharing: false,
      analytics: true,
      locationTracking: false
    },
    preferences: {
      language: "en",
      currency: "INR",
      theme: "light",
      defaultAddress: "",
      defaultPayment: ""
    }
  });

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage or API
    localStorage.setItem("user_settings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Handle account deletion
      alert("Account deletion requested. You will receive a confirmation email.");
    }
  };

  const SettingsSection = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-black' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and privacy settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow p-4">
              <ul className="space-y-2">
                {[
                  { key: "notifications", label: "Notifications", icon: Bell },
                  { key: "privacy", label: "Privacy & Security", icon: Shield },
                  { key: "preferences", label: "Preferences", icon: Globe },
                  { key: "payment", label: "Payment Methods", icon: CreditCard },
                  { key: "addresses", label: "Saved Addresses", icon: MapPin },
                  { key: "account", label: "Account", icon: Lock }
                ].map(({ key, label, icon: Icon }) => (
                  <li key={key}>
                    <button
                      onClick={() => setActiveSection(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                        activeSection === key
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeSection === "notifications" && (
              <SettingsSection title="Notification Preferences">
                <div className="space-y-1">
                  <ToggleSwitch
                    enabled={settings.notifications.orderUpdates}
                    onChange={(value) => handleSettingChange("notifications", "orderUpdates", value)}
                    label="Order Updates"
                    description="Get notified about order status changes"
                  />
                  <ToggleSwitch
                    enabled={settings.notifications.promotions}
                    onChange={(value) => handleSettingChange("notifications", "promotions", value)}
                    label="Promotions & Offers"
                    description="Receive special deals and discounts"
                  />
                  <ToggleSwitch
                    enabled={settings.notifications.newsletter}
                    onChange={(value) => handleSettingChange("notifications", "newsletter", value)}
                    label="Newsletter"
                    description="Weekly updates about new restaurants and features"
                  />
                  <ToggleSwitch
                    enabled={settings.notifications.sms}
                    onChange={(value) => handleSettingChange("notifications", "sms", value)}
                    label="SMS Notifications"
                    description="Receive important updates via text message"
                  />
                  <ToggleSwitch
                    enabled={settings.notifications.push}
                    onChange={(value) => handleSettingChange("notifications", "push", value)}
                    label="Push Notifications"
                    description="Browser notifications for real-time updates"
                  />
                </div>
              </SettingsSection>
            )}

            {activeSection === "privacy" && (
              <SettingsSection title="Privacy & Security">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => handleSettingChange("privacy", "profileVisibility", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <ToggleSwitch
                      enabled={settings.privacy.dataSharing}
                      onChange={(value) => handleSettingChange("privacy", "dataSharing", value)}
                      label="Data Sharing"
                      description="Share anonymized data to improve our services"
                    />
                    <ToggleSwitch
                      enabled={settings.privacy.analytics}
                      onChange={(value) => handleSettingChange("privacy", "analytics", value)}
                      label="Analytics"
                      description="Help us improve by sharing usage analytics"
                    />
                    <ToggleSwitch
                      enabled={settings.privacy.locationTracking}
                      onChange={(value) => handleSettingChange("privacy", "locationTracking", value)}
                      label="Location Tracking"
                      description="Allow location access for better delivery experience"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
                      <Lock size={16} />
                      Change Password
                    </button>
                  </div>
                </div>
              </SettingsSection>
            )}

            {activeSection === "preferences" && (
              <SettingsSection title="App Preferences">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => handleSettingChange("preferences", "language", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.preferences.currency}
                        onChange={(e) => handleSettingChange("preferences", "currency", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                      >
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <div className="flex gap-4">
                      {["light", "dark", "system"].map((theme) => (
                        <label key={theme} className="flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            value={theme}
                            checked={settings.preferences.theme === theme}
                            onChange={(e) => handleSettingChange("preferences", "theme", e.target.value)}
                            className="mr-2"
                          />
                          <span className="capitalize">{theme}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </SettingsSection>
            )}

            {activeSection === "payment" && (
              <SettingsSection title="Payment Methods">
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="text-gray-400" size={24} />
                        <div>
                          <p className="font-medium text-gray-900">•••• •••• •••• 1234</p>
                          <p className="text-sm text-gray-600">Expires 12/25</p>
                        </div>
                      </div>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
                    + Add New Payment Method
                  </button>
                </div>
              </SettingsSection>
            )}

            {activeSection === "addresses" && (
              <SettingsSection title="Saved Addresses">
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <MapPin className="text-gray-400 mt-1" size={20} />
                        <div>
                          <p className="font-medium text-gray-900">Home</p>
                          <p className="text-sm text-gray-600">
                            123 Main Street, Apartment 4B<br />
                            New York, NY 10001
                          </p>
                        </div>
                      </div>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
                    + Add New Address
                  </button>
                </div>
              </SettingsSection>
            )}

            {activeSection === "account" && (
              <SettingsSection title="Account Management">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Account Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="text-gray-900">{user?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member since:</span>
                        <span className="text-gray-900">January 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account type:</span>
                        <span className="text-gray-900">Customer</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-4">Danger Zone</h3>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete Account
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Save size={16} />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
