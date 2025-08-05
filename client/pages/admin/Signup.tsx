import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function AdminSignup() {
  const { user, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">S2</span>
            </div>
            <span className="font-poppins font-bold text-2xl text-foreground">S2 Wears</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="font-poppins font-bold text-2xl text-foreground">Create Admin Account</h1>
          </div>
          <p className="text-muted-foreground">
            Only authorized emails can create admin accounts
          </p>
        </div>

        {/* Authorization Warning */}
        <Card className="border-0 bg-orange-50 dark:bg-orange-950/20 shadow-soft mb-6">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-800 dark:text-orange-200">Admin Access Restricted</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Admin account creation is limited to pre-authorized email addresses only. Contact the store owner if you need admin access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signup Form */}
        <Card className="border-0 shadow-soft-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-poppins">Sign Up</CardTitle>
            <CardDescription>
              Only pre-authorized email addresses can create admin accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@s2wears.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Already have an account? <Link to="/admin/login" className="text-primary hover:underline">Sign in</Link></p>
              <Link to="/" className="hover:text-primary transition-colors block">
                ← Back to Store
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
