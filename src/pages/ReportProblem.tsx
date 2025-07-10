import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertTriangle, Mail, MessageSquare, Send } from 'lucide-react';
import { useCreateProblemReport } from '@/hooks/useProblemReports';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const problemReportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().default('medium'),
  contact_email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
});

type ProblemReportForm = z.infer<typeof problemReportSchema>;

const ReportProblem = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const createProblemReport = useCreateProblemReport();

  const form = useForm<ProblemReportForm>({
    resolver: zodResolver(problemReportSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      contact_email: '',
    },
  });

  const onSubmit = async (data: ProblemReportForm) => {
    try {
      await createProblemReport.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        contact_email: data.contact_email || undefined,
      });
      setIsSubmitted(true);
      form.reset();
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Report Submitted Successfully!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for reporting this issue. We'll review your report and get back to you as soon as possible.
              </p>
              <div className="space-y-3">
                <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full">
                  Submit Another Report
                </Button>
                <Button asChild className="w-full">
                  <a href="/">Return to Homepage</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-foreground">Report a Problem</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Help us improve by reporting any issues you've encountered
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Problem Details
            </CardTitle>
            <CardDescription>
              Please provide as much detail as possible to help us understand and resolve the issue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Brief description of the problem"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bug">Bug/Error</SelectItem>
                          <SelectItem value="ui-ux">UI/UX Issue</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="feature-request">Feature Request</SelectItem>
                          <SelectItem value="account">Account Issues</SelectItem>
                          <SelectItem value="payment">Payment/Billing</SelectItem>
                          <SelectItem value="security">Security Concern</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please describe the problem in detail. Include steps to reproduce, expected behavior, and actual behavior."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Email (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        We'll use this to follow up on your report if needed.
                      </p>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createProblemReport.isPending}
                >
                  {createProblemReport.isPending ? 'Submitting...' : 'Submit Report'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportProblem;