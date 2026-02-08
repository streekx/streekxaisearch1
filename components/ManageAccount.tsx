import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, TwoStepAuth, DeviceInfo, PasswordEntry, ThirdPartyConnection } from '../types';
import { supabase } from '../services/supabase';

interface ManageAccountProps {
  user: UserProfile | null;
  onBack: () => void;
  onUpdate: (user: UserProfile) => void;
  onLogout: () => void;
}

const Card = ({ children, title }: { children?: React.ReactNode, title?: string }) => (
  <div className="bg-[#1c1c1e] rounded-[24px] border border-[#2c2c2e] overflow-hidden mb-4">
    {title && <div className="px-5 pt-5 pb-1 text-xl font-bold text-white">{title}</div>}
    <div className="p-5 flex flex-col divide-y divide-[#2c2c2e]">
      {children}
    </div>
  </div>
);

export default function ManageAccount({ user, onBack, onUpdate, onLogout }: ManageAccountProps) {
  const [view, setView] = useState<'MAIN' | 'HOW_TO_SIGNIN' | 'TWO_STEP' | 'DEVICES' | 'CONNECTIONS' | 'SAFE_BROWSING' | 'PASSWORD_MANAGER'>('MAIN');
  
  // Two-Step State
  const [twoStepMethods, setTwoStepMethods] = useState<TwoStepAuth[]>([]);
  const [showAddTwoStep, setShowAddTwoStep] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'authenticator' | 'security_key' | 'phone' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryStreekxId, setRecoveryStreekxId] = useState('');
  const [twoStepEnabled, setTwoStepEnabled] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Devices State
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  
  // Connections State
  const [connections, setConnections] = useState<ThirdPartyConnection[]>([]);
  
  // Password Manager State
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [newPassword, setNewPassword] = useState({ website: '', username: '', password: '' });
  const [showPassword, setShowPassword] = useState<string | null>(null);
  
  // Load real-time data from Supabase
  useEffect(() => {
    if (!user?.id) return;
    
    // Load two-step auth methods
    loadTwoStepMethods();
    // Load devices
    loadDevices();
    // Load connections
    loadConnections();
    // Load passwords
    loadPasswords();
    // Load recovery options
    loadRecoveryOptions();
    
    // Subscribe to real-time updates
    subscribeToRealTimeUpdates();
  }, [user?.id]);
  
  const loadTwoStepMethods = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('two_step_auth')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setTwoStepMethods(data || []);
      setTwoStepEnabled((data || []).length > 0);
    } catch (err) {
      console.log('[v0] Error loading 2FA methods:', err);
    }
  };
  
  const loadDevices = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active', { ascending: false });
      
      if (error) throw error;
      setDevices(data || []);
    } catch (err) {
      console.log('[v0] Error loading devices:', err);
    }
  };
  
  const loadConnections = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('third_party_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('connected_at', { ascending: false });
      
      if (error) throw error;
      setConnections(data || []);
    } catch (err) {
      console.log('[v0] Error loading connections:', err);
    }
  };
  
  const loadPasswords = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('password_manager')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPasswords(data || []);
    } catch (err) {
      console.log('[v0] Error loading passwords:', err);
    }
  };
  
  const loadRecoveryOptions = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('recovery_options')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      // Set recovery ID from data if available
      if (data && data.length > 0) {
        const streekxRecovery = data.find(r => r.type === 'streekx_id');
        if (streekxRecovery) setRecoveryStreekxId(streekxRecovery.value);
      }
    } catch (err) {
      console.log('[v0] Error loading recovery options:', err);
    }
  };
  
  const subscribeToRealTimeUpdates = () => {
    if (!user?.id) return;
    
    // Subscribe to two-step auth changes
    supabase
      .channel(`two_step_auth:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'two_step_auth', filter: `user_id=eq.${user.id}` }, () => {
        loadTwoStepMethods();
      })
      .subscribe();
    
    // Subscribe to device changes
    supabase
      .channel(`devices:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devices', filter: `user_id=eq.${user.id}` }, () => {
        loadDevices();
      })
      .subscribe();
    
    // Subscribe to connection changes
    supabase
      .channel(`connections:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'third_party_connections', filter: `user_id=eq.${user.id}` }, () => {
        loadConnections();
      })
      .subscribe();
    
    // Subscribe to password changes
    supabase
      .channel(`passwords:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'password_manager', filter: `user_id=eq.${user.id}` }, () => {
        loadPasswords();
      })
      .subscribe();
  };
  
  // Add two-step authentication method
  const addTwoStepMethod = async () => {
    if (!user?.id || !selectedMethod) return;
    setLoading(true);
    try {
      // Simulate OTP sending for authentication verification
      if (selectedMethod === 'phone' && recoveryStreekxId) {
        setOtpSent(true);
      } else {
        // For authenticator and security key
        const { error } = await supabase
          .from('two_step_auth')
          .insert({
            user_id: user.id,
            method: selectedMethod,
            identifier: recoveryStreekxId || 'configured',
            verified: selectedMethod === 'authenticator'
          });
        
        if (error) throw error;
        setVerificationCode('');
        setSelectedMethod(null);
        setRecoveryStreekxId('');
        await loadTwoStepMethods();
      }
    } catch (err) {
      console.log('[v0] Error adding 2FA method:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Verify OTP for two-step
  const verifyOTP = async () => {
    if (!user?.id || !verificationCode || !selectedMethod) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('two_step_auth')
        .insert({
          user_id: user.id,
          method: selectedMethod,
          identifier: recoveryStreekxId || verificationCode,
          verified: true
        });
      
      if (error) throw error;
      setOtpSent(false);
      setVerificationCode('');
      setSelectedMethod(null);
      setRecoveryStreekxId('');
      await loadTwoStepMethods();
    } catch (err) {
      console.log('[v0] Error verifying OTP:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add recovery StreekX ID
  const addRecoveryStreekxId = async () => {
    if (!user?.id || !recoveryStreekxId) return;
    setLoading(true);
    try {
      // Check if recovery option already exists
      const { data: existing } = await supabase
        .from('recovery_options')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'streekx_id')
        .single();
      
      if (existing) {
        // Update existing
        await supabase
          .from('recovery_options')
          .update({ value: recoveryStreekxId })
          .eq('user_id', user.id)
          .eq('type', 'streekx_id');
      } else {
        // Insert new
        await supabase
          .from('recovery_options')
          .insert({
            user_id: user.id,
            type: 'streekx_id',
            value: recoveryStreekxId
          });
      }
      await loadRecoveryOptions();
    } catch (err) {
      console.log('[v0] Error adding recovery ID:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Remove two-step method
  const removeTwoStepMethod = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('two_step_auth')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadTwoStepMethods();
    } catch (err) {
      console.log('[v0] Error removing 2FA method:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add password to manager
  const addPassword = async () => {
    if (!user?.id || !newPassword.website || !newPassword.username || !newPassword.password) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('password_manager')
        .insert({
          user_id: user.id,
          website: newPassword.website,
          username: newPassword.username,
          password: newPassword.password
        });
      
      if (error) throw error;
      setShowAddPassword(false);
      setNewPassword({ website: '', username: '', password: '' });
      await loadPasswords();
    } catch (err) {
      console.log('[v0] Error adding password:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete password from manager
  const deletePassword = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('password_manager')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadPasswords();
    } catch (err) {
      console.log('[v0] Error deleting password:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Disconnect third-party app
  const disconnectApp = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('third_party_connections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadConnections();
    } catch (err) {
      console.log('[v0] Error disconnecting app:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out device
  const signOutDevice = async (deviceId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('devices')
        .update({ is_current: false })
        .eq('id', deviceId);
      
      if (error) throw error;
      await loadDevices();
    } catch (err) {
      console.log('[v0] Error signing out device:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- How You Sign In ---
  const HowYouSignInView = () => (
    <div className="h-full bg-[#000000] flex flex-col animate-slide-right">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1c1c1e]">
        <button onClick={() => setView('MAIN')} className="flex items-center text-gray-400 hover:text-white">
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back
        </button>
        <h2 className="font-bold text-lg text-white">How you sign in</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-6">
          {/* Two-Step Verification */}
          <Card title="Two-step verification">
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-bold mb-1">Two-step verification</p>
                  <p className="text-gray-400 text-sm">Add a second layer of security to your account</p>
                </div>
                <div onClick={() => setTwoStepEnabled(!twoStepEnabled)} className={`w-12 h-7 rounded-full p-1 transition-all cursor-pointer ${twoStepEnabled ? 'bg-streekx-primary' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${twoStepEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </div>
              
              {twoStepEnabled && !otpSent && (
                <div className="mt-4 space-y-3">
                  <button onClick={() => setSelectedMethod('authenticator')} className="w-full p-3 rounded-lg bg-[#2c2c2e] hover:bg-[#3c3c3e] text-left text-white font-bold transition-colors">
                    + Add authenticator app
                  </button>
                  <button onClick={() => setSelectedMethod('security_key')} className="w-full p-3 rounded-lg bg-[#2c2c2e] hover:bg-[#3c3c3e] text-left text-white font-bold transition-colors">
                    + Add security key
                  </button>
                  <button onClick={() => setSelectedMethod('phone')} className="w-full p-3 rounded-lg bg-[#2c2c2e] hover:bg-[#3c3c3e] text-left text-white font-bold transition-colors">
                    + Add phone number
                  </button>
                </div>
              )}
              
              {/* Add Method Form */}
              {selectedMethod && !otpSent && (
                <div className="mt-4 p-4 bg-[#1c1c1e] rounded-lg border border-[#2c2c2e] space-y-3">
                  <div>
                    <label className="text-white font-bold text-sm">Add a StreekX ID for verification:</label>
                    <input
                      type="text"
                      placeholder="your-streekx-id"
                      value={recoveryStreekxId}
                      onChange={(e) => setRecoveryStreekxId(e.target.value)}
                      className="w-full mt-2 p-2 bg-[#000000] border border-[#2c2c2e] rounded text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedMethod(null); setRecoveryStreekxId(''); }} className="flex-1 p-2 bg-gray-600 rounded text-white hover:bg-gray-500">Cancel</button>
                    <button onClick={addTwoStepMethod} disabled={loading} className="flex-1 p-2 bg-streekx-primary rounded text-white hover:bg-streekx-primaryLight disabled:opacity-50">
                      {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* OTP Verification */}
              {otpSent && selectedMethod === 'phone' && (
                <div className="mt-4 p-4 bg-[#1c1c1e] rounded-lg border border-[#2c2c2e] space-y-3">
                  <p className="text-gray-400 text-sm">OTP sent to {recoveryStreekxId}'s notifications</p>
                  <input
                    type="text"
                    placeholder="Enter OTP code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full p-2 bg-[#000000] border border-[#2c2c2e] rounded text-white placeholder-gray-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => { setOtpSent(false); setVerificationCode(''); }} className="flex-1 p-2 bg-gray-600 rounded text-white hover:bg-gray-500">Cancel</button>
                    <button onClick={verifyOTP} disabled={loading} className="flex-1 p-2 bg-streekx-primary rounded text-white hover:bg-streekx-primaryLight disabled:opacity-50">
                      {loading ? 'Verifying...' : 'Verify & Add'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Enabled Methods List */}
              {twoStepMethods.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-[#2c2c2e] pt-4">
                  <p className="text-gray-400 text-sm mb-3">Your enabled 2FA methods:</p>
                  {twoStepMethods.map(method => (
                    <div key={method.id} className="flex items-center justify-between p-2 bg-[#1c1c1e] rounded border border-[#2c2c2e]">
                      <span className="text-white text-sm capitalize">{method.method} • {method.identifier}</span>
                      <button onClick={() => removeTwoStepMethod(method.id)} disabled={loading} className="text-red-500 text-sm hover:text-red-400 disabled:opacity-50">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Passkeys & Security Keys */}
          <Card title="Passkeys and security keys">
            <div className="py-4">
              <p className="text-gray-400 text-sm mb-4">Use passkeys or security keys to sign in without your password</p>
              <button className="w-full p-3 rounded-lg bg-streekx-primary hover:bg-streekx-primaryLight text-white font-bold transition-colors">
                + Add passkey or security key
              </button>
            </div>
          </Card>

          {/* Password */}
          <Card title="Password">
            <div className="py-4">
              <p className="text-gray-400 text-sm mb-4">Change your password to keep your account secure</p>
              <button className="w-full p-3 rounded-lg border border-[#2c2c2e] hover:bg-[#2c2c2e] text-white font-bold transition-colors">
                Change password
              </button>
            </div>
          </Card>

          {/* Recovery Phone & Recovery ID */}
          <Card title="Recovery options">
            <div className="py-4 space-y-4">
              <div>
                <p className="text-white font-bold mb-2">Recovery phone</p>
                <p className="text-gray-400 text-sm mb-3">Use this number to recover your account</p>
                <button className="w-full p-3 rounded-lg bg-[#2c2c2e] hover:bg-[#3c3c3e] text-white font-bold transition-colors">
                  Add recovery phone
                </button>
              </div>
              <div className="border-t border-[#2c2c2e] pt-4">
                <p className="text-white font-bold mb-2">Recovery StreekX ID</p>
                <p className="text-gray-400 text-sm mb-3">Add another StreekX ID to recover your account</p>
                {recoveryStreekxId ? (
                  <div className="p-3 bg-streekx-primary/10 border border-streekx-primary rounded-lg text-white">
                    {recoveryStreekxId}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Enter StreekX ID"
                      value={recoveryStreekxId}
                      onChange={(e) => setRecoveryStreekxId(e.target.value)}
                      className="w-full p-3 rounded-lg bg-[#1c1c1e] border border-[#2c2c2e] text-white placeholder-gray-500"
                    />
                    <button onClick={addRecoveryStreekxId} disabled={loading} className="w-full p-2 bg-streekx-primary rounded-lg text-white hover:bg-streekx-primaryLight disabled:opacity-50">
                      {loading ? 'Adding...' : 'Add Recovery ID'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Security Code */}
          <Card title="Security code">
            <div className="py-4">
              <p className="text-gray-400 text-sm mb-4">Your security code helps identify your account</p>
              <div className="p-4 bg-[#2c2c2e] rounded-lg border border-[#3c3c3e]">
                <p className="text-gray-400 text-xs uppercase mb-2">Your Security Code</p>
                <p className="text-white font-bold text-lg font-mono">STREEKX-{user?.id?.slice(0, 8).toUpperCase() || 'XXXX'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  // --- Devices View ---
  const DevicesView = () => (
    <div className="h-full bg-[#000000] flex flex-col animate-slide-right">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1c1c1e]">
        <button onClick={() => setView('MAIN')} className="flex items-center text-gray-400 hover:text-white">
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back
        </button>
        <h2 className="font-bold text-lg text-white">Your devices</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400 text-sm">Show only devices that accessed your account in the past 3 months</p>
            <button className="text-streekx-primary font-bold text-sm hover:text-streekx-primaryLight">Find a lost device</button>
          </div>
          
          {devices.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No devices found. Your devices will appear here when you sign in.</p>
          ) : (
            devices.map(device => (
              <Card key={device.id}>
                <div className="py-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-white font-bold">{device.device_name}</p>
                      {device.is_current && <span className="text-xs bg-streekx-primary text-white px-2 py-0.5 rounded">Current</span>}
                    </div>
                    <p className="text-gray-400 text-sm">{device.browser} • {device.os}</p>
                    <p className="text-gray-500 text-xs mt-1">Last active: {new Date(device.last_active).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => signOutDevice(device.id)} disabled={loading} className="text-gray-500 hover:text-white text-sm disabled:opacity-50">
                    {loading ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              </Card>
            ))
          )}
          
          <button className="w-full p-3 rounded-lg border border-red-600 hover:bg-red-600/10 text-red-600 font-bold transition-colors">
            Sign out all other sessions
          </button>
        </div>
      </div>
    </div>
  );

  // --- Connections View ---
  const ConnectionsView = () => (
    <div className="h-full bg-[#000000] flex flex-col animate-slide-right">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1c1c1e]">
        <button onClick={() => setView('MAIN')} className="flex items-center text-gray-400 hover:text-white">
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back
        </button>
        <h2 className="font-bold text-lg text-white">Your connections</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-4">
          {connections.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No third-party apps connected. Connect apps to see them here.</p>
          ) : (
            connections.map(conn => (
              <Card key={conn.id}>
                <div className="py-4 flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white font-bold mb-1 capitalize">{conn.platform}</p>
                    <p className="text-gray-400 text-sm">{conn.account_email}</p>
                    {conn.account_name && <p className="text-gray-500 text-xs mt-1">Account: {conn.account_name}</p>}
                    {conn.last_used && <p className="text-gray-500 text-xs">Last used: {new Date(conn.last_used).toLocaleDateString()}</p>}
                  </div>
                  <button onClick={() => disconnectApp(conn.id)} disabled={loading} className="text-red-600 hover:text-red-500 font-bold text-sm disabled:opacity-50">
                    {loading ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                </div>
              </Card>
            ))
          )}
          
          <button className="w-full p-3 rounded-lg bg-streekx-primary hover:bg-streekx-primaryLight text-white font-bold transition-colors">
            + Connect a new app
          </button>
        </div>
      </div>
    </div>
  );

  // --- Password Manager View ---
  const PasswordManagerView = () => (
    <div className="h-full bg-[#000000] flex flex-col animate-slide-right">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1c1c1e]">
        <button onClick={() => setView('MAIN')} className="flex items-center text-gray-400 hover:text-white">
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back
        </button>
        <h2 className="font-bold text-lg text-white">Password manager</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-4">
          {passwords.length === 0 && !showAddPassword && (
            <p className="text-gray-400 text-center py-8">No saved passwords. Add your first password below.</p>
          )}
          
          {passwords.map(pwd => (
            <Card key={pwd.id}>
              <div className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white font-bold">{pwd.website}</p>
                    <p className="text-gray-400 text-sm">{pwd.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowPassword(showPassword === pwd.id ? null : pwd.id)}
                      className="text-gray-500 hover:text-white text-xl"
                    >
                      {showPassword === pwd.id ? '🙈' : '👁'}
                    </button>
                    <button onClick={() => deletePassword(pwd.id)} disabled={loading} className="text-red-600 hover:text-red-500 text-sm font-bold disabled:opacity-50">Delete</button>
                  </div>
                </div>
                {showPassword === pwd.id && (
                  <div className="mt-2 p-2 bg-[#2c2c2e] rounded text-gray-300 text-sm font-mono">{pwd.password}</div>
                )}
              </div>
            </Card>
          ))}
          
          {showAddPassword ? (
            <Card>
              <div className="py-4 space-y-3">
                <input
                  type="text"
                  placeholder="Website (e.g., gmail.com)"
                  value={newPassword.website}
                  onChange={(e) => setNewPassword({...newPassword, website: e.target.value})}
                  className="w-full p-3 bg-[#1c1c1e] border border-[#2c2c2e] rounded-lg text-white placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Username or Email"
                  value={newPassword.username}
                  onChange={(e) => setNewPassword({...newPassword, username: e.target.value})}
                  className="w-full p-3 bg-[#1c1c1e] border border-[#2c2c2e] rounded-lg text-white placeholder-gray-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword.password}
                  onChange={(e) => setNewPassword({...newPassword, password: e.target.value})}
                  className="w-full p-3 bg-[#1c1c1e] border border-[#2c2c2e] rounded-lg text-white placeholder-gray-500"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowAddPassword(false)} className="flex-1 p-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600">Cancel</button>
                  <button onClick={addPassword} disabled={loading} className="flex-1 p-2 bg-streekx-primary rounded-lg text-white hover:bg-streekx-primaryLight disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Password'}
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            <button onClick={() => setShowAddPassword(true)} className="w-full p-3 rounded-lg bg-streekx-primary hover:bg-streekx-primaryLight text-white font-bold transition-colors">
              + Add password
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // --- Main View ---
  const MainView = () => (
    <div className="h-full bg-[#000000] flex flex-col animate-slide-right">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1c1c1e]">
        <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white">
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back
        </button>
        <h2 className="font-bold text-lg text-white">Manage your account</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-4">
          <div onClick={() => setView('HOW_TO_SIGNIN')} className="bg-[#1c1c1e] rounded-2xl p-4 border border-[#2c2c2e] cursor-pointer hover:bg-[#2c2c2e] transition-colors">
            <p className="text-white font-bold mb-1">How you sign in to StreekX</p>
            <p className="text-gray-400 text-sm">Manage passwords, security keys, and 2-step verification</p>
          </div>
          
          <div onClick={() => setView('DEVICES')} className="bg-[#1c1c1e] rounded-2xl p-4 border border-[#2c2c2e] cursor-pointer hover:bg-[#2c2c2e] transition-colors">
            <p className="text-white font-bold mb-1">Your devices</p>
            <p className="text-gray-400 text-sm">Manage devices where you're signed in</p>
          </div>
          
          <div onClick={() => setView('CONNECTIONS')} className="bg-[#1c1c1e] rounded-2xl p-4 border border-[#2c2c2e] cursor-pointer hover:bg-[#2c2c2e] transition-colors">
            <p className="text-white font-bold mb-1">Your connections</p>
            <p className="text-gray-400 text-sm">Third-party apps with access to your account</p>
          </div>
          
          <div onClick={() => setView('SAFE_BROWSING')} className="bg-[#1c1c1e] rounded-2xl p-4 border border-[#2c2c2e] cursor-pointer hover:bg-[#2c2c2e] transition-colors">
            <p className="text-white font-bold mb-1">Enhance safe browsing</p>
            <p className="text-gray-400 text-sm">Get security alerts and protection</p>
          </div>
          
          <div onClick={() => setView('PASSWORD_MANAGER')} className="bg-[#1c1c1e] rounded-2xl p-4 border border-[#2c2c2e] cursor-pointer hover:bg-[#2c2c2e] transition-colors">
            <p className="text-white font-bold mb-1">Password manager</p>
            <p className="text-gray-400 text-sm">Manage your saved passwords securely</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {view === 'MAIN' && <MainView />}
      {view === 'HOW_TO_SIGNIN' && <HowYouSignInView />}
      {view === 'DEVICES' && <DevicesView />}
      {view === 'CONNECTIONS' && <ConnectionsView />}
      {view === 'PASSWORD_MANAGER' && <PasswordManagerView />}
    </>
  );
}
