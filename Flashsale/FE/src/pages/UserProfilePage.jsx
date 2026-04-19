import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { User, Mail, Phone, MapPin, Shield, Bell, Loader2, Package } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const UserProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    district: currentUser?.district || '',
    postalCode: currentUser?.postalCode || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    setProfileData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await updateProfile(profileData);
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    const result = await updateProfile({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.error || 'Failed to update password');
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile - MegaSale Store</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* Sidebar */}
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-card border border-border rounded-2xl p-6 text-center mb-6">
                  <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <h2 className="text-xl font-bold">{currentUser?.name}</h2>
                  <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                </div>
                
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <Link to="/orders" className="flex items-center gap-3 p-4 hover:bg-accent transition-colors border-b border-border">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Order History</span>
                  </Link>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8 rounded-xl h-12 bg-card border border-border p-1">
                    <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Profile Info</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Security</TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile">
                    <Card className="border-border rounded-2xl shadow-sm">
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details and shipping address.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="name" value={profileData.name} onChange={handleProfileChange} className="pl-10 rounded-xl text-foreground" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="email" value={currentUser?.email} disabled className="pl-10 rounded-xl bg-muted text-muted-foreground" />
                              </div>
                              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="phone" value={profileData.phone} onChange={handleProfileChange} className="pl-10 rounded-xl text-foreground" placeholder="+1 (555) 000-0000" />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-border">
                            <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="address">Street Address</Label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <Input id="address" value={profileData.address} onChange={handleProfileChange} className="pl-10 rounded-xl text-foreground" placeholder="123 Main St" />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="city">City</Label>
                                  <Input id="city" value={profileData.city} onChange={handleProfileChange} className="rounded-xl text-foreground" placeholder="New York" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="district">State/District</Label>
                                  <Input id="district" value={profileData.district} onChange={handleProfileChange} className="rounded-xl text-foreground" placeholder="NY" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="postalCode">Postal Code</Label>
                                  <Input id="postalCode" value={profileData.postalCode} onChange={handleProfileChange} className="rounded-xl text-foreground" placeholder="10001" />
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button type="submit" disabled={isSubmitting} className="rounded-xl font-semibold">
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Save Changes
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security">
                    <Card className="border-border rounded-2xl shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-primary" />
                          Change Password
                        </CardTitle>
                        <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" type="password" required value={passwordData.currentPassword} onChange={handlePasswordChange} className="rounded-xl text-foreground" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" required value={passwordData.newPassword} onChange={handlePasswordChange} className="rounded-xl text-foreground" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input id="confirmPassword" type="password" required value={passwordData.confirmPassword} onChange={handlePasswordChange} className="rounded-xl text-foreground" />
                          </div>
                          <Button type="submit" disabled={isSubmitting} className="rounded-xl font-semibold mt-4">
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Update Password
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings">
                    <Card className="border-border rounded-2xl shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-primary" />
                          Account Settings
                        </CardTitle>
                        <CardDescription>Manage your preferences and notifications.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Order Updates</Label>
                            <p className="text-sm text-muted-foreground">Receive email notifications about your order status.</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Promotions & Offers</Label>
                            <p className="text-sm text-muted-foreground">Receive emails about new products and sales.</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default UserProfilePage;