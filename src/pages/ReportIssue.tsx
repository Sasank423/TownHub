
import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { AlertTriangle, CheckCircle, FileText, Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ReportIssue = () => {
  const { user } = useAuth();
  const [issueData, setIssueData] = useState({
    title: '',
    type: '',
    description: '',
    attachFile: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    if (!issueData.title || !issueData.type || !issueData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Submit the issue (would connect to API in real app)
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Issue reported successfully');
      
      // Reset form after delay
      setTimeout(() => {
        setSubmitted(false);
        setIssueData({
          title: '',
          type: '',
          description: '',
          attachFile: null
        });
      }, 3000);
    }, 1500);
  };
  
  return (
    <DashboardLayout 
      title="Report an Issue" 
      breadcrumbs={[
        { label: 'Dashboard', path: user?.role === 'librarian' ? '/librarian' : '/member' }, 
        { label: 'Report Issue' }
      ]}
    >
      {submitted ? (
        <Card className="shadow-md animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="h-6 w-6 mr-2" />
              Issue Reported
            </CardTitle>
            <CardDescription>
              Thank you for reporting this issue. Our team will review it shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              A confirmation has been sent to your email.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
              >
                Report Another Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Report an Issue</CardTitle>
                <CardDescription>
                  Please provide details about the problem you're experiencing
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Issue Title <span className="text-destructive">*</span></Label>
                  <Input 
                    id="title"
                    placeholder="Brief summary of the issue"
                    value={issueData.title}
                    onChange={(e) => setIssueData({...issueData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="issue-type">Issue Type <span className="text-destructive">*</span></Label>
                  <Select 
                    value={issueData.type}
                    onValueChange={(value) => setIssueData({...issueData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book_damage">Book Damage</SelectItem>
                      <SelectItem value="reservation">Reservation Problem</SelectItem>
                      <SelectItem value="account">Account Issue</SelectItem>
                      <SelectItem value="facility">Facility Maintenance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Detailed Description <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="description"
                    placeholder="Please describe the issue in detail..."
                    rows={5}
                    value={issueData.description}
                    onChange={(e) => setIssueData({...issueData, description: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="file">Attach a File (Optional)</Label>
                  <Input 
                    id="file"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setIssueData({...issueData, attachFile: e.target.files[0]})
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Max file size: 5MB. Supported formats: JPG, PNG, PDF
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIssueData({
                      title: '',
                      type: '',
                      description: '',
                      attachFile: null
                    });
                  }}
                >
                  Clear Form
                </Button>
                
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Issue</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  Common Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  <li className="flex items-center text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Book damage or missing pages
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Problems with reservations
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Login or account access issues
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Facility maintenance requests
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  Submission Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  <li className="flex items-center text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Be specific and concise
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Include date and location when applicable
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Attach screenshots or photos when possible
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Check your email for updates
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReportIssue;
