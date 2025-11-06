import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild>
            <Link to="/">← Back to Home</Link>
          </Button>
        </div>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p className="text-muted-foreground text-center mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing or using YTB Pulse Pro, you agree to be bound by these Terms of Service 
                and all applicable laws and regulations. If you do not agree with any of these terms, 
                you are prohibited from using or accessing this site.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="mb-4">
                YTB Pulse Pro provides tools and services to help YouTube content creators manage, 
                analyze, and optimize their channels. This includes but is not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>YouTube channel analytics and reporting</li>
                <li>Content scheduling and management tools</li>
                <li>Multi-channel management capabilities</li>
                <li>Performance comparison and insights</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
              <p className="mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Maintaining the security of your account and password</li>
                <li>Ensuring all information you provide is accurate and current</li>
                <li>Complying with YouTube's Terms of Service and Community Guidelines</li>
                <li>Using the service only for lawful purposes</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Prohibited Activities</h2>
              <p className="mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on the intellectual property rights of others</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of our service</li>
                <li>Use the service to distribute spam or malicious content</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <p className="mb-4">
                The service and its original content, features, and functionality are owned by YTB Pulse Pro 
                and are protected by international copyright, trademark, patent, trade secret, and other laws.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account immediately, without prior notice, for any reason, 
                including but not limited to a breach of these Terms.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
              <p className="mb-4">
                The service is provided "as is" and "as available" without any warranties of any kind, 
                either express or implied, including but not limited to the warranties of merchantability, 
                fitness for a particular purpose, and non-infringement.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="mb-4">
                In no event shall YTB Pulse Pro be liable for any indirect, incidental, special, 
                consequential or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify or replace these Terms at any time. 
                We will provide notice of any significant changes by updating the "Last updated" date 
                at the top of this page.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;