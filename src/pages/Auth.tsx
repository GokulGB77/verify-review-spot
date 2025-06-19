
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Error signing in',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully signed in.',
          });
          navigate('/');
        }
      } else {
        if (!fullName || !username) {
          toast({
            title: 'Missing information',
            description: 'Please fill in all required fields.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName, username);
        if (error) {
          toast({
            title: 'Error signing up',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account created!',
            description: 'Please check your email to verify your account.',
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: 'Error signing in with Google',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Review Spot
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Sign In' : 'Sign Up'}</CardTitle>
            <CardDescription>
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Fill in your information to create an account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                variant="outline"
                className="w-full"
                type="button"
              >
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required={!isLogin}
                      placeholder="Choose a username"
                    />
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
